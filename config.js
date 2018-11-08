const path = require('path');

exports.config = {
    appConfig: {
        appSubFiles: [
            {
                name: 'fileManagerHelper',
                className: 'FileManagerHelper',
                file: path.resolve(path.join(__dirname, './lib/fileManagerHelper.js'))
            },
            {
                name: 'uiFormHelper',
                className: 'UiFormHelper',
                file: path.resolve(path.join(__dirname, './lib/uiFormHelper.js'))
            }
        ],
        fileManager: {
            config: {
                thumbnailView: false,
                currentThumbnailSize: 2.5,
                showHiddenFiles: false,
            },
        },
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