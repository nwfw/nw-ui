const path = require('path');
exports.globalComponentDir = [
    path.resolve(path.join(__dirname, './components/file-manager')),
    path.resolve(path.join(__dirname, './components/control')),
    path.resolve(path.join(__dirname, './components/ui')),
];
exports.globalComponentMapping = [
    {
        'icon-link-confirm': {
            name: 'icon-link-confirm'
        },
        'autocomplete-text': {
            name: 'autocomplete-text'
        },
        'accordion': {
            name: 'accordion'
        },
        'file-manager': {
            name: 'file-manager',
            components: {
                'file-manager-top': {
                    name: 'file-manager-top',
                    components: {}
                },
                'file-manager-list': {
                    name: 'file-manager-list',
                    components: {
                        'file-manager-list-item': {
                            name: 'file-manager-list-item',
                            components: {
                                'file-manager-item-tools': {
                                    name: 'file-manager-item-tools',
                                    components: {}
                                }
                            }
                        },
                        'file-manager-thumb-item': {
                            name: 'file-manager-thumb-item',
                            components: {
                                'file-manager-item-tools': {
                                    name: 'file-manager-item-tools',
                                    components: {}
                                }
                            }
                        },
                    }
                },
                'file-manager-tree': {
                    name: 'file-manager-tree',
                    components: {
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
                },
                'file-manager-bottom': {
                    name: 'file-manager-bottom',
                    components: {}
                },
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