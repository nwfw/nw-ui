const path = require('path');

exports.config = {
    appConfig: {
        appSubFiles: [
            {
                name: 'fileManagerHelper',
                className: 'FileManagerHelper',
                file: path.resolve(path.join(__dirname, './lib/fileManagerHelper.js'))
            }
        ],
        fileManager: {
            thumbnailView: false,
            currentThumbnailSize: 2.5,
            showHiddenFiles: false,
            scrollTree: true,

            minThumbnailSize: 1,
            maxThumbnailSize: 10,
            thumbnailSizeStep: 0.1,
            operationDelay: 20,
            stepDelay: 5,
            uploadDelay: 300,
            scrollTreeDuration: 600,
            listTimeoutDuration: 100,
            treeTimeoutDuration: 150,
            searchTimeoutDuration: 200,
        }
    },
    configData: {
        ignoreUserConfig: [
            'appConfig.fileManager.operationDelay',
            'appConfig.fileManager.stepDelay',
            'appConfig.fileManager.uploadDelay',
            'appConfig.fileManager.maxThumbnailSize',
            'appConfig.fileManager.minThumbnailSize',
            'appConfig.fileManager.thumbnailSizeStep',
            'appConfig.fileManager.scrollTreeDuration',
            'appConfig.fileManager.listTimeoutDuration',
            'appConfig.fileManager.treeTimeoutDuration',
            'appConfig.fileManager.searchTimeoutDuration',
        ]
    },
    debug: {
        forceDebug: {
            FileManagerHelper: false,
        },
    },

    userMessages: {
        forceUserMessages: {
            FileManagerHelper: false,
        }
    },
};