/**
 * @fileOverview ui-form-edit-control component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */
const _ = require('lodash');

let _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();
/**
 * Form control component
 *
 * @name ui-form-edit-control
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
    name: 'ui-form-edit-control',
    template: '',
    props: {
        formData: {
            type: Object,
            required: true
        },
        control: {
            type: Object,
            required: true
        },
        methods: {
            type: Object,
            required: true
        },
        closeHandler: {
            type: Function,
            required: true
        }
    },
    data: function () {
        return {
            typeEditorMethods: {
                setPropertyOptions: this.setPropertyOptions.bind(this),
                setControlSettings: this.setControlSettings.bind(this),
            },
            controlData: {
                controlOptions: {
                    multiple: this.control.multiple,
                },
                wrapperClasses: '',
                options: '',
            },
            previousControl: null,
        };
    },
    created: function(){
        let defaultOptions = _appWrapper.app.uiFormHelper.getDefaultControlObject(this.control.name, this.control.value, this.control.path, this.control);
        let controlOptions = {};
        let controlPath = this.control.path;
        let foundOptions = _.find(this.formData.formOptions.controls, (option) => {
            return option && option.path && option.path == controlPath;
        });
        if (foundOptions) {
            controlOptions = foundOptions;
        }
        controlOptions = _.defaultsDeep(controlOptions, defaultOptions);
        this.controlData.controlOptions = controlOptions;
        this.controlData.wrapperClasses = controlOptions.wrapperClasses.join(',');
        this.controlData.options = controlOptions.options.join(',');
        this.updatePreviousControl();
    },
    methods: {
        setPropertyOptions: function(options) {
            if (options && _.isArray(options)) {
                this.controlData.options = options.join(',');
            }
            this.controlChanged();
        },
        setControlSettings: function(controlSettings) {
            if (!_.isUndefined(controlSettings.multiple) && controlSettings.multiple != this.controlData.controlOptions.multiple) {
                this.controlData.controlOptions.multiple = controlSettings.multiple;
            }
            this.controlChanged();
        },
        typeChanged: function() {
            let helper = _appWrapper.app.uiFormHelper;
            let oldType = this.control.type;
            let newType = this.controlData.controlOptions.type;
            if (oldType != newType) {
                let controlSettings = helper.getControlSettingsByPath(this.control.path, this.formData.formOptions);
                if (!controlSettings) {
                    controlSettings = helper.getDefaultControlObject(this.control.name, this.control.value, this.control.path);
                    this.formData.formOptions.controls.push(controlSettings);
                }
                if (newType == 'array' && !_.isArray(this.control.value)){
                    this.control.value = [];
                } else if (newType == 'object' && !_.isObject(this.control.value)){
                    this.control.value = {};
                }
                controlSettings.type = newType;
                this.control.type = newType;
                this.update();
            }
        },
        controlChanged: function() {
            let helper = _appWrapper.app.uiFormHelper;
            let formControl = helper.getFormControlByType(this.controlData.controlOptions.type);
            // try to find saved form control settings
            let controlSettings = helper.getControlSettingsByPath(this.control.path, this.formData.formOptions);
            if (!controlSettings) {
                // if there are no saved settings, get default settings for control type and store it
                controlSettings = helper.getDefaultControlObject(this.control.name, this.control.value, this.control.path);
                this.formData.formOptions.controls.push(controlSettings);
            }
            this.controlData.controlOptions.formControl = formControl;
            this.controlData.controlOptions.options = this.controlData.options.split(',');
            this.controlData.controlOptions.wrapperClasses = this.controlData.wrapperClasses.split(',');
            console.log(_.cloneDeep(this.controlData.controlOptions));
            // if (!this.controlData.controlOptions.error) {
            //     this.controlData.controlOptions.rowErrorText = '';
            // }

            // copy local control setup to the control itself
            let optionKeys = Object.keys(this.controlData.controlOptions);
            for (let i=0; i<optionKeys.length; i++) {
                this.control[optionKeys[i]] = this.controlData.controlOptions[optionKeys[i]];
                if (controlSettings) {
                    controlSettings[optionKeys[i]] = this.controlData.controlOptions[optionKeys[i]];
                }
            }
            this.update();
        },
        updatePreviousControl: function(){
            this.previousControl = _.cloneDeep(this.control);
        },
        update: function(){
            this.methods.controlChanged(this.control, _.cloneDeep(this.previousControl));
            this.updatePreviousControl();
            this.refresh();
        },
        refresh: function(){
            this.$parent.controlFieldActive = !this.$parent.controlFieldActive;
            this.$parent.controlFieldActive = !this.$parent.controlFieldActive;
        }
    },
    computed: {
        controlTypes: function() {
            return _appWrapper.app.uiFormHelper.getControlTypes();
        }
    }
};