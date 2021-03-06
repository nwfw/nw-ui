const _ = require('lodash');
// var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();

exports.component = {
    name: 'object-editor-base',
    template: '',
    props: {
        objectEditorOptions: {
            validator: function (value) {
                let result = false;
                if (_.isObject(value)){
                    result = true;
                }
                return result;
            }
        },
        parentPath: {
            type: String,
            default: '',
        },
        propertyPath: {
            type: String,
            required: true,
        },
    },
    data: function () {
        let defaultPropertyOptions = {
            debug: false,
            isRoot: false,
            viewerMode: {
                enabled: false,
            },
            propagateOptions: true,
            showTypeIndicators: true,
            initialMinimized: false,
            childrenMinimized: false,
            preventMinimize: false,
            renderFieldset: true,
            renderLeftLabels: true,
            renderRootFieldset: true,
            allowRenaming: true,
            allowDeleting: true,
            allowChildDeleting: true,
            allowAdding: true,
            allowCloning: true,
            allowReordering: true,
            forceAllEditable: false,
            allowAddingTypes: [
                'object',
                'array',
                'boolean',
                'number',
                'string',
            ],
            disabledFieldPaths: [],
            readonlyFieldPaths: [],
            hiddenFieldPaths: [],

            viewerDisabledFieldPaths: [],
            viewerReadonlyFieldPaths: [],
            viewerHiddenFieldPaths: [],

            propertyOptionsMap: {}
        };

        let defaultOptions = _.cloneDeep(defaultPropertyOptions);

        let componentOptions = _.defaults(this.objectEditorOptions, defaultOptions);
        let isRoot = false;
        if (componentOptions.isRoot){
            isRoot = true;
        }
        componentOptions.isRoot = false;

        if (componentOptions.viewerMode.enabled && componentOptions.renderFieldset){
            componentOptions.renderFieldset = false;
        }

        return {
            showDebug: false,
            isRoot: isRoot,
            defaultOptions,
            defaultPropertyOptions,
            componentOptions,
        };
    },
    beforeMount () {
        if (this.propertyPath) {
            let propertySettings = this.getPropertySettings(this.propertyPath);
            if (propertySettings && propertySettings.options && _.isObject(propertySettings.options)){
                if (this.componentOptions.propagateOptions) {
                    let newOptions = _.cloneDeep(this.componentOptions);
                    newOptions.viewerMode = this.componentOptions.viewerMode;
                    this.componentOptions = newOptions;
                    this.componentOptions.propagateOptions = false;
                }
                // this.componentOptions = _.defaults(propertySettings.options, this.componentOptions);
                _.mergeWith(this.componentOptions, propertySettings.options, (objValue, srcValue) => {
                    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
                        return srcValue;
                    }
                    return;
                });
            }
        }
    },
    methods: {
        isViewerMode(){
            return (this.componentOptions.viewerMode && this.componentOptions.viewerMode.enabled) ? true : false;
        },
        enableViewerMode(){
            if (!this.componentOptions.viewerMode.enabled) {
                this.componentOptions.viewerMode.enabled = true;
            }
        },
        disableViewerMode(){
            if (this.componentOptions.viewerMode.enabled) {
                this.componentOptions.viewerMode.enabled = false;
            }
        },
        toggleViewerMode(){
            if (this.componentOptions.viewerMode.enabled) {
                this.disableViewerMode();
            } else {
                this.enableViewerMode();
            }
        },
        addingTypeAllowed(type) {
            if (!this.componentOptions.allowAddingTypes.length) {
                return true;
            } else {
                return this.componentOptions.allowAddingTypes.indexOf(type) != -1;
            }
        },
        focusAndSelectElement: function(element, duration = 100) {
            setTimeout(() => {
                if (_.isString(element)) {
                    element = this.$el.querySelector(element);
                }
                if (element && element.focus) {
                    element.focus();
                    if (element.select) {
                        element.select();
                    }
                }
            }, duration);
        },
        toggleShowDebug () {
            this.showDebug = !this.showDebug;
        },
        toggleAllowedAddingType(type) {
            if (this.componentOptions.allowAddingTypes.indexOf(type) == -1){
                this.componentOptions.allowAddingTypes.push(type);
            } else {
                this.componentOptions.allowAddingTypes = _.without(this.componentOptions.allowAddingTypes, type);
            }
        },
        getComponentOptions () {
            if (this.componentOptions.propagateOptions) {
                return this.componentOptions;
            } else {
                let newOptions = _.cloneDeep(this.componentOptions);
                newOptions.viewerMode = this.componentOptions.viewerMode;
                return newOptions;
            }
        },
        getPropertyPath(name) {
            let propertyPath = '';
            if (this.parentPath) {
                propertyPath = this.parentPath + '.';
            }
            propertyPath += name;
            return propertyPath;
        },
        getChildrenParentPath () {
            let childrenParentPath = '';
            if (this.parentPath) {
                childrenParentPath = this.parentPath;
            }
            if (this.name) {
                if (this.parentPath) {
                    childrenParentPath += '.';
                }
                childrenParentPath += this.name;
            } else if (this.index) {
                if (this.parentPath) {
                    childrenParentPath += '[';
                }
                childrenParentPath += this.index;
                if (this.parentPath) {
                    childrenParentPath += ']';
                }
            }
            return childrenParentPath;
        },
        getChildPropertyPath (name) {
            let childPropertyPath = '';
            if (this.parentPath) {
                childPropertyPath = this.parentPath;
                if (_.isNumber(name)){
                    childPropertyPath += '[' + name +']';
                } else {
                    childPropertyPath += '.' + name;
                }
            } else {
                childPropertyPath = name;
            }
            return childPropertyPath;
        },

        isHiddenField(name){
            let result = false;
            let propertyPath = this.getPropertyPath(name);
            if (propertyPath) {
                if (this.isViewerMode()){
                    result = this.componentOptions.viewerHiddenFieldPaths.indexOf(propertyPath) != -1;
                } else {
                    result = this.componentOptions.hiddenFieldPaths.indexOf(propertyPath) != -1;
                }
            }
            return result;
        },
        isReadonlyField (name) {
            let result = false;
            let propertyPath = this.getPropertyPath(name);
            if (propertyPath) {
                if (this.isViewerMode()){
                    result = (this.componentOptions.viewerReadonlyFieldPaths.indexOf(propertyPath) != -1);
                } else {
                    if (!this.componentOptions.forceAllEditable) {
                        result = (this.componentOptions.readonlyFieldPaths.indexOf(propertyPath) != -1);
                    }
                }
            }
            return result;
        },
        isDisabledField (name) {
            let result = false;
            let propertyPath = this.getPropertyPath(name);
            if (propertyPath) {
                if (this.isViewerMode()){
                    result = (this.componentOptions.viewerDisabledFieldPaths.indexOf(propertyPath) != -1);
                } else {
                    if (!this.componentOptions.forceAllEditable) {
                        result = (this.componentOptions.disabledFieldPaths.indexOf(propertyPath) != -1);
                    }
                }
            }
            return result;
        },


        isHidden(){
            let result = false;
            if (this.isViewerMode()){
                result = this.componentOptions.viewerHiddenFieldPaths.indexOf(this.propertyPath) != -1;
            } else {
                result = this.componentOptions.hiddenFieldPaths.indexOf(this.propertyPath) != -1;
            }
            return result;
        },
        isReadonly () {
            let result = false;
            if (this.propertyPath) {
                if (this.isViewerMode()){
                    result = (this.componentOptions.viewerReadonlyFieldPaths.indexOf(this.propertyPath) != -1);
                } else {
                    if (!this.componentOptions.forceAllEditable) {
                        result = (this.componentOptions.readonlyFieldPaths.indexOf(this.propertyPath) != -1);
                    }
                }
            }
            return result;
        },
        isDisabled () {
            let result = false;
            if (this.propertyPath) {
                if (this.isViewerMode()){
                    result = (this.componentOptions.viewerDisabledFieldPaths.indexOf(this.propertyPath) != -1);
                } else {
                    if (!this.componentOptions.forceAllEditable) {
                        result = (this.componentOptions.disabledFieldPaths.indexOf(this.propertyPath) != -1);
                    }
                }
            }
            return result;
        },
        getPropertySettings(propertyPath) {
            let settings;
            if (this.componentOptions.propertyOptionsMap && this.componentOptions.propertyOptionsMap[propertyPath]){
                settings = this.componentOptions.propertyOptionsMap[propertyPath];
            }
            return settings;
        },
        getPropertyLabel(propertyPath) {
            let label = propertyPath;
            let propertySettings = this.getPropertySettings(propertyPath);
            if (propertySettings) {
                if (propertySettings.label) {
                    label = propertySettings.label;
                    if (!propertySettings.skipTranslate) {
                        label = this.translate(label);
                    }
                }
            }
            return label;
        }
    },
};