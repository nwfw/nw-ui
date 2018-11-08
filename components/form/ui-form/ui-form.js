/**
 * @fileOverview ui-form component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */
const _ = require('lodash');

let _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();
/**
 * Form control component
 *
 * @name ui-form
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
    name: 'ui-form',
    template: '',
    props: {
        formData: {
            type: Object,
            required: true
        },
        noFormTag: {
            type: Boolean,
            required: false,
            default: false
        },
        showFieldTypeIcons: {
            type: Boolean,
            required: false,
            default: false
        },
        allowPropertyAdd: {
            type: Boolean,
            required: false,
            default: true
        },
        allowPropertyRemove: {
            type: Boolean,
            required: false,
            default: true
        },
        allowPropertyEdit: {
            type: Boolean,
            required: false,
            default: true
        },
        onChange: {
            type: Function,
            required: true
        },
        onControlChange: {
            type: Function,
            required: false
        },
        label: {
            type: String,
            default: 'Edit'
        }
    },
    data: function () {
        return {
            identifier: _.uniqueId('ui-form-'),
            addRowActive: false,
            controls: null,
            boundMethods: {
                dataValueChange: this.dataValueChange.bind(this),
                getDataControls: this.getDataControls.bind(this),
                removeRow: this.removeRow.bind(this),
                addRow: this.addRow.bind(this),
                controlChanged: this.controlChanged.bind(this),
            },
            componentMethods: {
                dataValueChange: this.dataValueChange.bind(this),
                getDataControls: this.getDataControls.bind(this),
                removeRow: this.removeRow.bind(this),
                addRow: this.addRow.bind(this),
                controlChanged: this.controlChanged.bind(this),
            }
        };
    },
    created: function() {
        if (!this.formData.formOptions.identifier) {
            this.formData.formOptions.identifier = this.identifier;
        }
        this.controls = this.getDataControls();
        window.uif = this;
    },
    methods: {
        dataValueChange: function(control) {
            if (control && control.path) {
                // let name = control.name;
                let value = control.value;
                if (!_.isUndefined(this.formData) && !_.isUndefined(this.formData.item) && _.isObject(this.formData.item)) {
                    // this.formData.item[name] = value;
                    if (control.type == 'select' && control.multiple && _.isArray(value)) {
                        value = value.join(',');
                    }
                    this.setPropertyValue(control.path, value);
                    this.updateObject();
                }
            } else {
                this.updateObject();
            }
        },
        setPropertyValue: function(propertyPath, propertyValue) {
            _.set(this.formData.item, propertyPath, propertyValue);
            this.changed('change', propertyPath, propertyValue);
        },
        toggleNewRow: function(){
            this.addRowActive = !this.addRowActive;
        },
        addRow: function(newName, newValue = '', parentControl, controlOptions = {}) {
            let propertyPath = newName;
            if (parentControl && parentControl.path) {
                propertyPath = parentControl.path + '.' + newName;
            }
            _appWrapper.app.uiFormHelper.addNewControl(newName, newValue, parentControl, controlOptions, this.formData.item, this.formData.formOptions);
            this.updateObject(true);
            this.changed('add', propertyPath, newValue);
        },
        removeRow: function(propertyPath) {
            if (propertyPath){
                _appWrapper.app.uiFormHelper.removeObjectProperty(this.formData.item, propertyPath);
                this.updateObject(true);
                this.changed('remove', propertyPath, null);
            }
        },
        getDataControls: function(force = false){
            if (!this.controls || force) {
                this.controls = _appWrapper.app.uiFormHelper.getDataControls(this.formData.item, this.formData.formOptions);
            }
            return this.controls;
        },
        changed: function(type, propertyPath, propertyValue) {
            if (this.onChange && _.isFunction(this.onChange)) {
                return this.onChange(type, propertyPath, propertyValue);
            } else {
                return false;
            }
        },
        controlChanged: function(control, oldControl) {
            if (this.onControlChange && _.isFunction(this.onControlChange)){
                this.onControlChange(control, oldControl);
            }
            control.subControls = _appWrapper.app.uiFormHelper.getSubControls(control, this.formData.formOptions);
        },
        updateObject: function(force = false){
            this.controls = this.getDataControls(force);
        }
    }
};