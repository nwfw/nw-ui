// const _ = require('lodash');
// const path = require('path');

var AppBaseClass = require('nw-skeleton').AppBaseClass;

const _ = require('lodash');

let _appWrapper;
// let appState;

class UiFormHelper extends AppBaseClass {

    constructor () {
        super();

        _appWrapper = window.getAppWrapper();
        // appState = _appWrapper.getAppState();

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
     * Returns an array of available control types
     *
     * @return {String[]} Control types
     */
    getControlTypes () {
        return [
            'text',
            'textarea',
            'range',
            'checkbox',
            'select',
            'array',
            'hidden',
            'object',
        ];
    }

    /**
     * Returns control object to be used in form-control component
     *
     * @param  {mixed}   value      Value of variable
     * @param  {String}  name       Name of variable
     * @param  {String}  parentPath Parent path for the variable
     * @param  {Object}  options    Object with additional form options
     *
     * @return {Object}             Form control object for the var
     */
    getFormControl (value, name, parentPath = '', formOptions = {}){
        let propertyPath = name;
        if (parentPath) {
            propertyPath = parentPath + '.' + name;
        }
        let controlOptions = {};
        if (formOptions && formOptions.controls && formOptions.controls.length) {
            let foundOptions = _.find(formOptions.controls, (option) => {
                return option && option.path && option.path == propertyPath;
            });
            if (foundOptions) {
                controlOptions = foundOptions;
            }
        }

        let objValue;
        let controlObj = this.getDefaultControlObject(name, value, propertyPath, controlOptions);

        let type;

        if (controlOptions.type){
            type = controlOptions.type;
        } else {
            if (_.isBoolean(value)){
                type = 'checkbox';
            } else if (_.isString(value)){
                type = 'text';
            } else if (_.isArray(value)){
                type = 'array';
            } else if (_.isObject(value) && value instanceof RegExp){
                type = 'text';
            } else if (_.isObject(value)){
                type = 'object';
            } else {
                type = 'text';
            }
        }

        controlObj.formControl = this.getFormControlByType(type);
        controlObj.type = type;

        if (type == 'select') {
            objValue = value;
            if (_.isString(value) && controlOptions.multiple) {
                objValue = value.split(',');
            }
            if (controlOptions.options && controlOptions.options.length) {
                controlObj.options = controlOptions.options;
            } else if (!_.isUndefined(value) && value) {
                controlObj.options = [value];
            } else {
                controlObj.options = [];
            }
            controlObj.value = objValue;
        } else if (type == 'array') {
            objValue = [];
            if (value) {
                if (_.isArray(value)) {
                    objValue = value;
                } else if (_.isString(value)) {
                    objValue = value.split(',');
                }
            }
            controlObj.value = objValue;
            controlObj.subControls = this.getSubControls(controlObj, formOptions);
        } else if (type == 'object') {
            controlObj.subControls = this.getSubControls(controlObj, formOptions);
        }
        return controlObj;
    }

    getSubControls(control, formOptions) {
        let subControls = [];
        let value = control.value;
        let type = control.type;
        let propertyPath = control.path;
        if (type == 'array') {
            if (value) {
                if (_.isString  (value)) {
                    value = value.split(',');
                }
            }
            for (let i=0; i<value.length; i++) {
                let innerName = i;
                let innerValue;
                try {
                    innerValue = value[innerName];
                } catch (ex){
                    innerValue = value[innerName];
                }
                let newSubControl = this.getFormControl(innerValue, innerName, propertyPath, formOptions);
                if (control.readonly && !newSubControl.readonly) {
                    newSubControl.readonly = true;
                }
                if (control.disabled && !newSubControl.disabled) {
                    newSubControl.disabled = true;
                }
                if (control.required && !newSubControl.required) {
                    newSubControl.required = true;
                }
                subControls.push(newSubControl);
            }
        } else if (type == 'object') {
            let keys = _.keys(value);
            for(let i=0; i<keys.length;i++){
                let innerName = keys[i];
                let innerValue;
                try {
                    innerValue = value[innerName];
                } catch (ex){
                    innerValue = value[innerName];
                }
                let newSubControl = this.getFormControl(innerValue, innerName, propertyPath, formOptions);
                if (control.readonly && !newSubControl.readonly) {
                    newSubControl.readonly = true;
                }
                if (control.disabled && !newSubControl.disabled) {
                    newSubControl.disabled = true;
                }
                subControls.push(newSubControl);
            }
        }
        return subControls;
    }

    getFormControlByType (type) {
        let formControl = 'ui-form-control-' + type;
        return formControl;
    }

    getDefaultControlObject (name = '', value, propertyPath = '', controlOptions = {}) {
        let controlValue;
        if (value) {
            controlValue = _.cloneDeep(value);
        }
        let defaultOptions = {
            required: false,
            readonly: false,
            disabled: false,
            multiple: false,
            type: undefined,
            options: [],
            rowErrorText: '',
        };

        if (controlOptions && _.isObject(controlOptions)){
            controlOptions = _.defaultsDeep(controlOptions, defaultOptions);
        } else {
            controlOptions = _.cloneDeep(defaultOptions);
        }

        let controlObject = {
            path: propertyPath,
            wrapperClasses: [],
            readonly: controlOptions.readonly,
            disabled: controlOptions.disabled,
            required: controlOptions.required,
            multiple: controlOptions.multiple,
            rowErrorText: controlOptions.rowErrorText,
            error: false,
            name: name,
            type: controlOptions.type,
            value: controlValue,
            options: controlOptions.options,
            subControls: [],
            controlData: null
        };
        return controlObject;
    }

    getNewControl (name, value = '', parentControl, controlOptions, item, formOptions = {}) {
        let type;
        if (controlOptions && controlOptions.type) {
            type = controlOptions.type;
        }
        if (type == 'object' && !value) {
            value = {};
        }
        let found;
        if (parentControl) {
            found = _.find(parentControl.value, {name: name});
        } else {
            found = _.has(item, name);
        }
        if (!found){
            let propertyPath = name;
            if (parentControl) {
                propertyPath = parentControl.path + '.' + name;
                parentControl.value[name] = value;
            }
            _.set(item, propertyPath, value);
            controlOptions.path = propertyPath;
            let subControlOptionsIndex = _.findIndex(formOptions.controls, {path: propertyPath});
            if (subControlOptionsIndex == -1) {
                formOptions.controls.push(controlOptions);
            } else {
                formOptions.controls[subControlOptionsIndex] = _.defaultsDeep(controlOptions, formOptions.controls[subControlOptionsIndex]);
            }
            if (parentControl) {
                let newSubControl = this.getFormControl(value, name, parentControl.path, formOptions);
                parentControl.subControls.push(newSubControl);
            }
        } else {
            _appWrapper.addNotification('Property with name "{1}" already exists', 'error', [name]);
        }
    }

    addNewControl (name, value = '', parentControl, controlOptions, item, formOptions = {}) {
        let type;
        if (controlOptions && controlOptions.type) {
            type = controlOptions.type;
        }
        if (type == 'object' && !value) {
            value = {};
        }
        let found;
        if (parentControl) {
            found = _.find(parentControl.value, {name: name});
        } else {
            found = _.has(item, name);
        }
        if (!found){
            let propertyPath = name;
            if (parentControl) {
                propertyPath = parentControl.path + '.' + name;
                parentControl.value[name] = value;
            }
            _.set(item, propertyPath, value);
            controlOptions.path = propertyPath;
            let subControlOptionsIndex = _.findIndex(formOptions.controls, {path: propertyPath});
            if (subControlOptionsIndex == -1) {
                formOptions.controls.push(controlOptions);
            } else {
                formOptions.controls[subControlOptionsIndex] = _.defaultsDeep(controlOptions, formOptions.controls[subControlOptionsIndex]);
            }
            if (parentControl) {
                let newSubControl = this.getFormControl(value, name, parentControl.path, formOptions);
                parentControl.subControls.push(newSubControl);
            }
        } else {
            _appWrapper.addNotification('Property with name "{1}" already exists', 'error', [name]);
        }
    }

    /**
     * Returns an array of property name paths for passed variable
     *
     * @param  {Mixed}      obj         Object to get paths for
     * @param  {Boolean}    recursive   Flag to enable/disable recursive / deep operation
     * @param  {String}     startPath   Initial start path for object property
     *
     * @return {String[]}               Paths of object properties
     */
    getObjectPropertyPaths (obj, recursive = true, startPath = '') {
        let validId = /^[a-z_$][a-z0-9_$]*$/i;
        let result = [];
        let startPathName = startPath.replace(/^\./, '');
        if (!_.isUndefined(obj)) {
            if (Array.isArray(obj)) {
                if (startPathName){
                    result.push(startPathName);
                }
                if (recursive || !startPath){
                    for (let i = 0; i < obj.length; i++) {
                        result = _.concat(result, this.getObjectPropertyPaths(obj[i], recursive, startPath + '[' + i + ']'));
                    }
                }
            } else if (_.isObject(obj)) {
                if (startPathName){
                    result.push(startPathName);
                }
                if (recursive || !startPath){
                    let propertyNames = Object.keys(obj);
                    for (let i=0; i<propertyNames.length; i++) {
                        let propertyName = propertyNames[i];
                        if (validId.test(propertyName)) {
                            result = _.concat(result, this.getObjectPropertyPaths(obj[propertyName], recursive, startPath + '.' + propertyName));
                        } else {
                            result = _.concat(result, this.getObjectPropertyPaths(obj[propertyName], recursive, startPath + '["' + propertyName + '"]'));
                        }
                    }
                }
            } else {
                if (startPathName){
                    result.push(startPathName);
                }
            }
        } else {
            if (startPathName){
                result.push(startPathName);
            }
        }
        return _.compact(result);
    }

    getDataControls (item, formOptions = {formIdentifier: '', controls: []}) {
        let propertyNames = [];
        let propertyControls = [];
        if (item) {
            if (_.isObject(item)) {
                propertyNames = Object.keys(item);
                for (let i=0; i<propertyNames.length; i++){
                    let name = propertyNames[i];
                    let value = item[name];
                    let newControl = this.getFormControl(value, name, '', formOptions);
                    propertyControls.push(newControl);
                }
            } else {
                let name = this.translate('Value');
                let value = item.data;
                let newControl = this.getFormControl(value, name, '', formOptions);
                propertyControls.push(newControl);
            }
        }
        return propertyControls;
    }

    findControlByPath(controls, propertyPath) {
        let control = _.find(controls, (item) => item.path == propertyPath);
        if (!control) {
            for (let i=0; i<controls.length; i++) {
                if (controls[i].subControls && controls[i].subControls.length) {
                    control = this.findControlByPath(controls[i].subControls, propertyPath);
                    if (control) {
                        break;
                    }
                }
            }
        }
        return control;
    }

    removeObjectProperty(item, propertyPath) {
        if (propertyPath.match(/\./)){
            let parentPath = propertyPath.replace(/\.[^.]+$/, '');
            let parentValue = _.get(item, parentPath);
            if (_.isArray(parentValue)){
                let index = +_.last(propertyPath.split('.'));
                _.pullAt(parentValue, index);
                return true;
            } else {
                return _.unset(item, propertyPath);
            }
        } else {
            return _.unset(item, propertyPath);
        }
    }

    getControlSettingsByPath(propertyPath, formOptions = {formIdentifier: '', controls: []}) {
        return _.find(formOptions.controls, (option) => {
            return option && option.path && option.path == propertyPath;
        });
    }
}
exports.UiFormHelper = UiFormHelper;