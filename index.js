const path = require('path');
exports.globalComponentDir = path.resolve(path.join(__dirname, './components/global'));
exports.globalComponentMapping = [
    {
        'file-manager': {
            name: 'file-manager',
            components: {
                'file-manager-top': {
                    name: 'file-manager-top',
                    components: {}
                },
                'file-manager-list-item': {
                    name: 'file-manager-list-item',
                    components: {}
                },
                'file-manager-thumb-item': {
                    name: 'file-manager-thumb-item',
                    components: {}
                },
                'file-manager-tree-item': {
                    name: 'file-manager-tree-item',
                    components: {
                        'file-manager-tree-item': {
                            name: 'file-manager-tree-item',
                            components: {}
                        }
                    }
                }
            }
        }
    }
];

exports.config = require(path.resolve(path.join(__dirname, './config.js'))).config;
exports.translations = {
    'en-US': require(path.resolve(path.join(__dirname, './data/translations/en-US.i18n.js'))).data,
    'sr-Cyrl-RS': require(path.resolve(path.join(__dirname, './data/translations/sr-Cyrl-RS.i18n.js'))).data,
    'sr-Latn-RS': require(path.resolve(path.join(__dirname, './data/translations/sr-Latn-RS.i18n.js'))).data
};