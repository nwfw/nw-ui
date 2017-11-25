// const _ = require('lodash');
// const path = require('path');

var AppBaseClass = require('nw-skeleton').AppBaseClass;

const path = require('path');
const _ = require('lodash');
const commonSubstrings = require('common-substrings');

var _appWrapper;
var appState;

class FileManagerHelper extends AppBaseClass {

    constructor () {
        super();

        _appWrapper = window.getAppWrapper();
        appState = _appWrapper.getAppState();

        this.forceDebug = false;
        this.forceUserMessages = false;

        return this;
    }

    async initialize() {
        let returnValue = true;
        return returnValue;
    }

    async finalize () {
        let returnValue = true;
        return returnValue;
    }

    /**
     * Opens file manager modal component
     *
     * @param  {Object} options Modal options
     * @return {undefined}
     */
    openFileManagerModal (options) {
        let modalHelper = this.getHelper('modal');
        let fmOptions = _.cloneDeep(appState.fileManagerProtoData);
        if (options && _.isObject(options)){
            options = _.merge(fmOptions, options);
        } else {
            options = fmOptions;
        }
        if (options.initialSelectedPaths && !_.isArray(options.initialSelectedPaths)){
            options.initialSelectedPaths = options.initialSelectedPaths.split(',');
        }
        modalHelper.openModal('fileManagerModal', options);
    }


    async getListItem (filePath) {
        let name = path.basename(filePath);
        let extension = _.last(name.split('.'));
        let image = _.includes(['jpg', 'jpeg', 'jpe', 'png', 'gif'], extension.toLowerCase());
        let type = await _appWrapper.fileManager.isDir(filePath) ? 'dir' : 'file';
        let info = _appWrapper.fileManager.getFileInfo(filePath);
        if (!info){
            info = {
                mtimeMs: 0,
                atime: 0,
                mtime: 0,
                ctime: 0,
                birthtime: 0,
                size: 0,
            };
        }
        let identifier = filePath + type + info.mtimeMs;

        let formatHelper = _appWrapper.getHelper('format');
        info.size = formatHelper.formatFileSize(info.size);
        delete info.rdev;
        delete info.dev;
        delete info.blksize;
        delete info.blocks;
        delete info.atimeMs;
        delete info.mtimeMs;
        delete info.ctimeMs;
        delete info.birthtimeMs;
        info.atime = formatHelper.formatTime(info.atime, {}, true);
        info.mtime = formatHelper.formatTime(info.mtime, {}, true);
        info.ctime = formatHelper.formatTime(info.ctime, {}, true);
        info.birthtime = formatHelper.formatTime(info.birthtime, {}, true);

        let file = {
            name: name,
            extension: extension,
            identifier: identifier,
            newName: name,
            path: filePath,
            type: type,
            image: image,
            info: info,
            archive: _.includes(['zip'], extension.toLowerCase()),
        };
        return this.processItem(file);
    }

    getInstanceData (instanceId){
        return appState.fileManagerInstances[instanceId];
    }

    getCachedFileList (instanceId, listPath){
        let data = this.getInstanceData(instanceId);
        if (!listPath){
            listPath = data.fm.currentDir;
        }
        let cachedList = false;
        if (appState.fileManagerInstancesCache[instanceId].cachedFileLists[listPath]){
            cachedList = _.cloneDeep(appState.fileManagerInstancesCache[instanceId].cachedFileLists[listPath]);
        }
        return cachedList;
    }

    setCachedFileList (instanceId, listPath, fileList) {
        let data = this.getInstanceData(instanceId);
        if (!listPath){
            listPath = data.fm.currentDir;
        }
        if (!fileList){
            fileList = data.fm.currentFileList;
        }
        appState.fileManagerInstancesCache[instanceId].cachedFileLists[listPath] = _.cloneDeep(fileList);
    }

    clearCachedFileList (instanceId, listPath) {
        let data = this.getInstanceData(instanceId);
        if (!listPath){
            listPath = data.fm.currentDir;
        }
        delete appState.fileManagerInstancesCache[instanceId].cachedFileLists[listPath];
    }

    deleteCachedFileList (instanceId) {
        appState.fileManagerInstancesCache[instanceId].cachedFileLists = {};
    }

    getCachedTreeData (instanceId, dir){
        if (!dir){
            return false;
        }
        let treeData = false;
        if (appState.fileManagerInstancesCache[instanceId].cachedTreeData[dir]){
            treeData = _.cloneDeep(appState.fileManagerInstancesCache[instanceId].cachedTreeData[dir]);
        }
        return treeData;
    }

    setCachedTreeData (instanceId, dir, treeData) {
        if (dir && treeData){
            appState.fileManagerInstancesCache[instanceId].cachedTreeData[dir] = _.cloneDeep(treeData);
        }
    }

    clearCachedTreeData (instanceId, dir) {
        if (!dir){
            return false;
        }
        delete appState.fileManagerInstancesCache[instanceId].cachedTreeData[dir];
    }

    deleteCachedTreeData (instanceId) {
        appState.fileManagerInstancesCache[instanceId].cachedTreeData = {};
    }

    async createDir(instanceId) {
        let data = this.getInstanceData(instanceId);
        if (!data.fm.createDirDialog){
            data.fm.createDirDialog = true;
            setTimeout(() => {
                let el = data.fm.rootElement.querySelector('.new-dir');
                if (el && el.focus){
                    el.focus();
                }
            }, 100);
        } else {
            if (data.fm.newDir){
                let newDirPath = path.join(data.fm.currentDir, data.fm.newDir);
                if (await _appWrapper.fileManager.fileExists(newDirPath)){
                    this.exitCreateDir(instanceId);
                    _appWrapper.addNotification(_appWrapper.translate('Item with same name already exists'), 'error');
                } else {
                    data.fm.creatingDir = true;
                    let created = await _appWrapper.fileManager.createDirRecursive(newDirPath);
                    if (created){
                        await this.reloadCurrentDir(instanceId);
                        this.exitCreateDir(instanceId);
                        _appWrapper.addNotification(_appWrapper.translate('Directory created'));
                    } else {
                        _appWrapper.addNotification(_appWrapper.translate('Directory creation failed'), 'error');
                        this.exitCreateDir(instanceId);
                    }
                }
            } else {
                data.fm.createDirDialog = false;
            }
        }
    }

    exitCreateDir (instanceId){
        let data = this.getInstanceData(instanceId);
        data.fm.createDirDialog = false;
        data.fm.creatingDir = false;
        data.fm.newDir = null;
    }

    async populateFileList(instanceId, highlightNew, ignoreCache) {
        let data = this.getInstanceData(instanceId);
        let cachedFileList = this.getCachedFileList(instanceId);
        if (!ignoreCache && cachedFileList){
            data.fm.currentFileList = cachedFileList;
            return;
        }

        clearTimeout(data.fm.timeouts.list);
        data.fm.timeouts.list = setTimeout(() => {
            data.fm.fileListBusy = true;
        }, data.fm.settings.listTimeoutDuration);

        let currentList = _.cloneDeep(data.fm.currentFileList);
        // data.fm.currentFileList = [];
        data.fm.fmListProgress.progress = 0;
        data.fm.fmListProgress.title = _appWrapper.translate('Reading file list');
        let fileList = await _appWrapper.fileManager.readDir(data.fm.currentDir);
        let files = [];
        let stepPercent = 100 / fileList.length;
        let allowedExtensions = data.fm.allowedExtensions;
        for (let i=0; i<fileList.length; i++){
            if (!(!data.fm.config.showHiddenFiles && fileList[i].match(/^\./))){
                let addFile = true;
                let filePath = path.join(data.fm.currentDir, fileList[i]);
                let file = await this.getListItem(filePath);
                if (file.type == 'file' && allowedExtensions && allowedExtensions.length){
                    let extension = _.last(fileList[i].split('.'));
                    if (!(_.includes(allowedExtensions, extension) || _.includes(allowedExtensions, '.' + extension))){
                        addFile = false;
                    }
                }
                if (addFile){
                    if (!data.fm.settings.listDirectories && file.type == 'dir'){
                        addFile = false;
                    }
                    if (!data.fm.settings.listFiles && file.type == 'file'){
                        addFile = false;
                    }
                }

                if (addFile) {
                    files.push(file);
                }
                data.fm.fmListProgress.info = (i+1) + ' / ' + fileList.length;
                data.fm.fmListProgress.progress += stepPercent;
                if (data.fm.settings.stepDelay){
                    await _appWrapper.wait(data.fm.settings.stepDelay);
                }
            }
        }
        let currentDirList = _.filter(files, (item) => {
            return item.type == 'dir';
        }).sort((a, b) => { return a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });

        let currentFileList = _.filter(files, (item) => {
            return item.type == 'file';
        }).sort((a, b) => { return a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });

        if (data.fm.settings.listDirectories && data.fm.currentDir != data.fm.rootDir){
            currentDirList.unshift(this.getDirUpItem(instanceId));
        }

        data.fm.currentFileList = currentDirList.concat(currentFileList);
        this.setCachedFileList(instanceId);

        data.fm.fmListProgress.progress = Math.floor(data.fm.fmListProgress.progress);

        clearTimeout(data.fm.timeouts.list);
        data.fm.fileListBusy = false;

        if (highlightNew){
            let oldIdentifiers = _.map(currentList, (item) => {
                return item.identifier;
            });
            let newIdentifiers = _.difference(_.map(data.fm.currentFileList, (item) => {
                return item.identifier;
            }), oldIdentifiers);
            for (let i=0; i<newIdentifiers.length; i++){
                let item = this.findListItemIdentifier(instanceId, newIdentifiers[i]);
                if (item){
                    this.highlightItemPath(instanceId, item.path);
                }
            }
        }
    }

    findListItemPath (instanceId, itemPath){
        let data = this.getInstanceData(instanceId);
        return _.find(data.fm.currentFileList, (item) => {
            return item.path == itemPath;
        });
    }

    findListItemIdentifier (instanceId, identifier){
        let data = this.getInstanceData(instanceId);
        return _.find(data.fm.currentFileList, (item) => {
            return item.identifier == identifier;
        });
    }

    async reloadCurrentDir(instanceId){
        let data = this.getInstanceData(instanceId);
        this.clearCachedTreeData(instanceId, data.fm.currentDir);
        await this.updateTree(instanceId);
        await this.populateFileList(instanceId, true, true);
    }

    async loadTree (instanceId){
        let data = this.getInstanceData(instanceId);
        if (data.fm.settings.showTree){
            data.fm.totalDirs = 1;
            data.fm.loadedDirs = 0;
            data.fm.fmTreeProgress.progress = 0;
            data.fm.fmTreeProgress.title = _appWrapper.translate('Loading');
            this.updateTreeProgress(instanceId);
            clearTimeout(data.fm.timeouts.tree);
            data.fm.timeouts.tree = setTimeout(() => {
                data.fm.treeBusy = true;
            }, data.fm.settings.treeTimeoutDuration);
            data.fm.treeData = await this.loadTreeNode(instanceId, data.fm.rootDir, data.fm.currentDir);
            clearTimeout(data.fm.timeouts.tree);
            data.fm.treeBusy = false;
            this.scrollTree(instanceId);
        }
    }

    async updateTree(instanceId){
        let data = this.getInstanceData(instanceId);
        data.fm.treeData = await this.loadTreeNode(instanceId, data.fm.rootDir, data.fm.currentDir);
    }

    scrollTree (instanceId){
        let data = this.getInstanceData(instanceId);
        if (data.fm.settings.scrollTree){
            let treeRoot = data.fm.rootElement.querySelector('.file-manager-tree');
            let activeItem = treeRoot.querySelector('.active-item');
            if (activeItem){
                let scrollTop = activeItem.offsetTop - parseInt(treeRoot.offsetHeight/2, 10);
                _appWrapper.getHelper('html').scrollElementTo(treeRoot, scrollTop, data.fm.settings.scrollTreeDuration);
            }
        }
    }

    async loadTreeNode(instanceId, dir, openPath, ignoreCache){
        let data = this.getInstanceData(instanceId);
        let isDeepData = false;
        let utilHelper = _appWrapper.getHelper('util');
        if (openPath.match(new RegExp(utilHelper.quoteRegex(dir)))){
            isDeepData = true;
        }

        if (!isDeepData && !ignoreCache) {
            let treeData = this.getCachedTreeData(instanceId, dir);
            if (treeData){
                data.fm.loadedDirs++;
                this.updateTreeProgress(instanceId);
                return treeData;
            }
        }
        let treeNode = this.getTreeRoot(dir);
        if (isDeepData){
            let dirChildren = await _appWrapper.fileManager.readDir(dir);
            data.fm.totalDirs += dirChildren.length;
            this.updateTreeProgress(instanceId);
            for (let i=0; i<dirChildren.length; i++){
                let name = dirChildren[i];
                let itemPath = path.join(dir, name);
                let type = await _appWrapper.fileManager.isDir(itemPath) ? 'dir' : 'file';
                if (type == 'dir' && !(!data.fm.config.showHiddenFiles && name.match(/^\./))){
                    let item = await this.loadTreeNode(instanceId, itemPath, openPath, ignoreCache);
                    treeNode.children.push(item);
                    if (data.fm.settings.stepDelay){
                        await _appWrapper.wait(data.fm.settings.stepDelay);
                    }
                } else {
                    data.fm.totalDirs--;
                    this.updateTreeProgress(instanceId);
                }
            }
        }
        if (!isDeepData && ignoreCache) {
            this.setCachedTreeData(instanceId, dir, treeNode);
        }
        data.fm.loadedDirs++;
        this.updateTreeProgress(instanceId);
        return treeNode;
    }


    updateTreeProgress (instanceId){
        let data = this.getInstanceData(instanceId);
        data.fm.fmTreeProgress.info = data.fm.loadedDirs + ' / ' + data.fm.totalDirs;
        data.fm.fmTreeProgress.progress = Math.min(100, Math.floor((data.fm.loadedDirs / data.fm.totalDirs) * 100));
    }

    getTreeRoot (rootPath){
        return {
            name: path.basename(rootPath),
            path: rootPath,
            type: 'dir',
            children: [],
        };
    }

    findTreeItemPath (instanceId, itemPath, treeData){
        let data = this.getInstanceData(instanceId);
        if (!treeData){
            treeData = [data.fm.treeData];
        }
        let foundItem;
        for (let i=0; i<treeData.length; i++){
            if (treeData[i].path == itemPath){
                foundItem = treeData[i];
                break;
            } else if (treeData[i].children && treeData[i].children.length) {
                foundItem = this.findTreeItemPath(instanceId, itemPath, treeData[i].children);
                if (foundItem){
                    break;
                }
            }
        }
        return foundItem;
    }

    async refresh(instanceId, ignoreCache, highlightNew){
        let data = this.getInstanceData(instanceId);
        data.fm.fmBusy = true;
        data.fm.rootElement.querySelector('.file-manager-main').setFixedSize();
        data.fm.relativeCurrentDir = path.join('/', path.relative(path.dirname(data.fm.rootDir), data.fm.currentDir));
        let promises = [];
        if (ignoreCache){
            this.deleteCachedTreeData(instanceId);
            this.deleteCachedFileList(instanceId);
        }
        promises.push(this.loadTree(instanceId));
        promises.push(this.populateFileList(instanceId, false, highlightNew));
        return new Promise((resolve) => {
            Promise.all(promises).then( () => {
                data.fm.rootElement.querySelector('.file-manager-main').unsetFixedSize();
                data.fm.fmBusy = false;
                resolve(true);
            });
        });
    }

    async deleteItem(instanceId, itemPath) {
        let data = this.getInstanceData(instanceId);
        let item = this.findListItemPath(instanceId, itemPath);
        if (item){
            if (!item.confirmed){
                item.confirming = 'delete';
                setTimeout(() => {
                    let el = data.fm.rootElement.querySelector('.item-confirm');
                    if (el && el.focus){
                        el.focus();
                    }
                }, 100);
            } else {
                item.busy = true;
                let deleted = false;
                let isSelected = this.isSelectedItem(instanceId, item);
                let isOnClipboard = this.isOnClipboardItem(instanceId, item);
                if (item.type == 'dir'){
                    deleted = await _appWrapper.fileManager.deleteDir(item.path);
                } else if (item.type == 'file') {
                    deleted = await _appWrapper.fileManager.deleteFile(item.path);
                }
                if (deleted){
                    if (isSelected){
                        this.deselectPath(instanceId, item.path);
                    }
                    if (isOnClipboard){
                        this.removeClipboardPath(instanceId, item.path);
                    }
                    _appWrapper.addNotification(_appWrapper.translate('Item deleted'));
                } else {
                    _appWrapper.addNotification(_appWrapper.translate('Item deleting failed'), 'error');
                }
                await this.reloadCurrentDir(instanceId);
            }
        }
    }

    async renameItem(instanceId, itemPath) {
        let data = this.getInstanceData(instanceId);
        let item = this.findListItemPath(instanceId, itemPath);
        if (item){
            if (!item.renaming){
                for (let i=0; i<data.fm.currentFileList.length; i++){
                    data.fm.currentFileList[i].renaming = false;
                }
                item.renaming = true;
                setTimeout(() => {
                    let el = data.fm.rootElement.querySelector('.item-name-input');
                    if (el && el.focus){
                        el.focus();
                    }
                }, 100);
            } else {
                if (item.name != item.newName){
                    if (!item.confirmed){
                        item.confirming = 'rename';
                        setTimeout(() => {
                            let el = data.fm.rootElement.querySelector('.item-confirm');
                            if (el && el.focus){
                                el.focus();
                            }
                        }, 100);
                    } else {
                        let isSelected = this.isSelectedItem(instanceId, item);
                        let isCopied = this.isCopiedItem(instanceId, item);
                        let isCut = this.isCutItem(instanceId, item);
                        let oldPath = item.path;
                        let newPath;
                        if (item.type == 'dir'){
                            newPath = path.resolve(path.join(path.dirname(oldPath), item.newName));
                        } else {
                            newPath = path.join(path.dirname(oldPath), item.newName);
                        }

                        item.busy = true;
                        item.renaming = false;
                        let result = await _appWrapper.fileManager.rename(oldPath, newPath);
                        if (result){
                            item.name = item.newName;
                            _appWrapper.addNotification(_appWrapper.translate('Item renamed'));
                            await this.deselectPath(instanceId, oldPath);
                            await this.removeClipboardPath(instanceId, oldPath);
                            if (isSelected){
                                await this.selectPath(instanceId, newPath);
                            }
                            if (isCopied){
                                await this.copyItemPath(instanceId, newPath);
                            } else if (isCut){
                                await this.cutItemPath(instanceId, newPath);
                            }
                            await this.reloadCurrentDir(instanceId);
                        } else {
                            item.newName = item.name;
                            _appWrapper.addNotification(_appWrapper.translate('Item renaming failed'), 'error');
                        }
                        item.busy = false;
                        item.confirming = '';
                        item.confirmed = false;

                    }
                } else {
                    this.listItemReset(instanceId, item.path);
                    _appWrapper.addNotification(_appWrapper.translate('Item name left unchanged'));
                }
            }
        }
    }

    isCopiedItem (instanceId, item){
        let data = this.getInstanceData(instanceId);
        return _.find(data.fm.copyItems, (copied) => { return item.path == copied.path; });
    }
    isCutItem (instanceId, item){
        let data = this.getInstanceData(instanceId);
        return _.find(data.fm.cutItems, (cut) => { return item.path == cut.path; });
    }
    isOnClipboardItem (instanceId, item){
        return this.isCopiedItem(instanceId, item) || this.isCutItem(instanceId, item);
    }
    isSelectedItem (instanceId, item){
        let data = this.getInstanceData(instanceId);
        return _.find(data.fm.selectedFiles, (selected) => { return item.path == selected.path; });
    }

    listItemReset (instanceId, itemPath){
        let item = this.findListItemPath(instanceId, itemPath);
        if (item){
            item.busy = false;
            item.renaming = false;
            item.newName = item.name;
            item.confirming = '';
            item.confirmed = false;
            item.clickCount = 0;
        }
    }

    async selectPath (instanceId, itemPath) {
        let data = this.getInstanceData(instanceId);
        if (data.fm.settings.allowSelecting){
            if (!_.find(data.fm.selectedFiles, {path: itemPath})){
                let item = await this.getListItem(itemPath);
                if (item && item.mutable){
                    data.fm.selectedFiles.push(item);
                }
            }
        }
    }

    async deselectPath (instanceId, itemPath) {
        let data = this.getInstanceData(instanceId);
        if (_.find(data.fm.selectedFiles, {path: itemPath})){
            data.fm.selectedFiles = _.filter(data.fm.selectedFiles, (item) => {
                return item.path != itemPath;
            });
        }
    }

    async copyItemPath(instanceId, itemPath) {
        let data = this.getInstanceData(instanceId);
        let item = await this.getListItem(itemPath);
        if (item){
            if (!_.find(data.fm.copyItems, {path: itemPath})){
                data.fm.copyItems.push(item);
                if (_.find(data.fm.cutItems, {path: itemPath})){
                    data.fm.cutItems = _.filter(data.fm.cutItems, (item) => { return item.path != itemPath; });
                }
            }
        }
    }
    async cutItemPath(instanceId, itemPath) {
        let data = this.getInstanceData(instanceId);
        let item = await this.getListItem(itemPath);
        if (item){
            if (!_.find(data.fm.cutItems, {path: itemPath})){
                data.fm.cutItems.push(item);
                if (_.find(data.fm.copyItems, {path: itemPath})){
                    data.fm.copyItems = _.filter(data.fm.copyItems, (item) => { return item.path != itemPath; });
                }
            }
        }
    }

    removeClipboardPath (instanceId, itemPath){
        let data = this.getInstanceData(instanceId);
        if (_.find(data.fm.copyItems, {path: itemPath})){
            data.fm.copyItems = _.filter(data.fm.copyItems, (item) => { return item.path != itemPath; });
        }
        if (_.find(data.fm.cutItems, {path: itemPath})){
            data.fm.cutItems = _.filter(data.fm.cutItems, (item) => { return item.path != itemPath; });
        }
    }

    highlightItemPath (instanceId, itemPath){
        let item = this.findListItemPath(instanceId, itemPath);
        if (item){
            item.highlighted = true;
            setTimeout(() => {
                item.highlighted = false;
            }, 800);
        }
    }

    async deleteMassItems (instanceId) {
        let data = this.getInstanceData(instanceId);
        if (!data.fm.massOperationConfirming){
            data.fm.massOperationConfirming = 'delete';
            setTimeout(() => {
                let el = data.fm.rootElement.querySelector('.item-confirm');
                if (el && el.focus){
                    el.focus();
                }
            }, 100);
        } else {
            if (data.fm.massOperationConfirmed){
                data.fm.massOperationConfirming = '';
                let files = _.cloneDeep(data.fm.selectedFiles);
                let total = files.length;
                let deleted = 0;
                for (let i=0; i<total; i++){
                    let item = files[i];
                    if (item.type == 'dir'){
                        if (await _appWrapper.fileManager.deleteDir(item.path)){
                            deleted++;
                            await this.deselectPath(instanceId, item.path);
                        }
                    } else if (item.type == 'file') {
                        if (await _appWrapper.fileManager.deleteFile(item.path)){
                            deleted++;
                            await this.deselectPath(instanceId, item.path);
                        }
                    }
                    if (data.fm.settings.stepDelay){
                        await _appWrapper.wait(data.fm.settings.stepDelay);
                    }
                }
                if (deleted == 0){
                    _appWrapper.addNotification(_appWrapper.translate('Deleting failed.'), 'error');
                } else if (total < deleted){
                    await this.reloadCurrentDir(instanceId);
                    _appWrapper.addNotification(_appWrapper.translate('Deleted {1} out of {2} items, some items failed.', '', [deleted, total]), 'warning');
                } else if (total == deleted){
                    await this.reloadCurrentDir(instanceId);
                    _appWrapper.addNotification(_appWrapper.translate('Deleted {1} items.', '', [deleted]));
                }
                data.fm.massOperationsVisible = false;
                data.fm.massOperationConfirmed = false;
            }
        }
    }

    async compressItem (instanceId, type, itemPath) {
        if (type == 'file'){
            if (await _appWrapper.fileManager.compressFile(itemPath)){
                await this.populateFileList(instanceId, true, true);
                _appWrapper.addNotification(_appWrapper.translate('Successfully compressed "{1}".', '', [path.basename(itemPath)]), 'info');
            } else {
                _appWrapper.addNotification(_appWrapper.translate('Failed compressing "{1}".', '', [path.basename(itemPath)]), 'error');
            }
        } else if (type == 'dir'){
            if (await _appWrapper.fileManager.compressDir(itemPath)){
                await this.populateFileList(instanceId, true, true);
                _appWrapper.addNotification(_appWrapper.translate('Successfully compressed "{1}".', '', [path.basename(itemPath)]), 'info');
            } else {
                _appWrapper.addNotification(_appWrapper.translate('Failed compressing "{1}".', '', [path.basename(itemPath)]), 'error');
            }
        }
    }

    async uncompressItem (instanceId, type, itemPath) {
        let data = this.getInstanceData(instanceId);
        let item = this.findListItemPath(instanceId, itemPath);
        if (item){
            if (!item.confirmed){
                data.fm.uncompressOverwrite = true;
                item.confirming = 'uncompress';
                setTimeout(() => {
                    let el = data.fm.rootElement.querySelector('.item-confirm');
                    if (el && el.focus){
                        el.focus();
                    }
                }, 100);
            } else if (item.confirmed) {
                item.confirming = '';
                item.confirmed = false;
                let overwrite = data.fm.uncompressOverwrite;
                data.fm.uncompressOverwrite = true;
                if (overwrite){
                    if (await _appWrapper.fileManager.uncompressFile(itemPath)){
                        await _appWrapper.addNotification(_appWrapper.translate('Successfully uncompressed "{1}".', '', [item.name]), 'info');
                    } else {
                        await _appWrapper.addNotification(_appWrapper.translate('Failed uncompressed "{1}".', '', [item.name]), 'error');
                    }
                    await this.refresh(instanceId, true, true);
                } else {
                    let tmpDataDir = path.resolve(path.join(_appWrapper.getConfig('appConfig.tmpDataDir'), item.name.replace(/\.zip$/, '_zip') + '_archive_temp'));
                    await _appWrapper.fileManager.deleteDir(tmpDataDir);
                    await _appWrapper.fileManager.createDirRecursive(tmpDataDir);
                    let result = await _appWrapper.fileManager.uncompressFile(itemPath, tmpDataDir);
                    await _appWrapper.wait(100);
                    if (result){
                        let files = await _appWrapper.fileManager.readDir(tmpDataDir);
                        let omittedFiles = [];
                        for (let i=0; i<files.length; i++){
                            let currentFile = files[i];
                            let targetFilePath = path.join(data.fm.currentDir, currentFile);
                            let currentFilePath = path.join(tmpDataDir, currentFile);
                            if (!await _appWrapper.fileManager.fileExists(targetFilePath)){
                                await _appWrapper.fileManager.rename(currentFilePath, targetFilePath);
                            } else {
                                omittedFiles.push(currentFile);
                            }
                        }
                        await _appWrapper.wait(100);
                        await _appWrapper.fileManager.deleteDir(tmpDataDir);
                        if (!omittedFiles.length){
                            await _appWrapper.addNotification(_appWrapper.translate('Successfully uncompressed "{1}".', '', [item.name]), 'info');
                        } else {
                            await _appWrapper.addNotification(_appWrapper.translate('Skipped {1} existing files.', '', [omittedFiles.length]), 'warning');
                        }
                        await this.refresh(instanceId, true, true);
                    } else {
                        await _appWrapper.fileManager.deleteDir(tmpDataDir);
                        await _appWrapper.addNotification(_appWrapper.translate('Failed uncompressed "{1}".', '', [item.name]), 'error');
                        await this.refresh(instanceId, true, true);
                    }
                }
            }
        }
    }

    async pasteItems (instanceId){
        let data = this.getInstanceData(instanceId);
        let items = this.getClipboardItems(instanceId);
        let itself = _.find(items, (item) => {
            if (item.type == 'file'){
                return path.basename(item.path) == data.fm.currentDir;
            } else if (item.type == 'dir'){
                return path.resolve(path.join(item.path, '..')) == data.fm.currentDir;
            }
        });
        let canPaste = itself ? false : true;
        if (!canPaste){
            _appWrapper.addNotification(_appWrapper.translate('You can not paste "{1}" over itself.', '', [itself.name]), 'error');
        } else {
            let filesToCopy = _.cloneDeep(data.fm.copyItems);
            let copied = 0;
            for (let i=0; i<filesToCopy.length; i++){
                let item = filesToCopy[i];
                if (item.type == 'file'){
                    if (await _appWrapper.fileManager.copyFile(item.path, path.join(data.fm.currentDir, item.name))){
                        copied++;
                        data.fm.copyItems = _.filter(data.fm.copyItems, (copiedItem) => { return copiedItem.path != item.path; });
                    }
                } else if (item.type == 'dir'){
                    if (await _appWrapper.fileManager.copyDirRecursive(item.path, path.join(data.fm.currentDir, item.name))){
                        copied++;
                        data.fm.copyItems = _.filter(data.fm.copyItems, (copiedItem) => { return copiedItem.path != item.path; });
                    }
                }
            }

            let filesToCut = _.cloneDeep(data.fm.cutItems);
            let cut = 0;
            for (let i=0; i<filesToCut.length; i++){
                let item = filesToCut[i];
                if (await _appWrapper.fileManager.rename(item.path, path.join(data.fm.currentDir, item.name))){
                    cut++;
                    data.fm.cutItems = _.filter(data.fm.cutItems, (cutItem) => { return cutItem.path != item.path; });
                }
            }

            let total = filesToCopy.length + filesToCut.length;
            let totalDone = cut + copied;

            if (totalDone == 0){
                _appWrapper.addNotification(_appWrapper.translate('Pasting failed.'), 'error');
            } else if (total < totalDone){
                await this.refresh(instanceId, true);
                _appWrapper.addNotification(_appWrapper.translate('Pasted {1} out of {2} items, some items failed.', '', [totalDone, total]), 'warning');
            } else if (total == totalDone){
                await this.refresh(instanceId, true);
                _appWrapper.addNotification(_appWrapper.translate('Pasted {1} items.', '', [totalDone]));
            }
        }
    }

    getClipboardItems (instanceId){
        let data = this.getInstanceData(instanceId);
        return _.uniq(data.fm.cutItems.concat(data.fm.copyItems));
    }

    async copyMassItems(instanceId) {
        let data = this.getInstanceData(instanceId);
        for (let i=0; i<data.fm.selectedFiles.length; i++){
            let item = data.fm.selectedFiles[i];
            if (!_.find(data.fm.copyItems, {path: item.path})){
                data.fm.copyItems.push(item);
                if (_.find(data.fm.cutItems, {path: item.path})){
                    data.fm.cutItems = _.filter(data.fm.cutItems, (cutItem) => { return cutItem.path != item.path; });
                }
            }
        }
        data.fm.massOperationsVisible = false;
    }

    async cutMassItems(instanceId) {
        let data = this.getInstanceData(instanceId);
        for (let i=0; i<data.fm.selectedFiles.length; i++){
            let item = data.fm.selectedFiles[i];
            if (!_.find(data.fm.cutItems, {path: item.path})){
                data.fm.cutItems.push(item);
                if (_.find(data.fm.copyItems, {path: item.path})){
                    data.fm.copyItems = _.filter(data.fm.copyItems, (copiedItem) => { return copiedItem.path != item.path; });
                }
            }
        }
        data.fm.massOperationsVisible = false;
    }

    async compressMassItems(instanceId) {
        let data = this.getInstanceData(instanceId);
        if (!data.fm.massOperationConfirming){
            data.fm.archiveName = await this.getArchiveName(instanceId);
            data.fm.submenuAutoHide = false;
            data.fm.massOperationConfirming = 'compress';
            setTimeout(() => {
                let el = data.fm.rootElement.querySelector('.archive-name-input');
                if (el && el.focus){
                    el.focus();
                }
            }, 100);
        } else {
            if (data.fm.massOperationConfirmed){
                if (!(data.fm.archiveName || !data.fm.archiveName.match(/\.zip$/))){
                    _appWrapper.addNotification(_appWrapper.translate('You must specify unique and valid archive name'), 'warning', [], false, {immediate: true});
                    data.fm.massOperationConfirmed = false;
                    setTimeout(() => {
                        let el = data.fm.rootElement.querySelector('.archive-name-input');
                        if (el && el.focus){
                            el.focus();
                        }
                    }, 100);
                } else if (_appWrapper.fileManager.fileExists(path.join(data.fm.currentDir, data.fm.archiveName))) {
                    await _appWrapper.addNotification(_appWrapper.translate('Item with same name already exists.', '', []), 'warning');
                    data.fm.massOperationConfirmed = false;
                    setTimeout(() => {
                        let el = data.fm.rootElement.querySelector('.archive-name-input');
                        if (el && el.focus){
                            el.focus();
                        }
                    }, 100);
                } else {
                    data.fm.massOperationConfirming = '';
                    let pathsToArchive = [];
                    let dirPaths = [];

                    for (let i=0; i<data.fm.selectedFiles.length; i++){
                        let item = data.fm.selectedFiles[i];
                        let relativePath = path.relative(data.fm.rootDir, item.path);
                        dirPaths.push(path.dirname(relativePath));
                        pathsToArchive.push(item.path);
                    }
                    let addPaths = true;
                    dirPaths = _.uniq(dirPaths);
                    if (dirPaths.length == 1){
                        addPaths = false;
                    }
                    let commonDirs = [];
                    let commonDir = '';
                    if (addPaths){
                        commonDirs = commonSubstrings.weigh(dirPaths, {
                            minLength: 1,
                            minOccurrence: dirPaths.length,
                        });
                    }
                    if (commonDirs && _.isArray(commonDirs) && commonDirs.length){
                        commonDir = path.join(data.fm.rootDir, commonDirs[0].name);
                    }

                    if (commonDir){
                        let oldPaths = _.cloneDeep(pathsToArchive);
                        pathsToArchive = [];
                        for (let i=0; i<oldPaths.length; i++){
                            pathsToArchive.push(path.relative(commonDir, oldPaths[i]));
                        }
                    }

                    let archivePath = path.join(data.fm.currentDir, data.fm.archiveName);
                    data.fm.archiveName = '';
                    let result = await _appWrapper.fileManager.compressFiles(archivePath, pathsToArchive, commonDir);
                    if (result){
                        await this.populateFileList(instanceId, true, true);
                        await _appWrapper.addNotification(_appWrapper.translate('Successfully compressed {1} items.', '', [pathsToArchive.length]), 'info');
                    } else {
                        await _appWrapper.addNotification(_appWrapper.translate('Failed compressing {1} items.', '', [pathsToArchive.length]), 'error');
                    }
                    data.fm.selectedFiles = [];
                    data.fm.submenuAutoHide = true;
                    data.fm.massOperationsVisible = false;
                    data.fm.massOperationConfirmed = false;
                }
            }
        }
    }

    async getArchiveName(instanceId){
        let data = this.getInstanceData(instanceId);
        let archiveBaseName = 'archive';
        let archiveAppend = 0;
        let archiveExtension = 'zip';
        let archiveName = archiveBaseName + '.' + archiveExtension;
        while (await _appWrapper.fileManager.fileExists(path.join(data.fm.currentDir, archiveName))){
            archiveName = archiveBaseName + '_' + archiveAppend + '.' + archiveExtension;
            archiveAppend++;
        }
        return archiveName;
    }

    async uploadFile (instanceId){
        let data = this.getInstanceData(instanceId);
        data.fm.uploadingPaused = false;
        data.fm.fileExists = false;
        let nextFileIndex = data.fm.uploadedFiles.length;
        let filePath;
        if (data.fm.uploadingFiles[nextFileIndex]){
            filePath = data.fm.uploadingFiles[nextFileIndex];
        }
        if (filePath){
            data.fm.currentUpload = filePath;
            data.fm.currentUploadName = path.basename(filePath);
            let newPath = path.join(data.fm.currentDir, path.basename(filePath));
            let result;
            let doUpload = true;
            let skipUpload = false;
            if (_appWrapper.fileManager.fileExists(newPath)){
                if (!(data.fm.skipConfirmed || data.fm.overwriteConfirmed || data.fm.renameConfirmed)){
                    data.fm.fileExists = true;
                    data.fm.uploadingPaused = true;
                    doUpload = false;
                    return true;
                } else {
                    if (data.fm.overwriteConfirmed){
                        if (!data.fm.uploadConfirmAll){
                            data.fm.overwriteConfirmed = false;
                        }
                        data.fm.fileExists = false;
                        data.fm.uploadingPaused = false;
                        data.fm.skipConfirmed = false;
                        data.fm.renameConfirmed = false;
                        doUpload = true;
                    } else if (data.fm.renameConfirmed){
                        if (!data.fm.uploadConfirmAll){
                            data.fm.renameConfirmed = false;
                        }
                        let counter = 0;
                        while (_appWrapper.fileManager.fileExists(newPath)){
                            counter++;
                            let basename = path.basename(filePath);
                            let extension = _.last(basename.split('.'));
                            let name = _.dropRight(basename.split('.')).join('.');
                            basename = name + '_' + counter + '.' + extension;
                            newPath = path.join(data.fm.currentDir, basename);
                        }
                        data.fm.fileExists = false;
                        data.fm.uploadingPaused = false;
                        data.fm.overwriteConfirmed = false;
                        data.fm.skipConfirmed = false;
                        doUpload = true;
                    } else if (data.fm.skipConfirmed){
                        if (!data.fm.uploadConfirmAll){
                            data.fm.skipConfirmed = false;
                        }
                        doUpload = false;
                        skipUpload = true;
                        data.fm.fileExists = false;
                        data.fm.uploadingPaused = false;
                        data.fm.overwriteConfirmed = false;
                    }
                }
            }
            if (doUpload) {
                if (await _appWrapper.fileManager.isFile(filePath)){
                    result = await _appWrapper.fileManager.copyFile(filePath, newPath);
                } else if (await _appWrapper.fileManager.isDir(filePath)){
                    result = await _appWrapper.fileManager.copyDirRecursive(filePath, newPath);
                }
                if (result) {
                    data.fm.uploadedFiles.push(filePath);
                }
            } else if (skipUpload){
                data.fm.uploadedFiles.push(filePath);
            }
            return result;
        }
    }
    async uploadFiles(instanceId){
        let data = this.getInstanceData(instanceId);
        data.fm.uploading = true;
        while (data.fm.uploadingFiles.length > data.fm.uploadedFiles.length) {
            await this.uploadFile(instanceId);
            if (data.fm.uploadingPaused){
                return;
            }
            if (data.fm.settings.uploadDelay){
                await _appWrapper.wait(data.fm.settings.uploadDelay);
            }
        }
        if (data.fm.settings.operationDelay){
            await _appWrapper.wait(data.fm.settings.operationDelay);
        }
        let total = data.fm.uploadingFiles.length;
        let uploaded = data.fm.uploadedFiles.length;

        if (uploaded == 0){
            _appWrapper.addNotification(_appWrapper.translate('Uploading failed.'), 'error');
        } else if (data.fm.uploadingFiles.length < uploaded){
            await this.populateFileList(instanceId, true, true);
            _appWrapper.addNotification(_appWrapper.translate('Uploaded {1} out of {2} items, some items failed.', '', [uploaded, total]), 'warning');
        } else if (total == uploaded){
            await this.populateFileList(instanceId, true, true);
            _appWrapper.addNotification(_appWrapper.translate('Uploaded {1} items.', '', [uploaded]));
        }
        data.fm.fileExists = false;
        data.fm.uploadingPaused = false;
        data.fm.overwriteConfirmed = false;
        data.fm.skipConfirmed = false;
        data.fm.renameConfirmed = false;
        data.fm.uploadConfirmAll = false;
        data.fm.currentUpload = '';
        data.fm.currentUploadName = '';
        data.fm.uploadingFiles = [];
        data.fm.uploadedFiles = [];
        data.fm.uploading = false;
        data.fm.rootElement.querySelector('.file-manager-uploader-input').value = '';
    }

    canSelect (instanceId){
        let data = this.getInstanceData(instanceId);
        let result = false;
        if (data.fm.settings.allowSelecting){
            if (!(data.fm.settings.maxSelectedItems && data.fm.selectedFiles.length >= data.fm.settings.maxSelectedItems)){
                result = true;
            }
        }
        return result;
    }

    isMaxSelected (instanceId){
        let data = this.getInstanceData(instanceId);
        let result = false;
        if (data.fm.settings.maxSelectedItems && data.fm.selectedFiles.length >= data.fm.settings.maxSelectedItems){
            result = true;
        }
        return result;
    }

    getDirUpItem (instanceId){
        let data = this.getInstanceData(instanceId);
        let itemPath = path.resolve(path.join(data.fm.currentDir, '..'));
        let item = {
            name: '..',
            newName: '..',
            identifier: '..' + itemPath,
            path: itemPath,
            type: 'dir',
            image: false,
            mutable: false,
        };
        return this.processItem(item);
    }

    processItem (item) {
        let itemDefaults = _.cloneDeep(appState.fileManagerProtoData.defaultItem);
        _.defaultsDeep(item, itemDefaults);
        return item;
    }
}
exports.FileManagerHelper = FileManagerHelper;