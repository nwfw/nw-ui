/**
 * @fileOverview file-manager component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

var _appWrapper = window.getAppWrapper();
var appState = _appWrapper.getAppState();

const _ = require('lodash');
const path = require('path');
/**
 * App debug component
 *
 * @name file-manager
 * @memberOf components
 * @property {string}   name        Name of the component
 * @property {string}   template    Component template contents
 * @property {string[]} props       Component properties
 * @property {Function} data        Data function
 * @property {Object}   methods     Component methods
 * @property {Object}   watch       Component watchers
 * @property {Object}   computed    Computed properties
 * @property {Object}   components  Child components
 */
exports.component = {
    name: 'file-manager',
    template: '',
    props: ['options'],
    instanceId: '',
    helper: null,
    data: function () {
        let data = {};
        if (appState.modalData.currentModal && appState.modalData.currentModal.treeData){
            data.fm = appState.modalData.currentModal;
        } else if (this.options && _.isObject(this.options)){
            data.fm = _.merge(_.cloneDeep(appState.fileManagerProtoData), this.options);
        } else {
            data.fm = _.cloneDeep(appState.fileManagerProtoData);
        }
        if (!data.fm.instanceId){
            let instanceKeys = Object.keys(appState.fileManagerInstances);
            if (instanceKeys.length == 0){
                this.instanceId = 1;
            } else {
                this.instanceId = parseInt(_.last(instanceKeys.sort()), 10) + 1;
            }
            data.fm.instanceId = this.instanceId;
        } else {
            this.instanceId = data.fm.instanceId;
        }

        if (!(data.fm.config && _.isObject(data.fm.config))){
            data.fm.config = {};
        }
        data.fm.config = _.defaultsDeep(_appWrapper.getConfig('appConfig.fileManager.config'), data.fm.config);

        appState.fileManagerInstances[this.instanceId] = data;
        appState.fileManagerInstancesCache[this.instanceId] = _.cloneDeep(appState.fileManagerProtoCache);
        return appState.fileManagerInstances[this.instanceId];
    },
    created: async function(){
        this.helper = _appWrapper.app.fileManagerHelper;
        this.fm.fmBusy = true;
        this.fm.timeouts.tree = null;
        this.fm.timeouts.list = null;
        this.fm.timeouts.checkNewNameErrors = null;
        this.fm.timeouts.itemClick = null;
        if (!this.fm.rootDir){
            this.fm.rootDir = path.resolve('/');
        } else {
            this.fm.rootDir = path.resolve(this.fm.rootDir);
        }
        if (!await _appWrapper.fileManager.isDir(this.fm.rootDir)){
            _appWrapper.addNotification(_appWrapper.translate('Could not find root dir, using default'), 'error');
            this.fm.rootDir = path.resolve('/');
        }
        if (!this.fm.currentDir){
            this.fm.currentDir = path.resolve('.');
        } else {
            this.fm.currentDir = path.resolve(this.fm.currentDir);
        }
        if (!await _appWrapper.fileManager.isDir(this.fm.currentDir)){
            _appWrapper.addNotification(_appWrapper.translate('Could not find current dir, using default'), 'error');
            this.fm.currentDir = this.fm.rootDir;
        }
        this.fm.relativeCurrentDir = path.join('/', path.relative(path.dirname(this.fm.rootDir), this.fm.currentDir));

        if (this.fm.initialSelectedItems && this.fm.initialSelectedItems.length){
            this.fm.selectMode = true;
            this.fm.selectedFiles = _.cloneDeep(this.fm.initialSelectedItems);
        } else if (this.fm.initialSelectedPaths && this.fm.initialSelectedPaths.length){
            this.fm.initialSelectedItems = [];
            for (let i=0; i<this.fm.initialSelectedPaths.length; i++){
                let item;
                try {
                    item = await this.helper.getListItem(this.fm.initialSelectedPaths[i]);
                } catch (ex) {
                    _appWrapper.getHelper('fileManager').log('Failed getting pre-selected item data for path "{1}"!', 'warning', [this.fm.initialSelectedPaths[i]]);
                }
                if (item && item.path){
                    this.fm.initialSelectedItems.push(item);
                }
            }
            this.fm.initialSelectedPaths = [];
        }

        if (this.fm.initialSelectedItems && this.fm.initialSelectedItems.length){
            this.fm.selectMode = true;
            this.fm.selectedFiles = _.cloneDeep(this.fm.initialSelectedItems);
        }

        await this.helper.loadTree(this.instanceId);
        if (this.fm.settings.operationDelay){
            await _appWrapper.wait(this.fm.settings.operationDelay);
        }
        await this.helper.populateFileList(this.instanceId);
        if (this.fm.settings.operationDelay){
            await _appWrapper.wait(this.fm.settings.operationDelay);
        }
        this.$nextTick(() => {
            this.fm.fmBusy = false;
        });
    },
    mounted: function(){
        this.fm.rootElement = this.$el;
    },
    updated: function(){
        this.fm.rootElement.querySelector('.current-dir').scrollLeft = 10000;
    },
    destroyed: function(){
        delete appState.fileManagerInstances[this.instanceId];
    },
    methods: {
        getParentDir(){
            let parentDir = false;
            if (this.fm.rootDir != this.fm.currentDir){
                parentDir = path.resolve(path.join(this.fm.currentDir, '../'));
            }
            return parentDir;
        },
        getItemElement: function(element){
            while (element && element.parentNode && element !== document && !element.hasClass('file-manager-item')){
                element = element.parentNode;
            }
            return element;
        },
        getItemElementData: function(element){
            element = this.getItemElement(element);
            let type = element.getAttribute('data-type');
            let itemPath = element.getAttribute('data-path');
            return {
                type,
                itemPath
            };
        },
        selectDir: function(dir){
            if (this.fm.currentDir != dir){
                this.fm.currentDir = dir;
                this.fm.createDirDialog = false;
                this.exitSearch();
            }
        },
        treeItemClick: async function(e, item){
            if (item && item.path){
                this.closeAllSubmenus();
                this.selectDir(item.path);
            }
        },
        itemClick: async function(e, item){
            if (item){
                clearTimeout(this.fm.timeouts.itemClick);
                item.clickCount++;
                this.fm.timeouts.itemClick = setTimeout(() => {
                    this.handleItemClick(e, item);
                }, 50);
            }
        },
        handleItemClick: async function(e, item) {
            clearTimeout(this.fm.timeouts.itemClick);
            if (item && !item.busy){
                if (e.shiftKey){
                    if (this.helper.canSelect(this.instanceId)){
                        let doSelect = item.mutable;
                        if (item.type == 'dir' && !this.fm.settings.allowSelectingDirectories){
                            doSelect = false;
                        } else if (item.type == 'file' && !this.fm.settings.allowSelectingFiles){
                            doSelect = false;
                        }
                        if (doSelect){
                            this.closeAllSubmenus();
                            this.fm.selectMode = true;
                            if (!_.find(this.fm.selectedFiles, {path: item.path})){
                                this.selectPath(item.path);
                            } else {
                                this.deselectPath(item.path);
                            }
                        }
                    } else if (this.helper.isMaxSelected(this.instanceId)){
                        _appWrapper.addNotification(_appWrapper.translate('You can\'t select more than {1} items.', '', [this.fm.settings.maxSelectedItems]), 'warning');
                    }
                    item.clickCount = 0;
                } else {
                    if (item.clickCount >= 2) {
                        item.clickCount = 0;
                        if (item.type == 'dir'){
                            this.closeAllSubmenus();
                            this.selectDir(item.path);
                        } else if (item.type == 'file'){
                            if (this.fm.confirmCallback && _.isFunction(this.fm.confirmCallback)){
                                this.fm.confirmCallback([item]);
                            }
                        }
                    } else {
                        if (this.fm.savingFile && item.type == 'file' && item.name){
                            this.fm.newFileName = item.name;
                        }
                    }
                }
            }
        },
        createDir: async function() {
            return this.helper.createDir(this.instanceId);
        },
        exitCreateDir: function(){
            return this.helper.exitCreateDir(this.instanceId);
        },
        levelUp: function(e){
            if (!e.target.hasClass('disabled-link')){
                let dir = this.getParentDir();
                if (dir){
                    this.fm.currentDir = dir;
                }
            }
        },
        itemConfirm: async function(e){
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                let item = this.helper.findListItemPath(this.instanceId, itemPath);
                if (item && item.confirming){
                    item.confirmed = true;
                    let operation = item.confirming;
                    if (operation){
                        item.confirming = '';
                        return await this[operation + 'Item'](e);
                    }
                }
            }
        },
        itemCancel: function(e){
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                let item = this.helper.findListItemPath(this.instanceId, itemPath);
                if (item && item.confirming){
                    _appWrapper.addNotification(_appWrapper.translate('Operation aborted'));
                    return this.listItemReset(e);
                }
            }
        },
        listItemReset: function(e){
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                return this.helper.listItemReset(this.instanceId, itemPath);
            }
        },
        massItemOperation: async function(e) {
            let operation = e.target.getAttribute('data-operation');
            if (operation){
                return await this[operation + 'MassItems'](e);
            }
        },
        copyMassItems: async function() {
            await this.helper.copyMassItems(this.instanceId);
        },
        cutMassItems: async function() {
            await this.helper.cutMassItems(this.instanceId);
        },

        deleteMassItems: async function() {
            return await this.helper.deleteMassItems(this.instanceId);
        },

        compressMassItems: async function() {
            return await this.helper.compressMassItems(this.instanceId);
        },

        massItemConfirm: async function(){
            let operation = this.fm.massOperationConfirming;
            if (operation){
                this.fm.massOperationConfirmed = true;
                return await this[operation + 'MassItems']();
            }
        },
        massItemCancel: function(){
            this.fm.massOperationConfirming = '';
            this.fm.massOperationConfirmed = false;
            this.fm.submenuAutoHide = true;
            this.fm.massOperationsVisible = false;
        },

        itemOperation: async function(e) {
            let operation = e.target.getAttribute('data-operation');
            if (operation){
                return await this[operation + 'Item'](e);
            }
        },
        deleteItem: async function(e) {
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                return await this.helper.deleteItem(this.instanceId, itemPath);
            }
        },
        renameItem: async function(e) {
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                return await this.helper.renameItem(this.instanceId, itemPath);
            }
        },
        copyItem: async function(e) {
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                await this.copyItemPath(itemPath);
            }
        },
        cutItem: async function(e) {
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                await this.cutItemPath(itemPath);
            }
        },
        compressItem: async function(e) {
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                return await this.helper.compressItem(this.instanceId, type, itemPath);
            }
        },

        uncompressItem: async function(e) {
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                return await this.helper.uncompressItem(this.instanceId, type, itemPath);
            }
        },

        copyItemPath: async function(itemPath) {
            return await this.helper.copyItemPath(this.instanceId, itemPath);
        },
        cutItemPath: async function(itemPath) {
            return await this.helper.cutItemPath(this.instanceId, itemPath);
        },
        findItem: async function(e){
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                let parentDir;
                if (type == 'dir'){
                    parentDir = path.resolve(path.join(itemPath, '..'));
                } else if (type == 'file'){
                    parentDir = path.dirname(itemPath);
                }
                if (parentDir){
                    this.selectDir(parentDir);
                }
            }
        },
        pasteItems: async function(){
            return await this.helper.pasteItems(this.instanceId);
        },
        clearClipboard: function(){
            this.fm.viewClipboardItems = false;
            this.fm.cutItems = [];
            this.fm.copyItems = [];
        },
        getClipboardItems: function(){
            return this.helper.getClipboardItems(this.instanceId);
        },
        removeClipboardItem(e){
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                if (_.find(this.fm.copyItems, {path: itemPath})){
                    this.fm.copyItems = _.filter(this.fm.copyItems, (item) => { return item.path != itemPath; });
                }
                if (_.find(this.fm.cutItems, {path: itemPath})){
                    this.fm.cutItems = _.filter(this.fm.cutItems, (item) => { return item.path != itemPath; });
                }
            }
        },
        removeClipboardPath(itemPath){
            return this.helper.removeClipboardPath(this.instanceId, itemPath);
        },
        isCopiedItem: function(item){
            return this.helper.isCopiedItem(this.instanceId, item);
        },
        isCutItem: function(item){
            return this.helper.isCutItem(this.instanceId, item);
        },
        isOnClipboardItem: function(item){
            return this.helper.isOnClipboardItem(this.instanceId, item);
        },
        isSelectedItem: function(item){
            return this.helper.isSelectedItem(this.instanceId, item);
        },
        getDirUpItem: function(){
            return this.helper.getDirUpItem(this.instanceId);
        },
        uploadFile: async function (){
            return await this.helper.uploadFile(this.instanceId);
        },
        uploadFiles: async function(){
            return await this.helper.uploadFiles(this.instanceId);
        },
        filesChange: async function (e){
            let files = _.get(e, 'target.files');
            if (!(files && files.length)){
                _appWrapper.addNotification(_appWrapper.translate('Nothing to upload.'), 'warning');
            } else {
                this.fm.uploadingFiles = _.map(files, (fileData) => {
                    return fileData.path;
                });
                this.uploadFiles();
            }
        },
        toggleSelectMode: function(){
            this.fm.selectMode = !this.fm.selectMode;
            if (!this.fm.selectMode){
                this.fm.selectedFiles = [];
            }
        },
        selectItem: async function(e) {
            if (this.helper.canSelect(this.instanceId)){
                let {type, itemPath} = this.getItemElementData(e.target);
                if (type && itemPath){
                    let item = await this.helper.getListItem(itemPath);
                    if (item){
                        let doSelect = item.mutable;
                        if (item.type == 'dir' && !this.fm.settings.allowSelectingDirectories){
                            doSelect = false;
                        } else if (item.type == 'file' && !this.fm.settings.allowSelectingFiles){
                            doSelect = false;
                        }
                        if (doSelect){
                            if (!_.find(this.fm.selectedFiles, {path: itemPath})){
                                this.fm.selectedFiles.push(item);
                            } else {
                                this.fm.selectedFiles = _.filter(this.fm.selectedFiles, (item) => {
                                    return item.path != itemPath;
                                });
                            }
                        }
                    }
                }
                if (!this.fm.selectedFiles.length){
                    this.fm.massOperationsVisible = false;
                }
            }
        },
        selectPath: async function(itemPath) {
            return await this.helper.selectPath(this.instanceId, itemPath);
        },
        deselectPath: async function(itemPath) {
            return await this.helper.deselectPath(this.instanceId, itemPath);
        },
        deselectAll: function(){
            this.fm.selectedFiles = [];
        },
        areAllSelected: function(){
            let selected = 0;
            let total = this.fm.currentFileList.length;
            for (let i=0; i<total; i++){
                let item = this.fm.currentFileList[i];
                if (item.mutable){
                    if (_.find(this.fm.selectedFiles, {path: item.path})){
                        selected++;
                    }
                } else {
                    total--;
                }
            }
            return selected >= total;
        },
        toggleSelectAll: function(){
            let allSelected = this.areAllSelected();
            for (let i=0; i<this.fm.currentFileList.length; i++){
                let item = this.fm.currentFileList[i];
                if (item.mutable){
                    if (!allSelected){
                        if (!_.find(this.fm.selectedFiles, {path: item.path})){
                            this.fm.selectedFiles.push(item);
                        }
                    } else {
                        if (_.find(this.fm.selectedFiles, {path: item.path})){
                            this.fm.selectedFiles = _.filter(this.fm.selectedFiles, (selectedItem) => {
                                return item.path != selectedItem.path;
                            });
                        }
                    }
                }
            }
            if (!this.fm.selectedFiles.length){
                this.fm.massOperationsVisible = false;
            }
        },
        confirmOverwrite: function(){
            this.fm.overwriteConfirmed = true;
            this.uploadFiles();
        },
        confirmRename: function(){
            this.fm.renameConfirmed = true;
            this.uploadFiles();
        },
        confirmSkip: function(){
            this.fm.skipConfirmed = true;
            this.uploadFiles();
        },
        cancelUpload: function(){
            this.fm.fileExists = false;
            this.fm.uploadingPaused = false;
            this.fm.overwriteConfirmed = false;
            this.fm.skipConfirmed = false;
            this.fm.renameConfirmed = false;
            this.fm.uploadConfirmAll = false;
            this.fm.currentUpload = '';
            this.fm.currentUploadName = '';
            this.fm.uploadingFiles = [];
            this.fm.uploadedFiles = [];
            this.fm.uploading = false;
            this.fm.rootElement.querySelector('.file-manager-uploader-input').value = '';
            _appWrapper.addNotification(_appWrapper.translate('Upload cancelled.'), 'info');
        },
        refresh: async function(){
            return await this.helper.refresh(this.instanceId);
        },
        reload: async function (){
            return await this.helper.refresh(this.instanceId, true);
        },
        downloadFile: function(e){
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                let item = this.helper.findListItemPath(this.instanceId, itemPath);
                this.fm.downloadingFile = itemPath;
                this.fm.rootElement.querySelector('.download-file-input').setAttribute('nwsaveas', item.name);
                this.fm.rootElement.querySelector('.download-file-input').click();
            }
        },
        doDownloadFile: async function(e){
            let destination = e.target.value;
            let source = this.fm.downloadingFile;
            if (await _appWrapper.fileManager.copyFile(source, destination)){
                _appWrapper.addNotification(_appWrapper.translate('File saved'));
            } else {
                _appWrapper.addNotification(_appWrapper.translate('File saving failed'), 'error');
            }
            this.fm.rootElement.querySelector('.download-file-input').setAttribute('nwsaveas', '');
            this.fm.rootElement.querySelector('.download-file-input').value = '';
        },
        openFile: function(e){
            let {type, itemPath} = this.getItemElementData(e.target);
            if (type && itemPath){
                let item = this.helper.findListItemPath(this.instanceId, itemPath);
                if (item){
                    this.fm.filePreviewOptions = {};
                    let codeExtensions = this.fm.filePreviewExtensionModeMap;
                    let codeExtensionKeys = Object.keys(codeExtensions);
                    let isCode = false;

                    for(let i=0; i<codeExtensionKeys.length; i++){
                        if (_.includes(codeExtensions[codeExtensionKeys[i]], item.extension)){
                            isCode = true;
                            this.fm.filePreviewPath = item.path;
                            this.fm.filePreviewMode = codeExtensionKeys[i];
                            this.fm.filePreviewOptions = {lineNumbers: true};
                            setTimeout(() => {
                                let el = this.fm.rootElement.querySelector('.file-preview-close');
                                if (el && el.focus){
                                    el.focus();
                                }
                            }, 100);
                        }
                    }
                    if (isCode){
                        this.fm.filePreview = true;
                    } else {
                        nw.Shell.openItem(itemPath);
                    }

                }

            }
        },
        getItemIconClass: function(item) {
            let extension = item.extension;
            if (item.type == 'dir' || !item.name.match(/\./)){
                return {};
            } else {
                return {
                    'fa fa-file-archive-o': _.includes(['zip','rar'], extension),
                    'fa fa-file-word-o': _.includes(['doc','docx'], extension),
                    'fa fa-file-code-o': _.includes(['html','htm','js','php','cpp','java','css'], extension),
                    'fa fa-file-image-o': _.includes(['jpg','jpeg','png','bmp','psd','gif'], extension),
                    'fa fa-file-pdf-o': _.includes(['pdf'], extension),
                    'fa fa-file-powerpoint-o': _.includes(['ppt', 'pptx'], extension),
                    'fa fa-file-excel-o': _.includes(['xls', 'xlsx'], extension),
                    'fa fa-file-text-o': _.includes(['txt'], extension),
                    'fa fa-file-video-o': _.includes(['avi','mpg','mpeg','mp4','mov'], extension),
                    'fa fa-file-audio-o': _.includes(['wav','mp3','flac','ogg'], extension),
                };
            }
        },
        zoomImage: function(e){
            let image = e.target.getAttribute('data-image');
            this.fm.imagePreviewSrc = image;
            this.fm.imagePreview = true;
            setTimeout(() => {
                let el = this.fm.rootElement.querySelector('.image-preview-close');
                if (el && el.focus){
                    el.focus();
                }
            }, 100);
        },
        removeImagePreview: function(){
            this.fm.imagePreview = false;
        },
        removeFilePreview: function(){
            this.fm.filePreview = false;
        },
        getThumbFontSize: function(){
            if (this.fm.config.thumbnailView){
                return {
                    'font-size': this.fm.config.currentThumbnailSize + 'rem'
                };
            } else {
                return {};
            }
        },
        getThumbWidth: function(){
            return {
                'width': (this.fm.config.currentThumbnailSize * 3) + 'rem'
            };
        },
        toggleSearch: function(){
            this.fm.search = !this.fm.search;
            if (!this.fm.search){
                this.exitSearch();
            } else {
                setTimeout(() => {
                    let el = this.fm.rootElement.querySelector('.fm-search-input');
                    if (el && el.focus){
                        el.focus();
                    }
                }, 100);
            }
        },
        performSearch: function(){
            clearTimeout(this.fm.timeouts.search);
            this.fm.timeouts.search = setTimeout( () => {
                if (this.fm.searchQuery){
                    this.fm.searchApplied = true;
                } else {
                    this.fm.searchApplied = false;
                }
            }, this.fm.settings.searchTimeoutDuration);
        },
        exitSearch: function() {
            clearTimeout(this.fm.timeouts.search);
            this.fm.search = false;
            this.fm.searchApplied = false;
            this.fm.searchQuery = '';
        },
        getListComponent: function(){
            let component = 'file-manager-list-item';
            if (this.fm.config.thumbnailView){
                component = 'file-manager-thumb-item';
            }
            return component;
        },
        isEligible(file){
            let eligible = true;
            let utilHelper = _appWrapper.getHelper('util');
            if (this.fm.search && this.fm.searchQuery && this.fm.searchApplied){
                eligible = file.name.match(new RegExp(utilHelper.quoteRegex(this.fm.searchQuery), 'i'));
            }
            return eligible;
        },
        configChanged: function(){
            _appWrapper.setConfig('appConfig.fileManager.config', this.fm.config);
        },
        isConfigChanged: function(){
            return !_.isEqual(appState.fileManagerProtoData.config, this.fm.config);
        },
        resetConfig: function(){
            this.fm.config = _.cloneDeep(appState.fileManagerProtoData.config);
            this.configChanged();
        },
        closeAllSubmenus: function(){
            this.fm.settingsOpen = false;
            this.fm.viewClipboardItems = false;
            this.fm.massOperationsVisible = false;
        },
        callConfirmCallback: function(values) {
            let result;
            if (this.fm.confirmCallback && _.isFunction(this.fm.confirmCallback)){
                result = this.fm.confirmCallback(values);
            } else {
                _appWrapper.getHelper('fileManager').log('No confirm callback for file manager "{1}"!', 'warning', [this.instanceId]);
            }
            return result;
        },
        fileManagerConfirm: async function() {
            let result;
            let values = [];
            if (this.fm.savingFile && this.fm.newFileName && !this.hasNewNameErrors()) {
                let filePath = path.join(this.fm.currentDir, this.fm.newFileName);
                let item = await this.helper.getListItem(filePath);
                values.push(item);
                result = this.callConfirmCallback(values);
            } else if (this.fm.selectedFiles.length){
                values = this.fm.selectedFiles;
                result = this.callConfirmCallback(values);
            } else {
                result = this.callConfirmCallback(values);
            }
            return result;
        },
        fileManagerConfirmItem: function(item) {
            let values = [];
            let result;
            if (item && item.path){
                values.push(item);
            }
            if (this.fm.confirmCallback && _.isFunction(this.fm.confirmCallback)){
                result = this.fm.confirmCallback(values);
            } else {
                _appWrapper.getHelper('fileManager').log('No item confirm callback for file manager "{1}"!', 'warning', [this.instanceId]);
            }
            return result;
        },
        checkNewNameErrors: function(){
            clearTimeout(this.fm.timeouts.checkNewNameErrors);
            this.fm.timeouts.checkNewNameErrors = setTimeout(this.hasNewNameErrors, 50);
        },
        hasNewNameErrors: function(){
            let errors = false;
            if (!this.fm.newFileName){
                errors = true;
            } else if (this.fm.newFileNameMatch && !this.fm.newFileName.match(this.fm.newFileNameMatch)){
                errors = true;
            }
            if (errors){
                this.$nextTick(() => {
                    let input = this.$el.querySelector('.file-manager-new-file-name');
                    if (input && input.focus && _.isFunction(input.focus)){
                        input.focus();
                    }
                });
            }
            return errors;
        }
    },
    computed: {
        appState: function(){
            return appState;
        },
        fmTopMethods: function(){
            return {
                deselectAll: this.deselectAll,
                reload: this.reload,
                levelUp: this.levelUp,
                createDir: this.createDir,
                exitCreateDir: this.exitCreateDir,
                toggleSelectMode: this.toggleSelectMode,
                selectItem: this.selectItem,
                areAllSelected: this.areAllSelected,
                toggleSelectAll: this.toggleSelectAll,
                massItemOperation: this.massItemOperation,
                findItem: this.findItem,
                pasteItems: this.pasteItems,
                clearClipboard: this.clearClipboard,
                getClipboardItems: this.getClipboardItems,
                removeClipboardItem: this.removeClipboardItem,
                massItemConfirm: this.massItemConfirm,
                massItemCancel: this.massItemCancel,
                configChanged: this.configChanged,
                isConfigChanged: this.isConfigChanged,
                toggleSearch: this.toggleSearch,
                performSearch: this.performSearch,
                resetConfig: this.resetConfig,
                exitSearch: this.exitSearch,
            };
        },
        fmBottomMethods: function() {
            return {
                filesChange: this.filesChange,
                confirmSkip: this.confirmSkip,
                confirmOverwrite: this.confirmOverwrite,
                confirmRename: this.confirmRename,
                cancelUpload: this.cancelUpload,
            };
        },
        fmNewMethods: function(){
            return {
                checkNewNameErrors: this.checkNewNameErrors,
                hasNewNameErrors: this.hasNewNameErrors,
            };
        },
        fmButtonsMethods: function() {
            return {
                fileManagerConfirm: this.fileManagerConfirm,
            };
        },
        fmTreeMethods: function(){
            return {
                itemClick: this.treeItemClick,
            };
        },
        fmListMethods: function(){
            return {
                getThumbFontSize: this.getThumbFontSize,
                isEligible: this.isEligible,
                getListComponent: this.getListComponent,
                openFile: this.openFile,
                downloadFile: this.downloadFile,
                listItemReset: this.listItemReset,
                itemClick: this.itemClick,
                itemOperation: this.itemOperation,
                itemConfirm: this.itemConfirm,
                itemCancel: this.itemCancel,
                isSelectedItem: this.isSelectedItem,
                isCopiedItem: this.isCopiedItem,
                isCutItem: this.isCutItem,
                isOnClipboardItem: this.isOnClipboardItem,
                getItemIconClass: this.getItemIconClass,
                zoomImage: this.zoomImage,
                getThumbWidth: this.getThumbWidth,
                fileManagerConfirmItem: this.fileManagerConfirmItem,
            };
        }
    },
    watch: {
        'fm.currentDir': async function(){
            await this.refresh();
        },
        'fm.config.showHiddenFiles': async function(){
            await this.refresh();
        },
    }
};