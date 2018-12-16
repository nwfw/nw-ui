const _ = require('lodash');
const ObjectEditorBase = require('../objectEditorBase.js').component;

// var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();

exports.component = {
    name: 'object-editor-debug',
    template: '',
    extends: ObjectEditorBase,
    props: {
        propertyPath: {
            type: String,
            required: false,
            default: '',
        }
    },
    data: function () {
        return {
            originalOptions: _.cloneDeep(this.objectEditorOptions),
            columnCount: 2,
            booleanDebugProperties: [
                'allowRenaming',
                'allowReordering',
                'allowDeleting',
                'allowAdding',
                'allowCloning',
                'preventMinimize',
                'renderRootFieldset',
                'renderFieldset',
                'showTypeIndicators',
                'forceAllEditable',
                'viewerMode.enabled',
            ],
            groups: [],
        };
    },
    beforeMount () {
        let groupCount = Math.floor(this.booleanDebugProperties.length / this.columnCount);
        let lastIndex = groupCount * this.columnCount;
        for (let i=0; i<groupCount; i++){
            let group = [];
            for (let j=0; j<this.columnCount; j++){
                group.push(this.booleanDebugProperties[(i * this.columnCount) + j]);
            }
            this.groups.push(group);
        }
        let lastGroup = [];
        for (let i=lastIndex; i<this.booleanDebugProperties.length; i++){
            lastGroup.push(this.booleanDebugProperties[i]);
        }
        if (lastGroup && lastGroup.length){
            this.groups.push(lastGroup);
        }
    },
    methods: {
        getModel (item) {
            return _.get(this.objectEditorOptions, item);
        },
        valueChanged (item) {
            _.set(this.objectEditorOptions, item, !_.get(this.objectEditorOptions, item));
        },
        reset () {
            let keys = Object.keys(this.originalOptions);
            for (let i=0; i<keys.length; i++){
                if (keys[i] != 'viewerMode' && keys[i] != 'allowAddingTypes') {
                    this.objectEditorOptions[keys[i]] = this.originalOptions[keys[i]];
                }
            }
            this.objectEditorOptions.viewerMode.enabled = this.originalOptions.viewerMode.enabled;
            this.objectEditorOptions.allowAddingTypes = this.originalOptions.allowAddingTypes;
        },
    }
};