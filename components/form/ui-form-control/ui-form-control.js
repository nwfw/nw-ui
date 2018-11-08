/**
 * @fileOverview ui-form-control component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */
const _ = require('lodash');

// let _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();
/**
 * Form control component
 *
 * @name ui-form-control
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
    name: 'ui-form-control',
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
        showFieldTypeIcons: {
            type: Boolean,
            required: true
        },
        allowPropertyAdd: {
            type: Boolean,
            required: true
        },
        allowPropertyRemove: {
            type: Boolean,
            required: true
        },
        allowPropertyEdit: {
            type: Boolean,
            required: true
        },
        change: {
            type: Function,
            required: true
        },
        addHandler: {
            type: Function,
            required: true
        },
        removeHandler: {
            type: Function,
            required: true
        }
    },
    data: function () {
        return {
            addRowActive: false,
            minimized: false,
            controlFieldActive: true,
            editControlActive: false,
            hoveredRemove: false,
            controlMethods: {
                onChange: this.onChange.bind(this),
                removeRow: this.removeRow.bind(this),
                getFormControlIconClasses: this.getFormControlIconClasses.bind(this),
                addRow: this.methods.addRow,
            },
            controlEditorMethods: {
                controlChanged: this.controlChanged.bind(this)
            },
        };
    },
    methods: {
        getFormControlClasses: function(){
            let baseClass = 'ui-form-control-row-' + this.control.formControl;
            let baseTypeClass = 'ui-form-control-row-' + this.control.type;
            let classes = {
                'ui-form-row': true,
            };
            classes[baseClass] = true;
            classes[baseTypeClass] = true;
            if (this.control.error) {
                classes['ui-form-row-error'] = true;
            }
            if (this.control.required) {
                classes['ui-form-row-required'] = true;
            }
            if (this.control.disabled) {
                classes['ui-form-row-disabled'] = true;
            }
            if (this.control.readonly) {
                classes['ui-form-row-readonly'] = true;
            }
            if (this.control.wrapperClasses && this.control.wrapperClasses.length) {
                for (let i=0; i<this.control.wrapperClasses.length; i++) {
                    classes[this.control.wrapperClasses[i]] = true;
                }
            }
            if (this.editControlActive) {
                classes['ui-form-row-edit-active'] = true;
            }
            if (this.hoveredRemove) {
                classes['ui-form-row-to-remove'] = true;
            }
            return classes;
        },
        getFormControlIconClasses: function() {
            let classes = {
                'ui-form-field-type-icon': true,
                'fa': true,
                'invisible-element': true
            };
            if (_.includes(['text', 'textarea'], this.control.type)){
                classes['invisible-element'] = false;
                classes['fa-file-text-o'] = true;
            } else if (this.control.type == 'select') {
                classes['invisible-element'] = false;
                classes['fa-caret-square-o-down'] = true;
            } else if (this.control.type == 'checkbox') {
                classes['invisible-element'] = false;
                classes['fa-check-square-o'] = true;
            } else if (this.control.type == 'array') {
                classes['invisible-element'] = false;
                classes['fa-list-ol'] = true;
            } else if (this.control.type == 'object') {
                classes['invisible-element'] = false;
                classes['fa-sitemap'] = true;
            }
            return classes;
        },
        getFormControlIconTitle: function() {
            let title = '';
            if (this.control.type == 'text') {
                title = this.translate('Text');
            } else if (this.control.type == 'textarea') {
                title = this.translate('Textarea');
            } else if (this.control.type == 'select') {
                title = this.translate('Select');
            } else if (this.control.type == 'checkbox') {
                title = this.translate('Checkbox');
            } else if (this.control.type == 'array') {
                title = this.translate('Array');
            } else if (this.control.type == 'object') {
                title = this.translate('Object');
            }
            return title;
        },
        showPropertyEditButton: function(){
            let show = false;
            if (this.allowPropertyEdit) {
                show = true;
            }
            return show;
        },
        showRemoveButton: function(){
            let show = false;
            if (this.allowPropertyRemove && !this.control.readonly && !this.control.disabled && !this.isParentReadonly() && !this.isParentDisabled()) {
                show = true;
            }
            return show;
        },
        showDragButton: function(){
            let show = false;
            if (this.isArrayMember() && !this.control.readonly && !this.control.disabled && !this.isParentReadonly() && !this.isParentDisabled()) {
                show = true;
            }
            return show;
        },
        showAddButton: function(){
            let show = false;
            if (this.allowPropertyAdd && !this.control.readonly && !this.control.disabled && _.includes(['array', 'object'], this.control.type)) {
                show = true;
            }
            return show;
        },
        onChange: function(control) {
            let valid = this.validate();
            if (valid) {
                if (this.change && _.isFunction(this.change)) {
                    if (!control) {
                        control = this.control;
                    }
                    this.change(control);
                }
            }
        },
        removeRow: function(propertyPath) {
            if (this.methods && this.methods.removeRow && _.isFunction(this.methods.removeRow)) {
                this.methods.removeRow(propertyPath);
            }
        },
        toggleNewRow: function(){
            this.addRowActive = !this.addRowActive;
        },
        toggleRow: function(){
            this.minimized = !this.minimized;
        },
        toggleEditControl: function() {
            this.editControlActive = !this.editControlActive;
        },
        validate: function() {
            return this.$refs.innerControl.validate();
        },
        removeHover: function(){
            this.hoveredRemove = true;
        },
        removeOut: function(){
            this.hoveredRemove = false;
        },
        controlChanged: function(control, oldControl) {
            if (this.methods.controlChanged && _.isFunction(this.methods.controlChanged)){
                this.methods.controlChanged(control, oldControl);
            }
        },
        getAddButtonTitle: function(){
            let title = this.translate('Add new property');
            if (this.control.type == 'array') {
                title = this.translate('Add new member');
            }
            return title;
        },
        isArrayMember: function() {
            let arrayMember = false;
            if (this.$parent && this.$parent.control && this.$parent.control.type == 'array') {
                arrayMember = true;
            }
            return arrayMember;
        },
        isParentReadonly: function(){
            let readonly = false;
            if (this.$parent && this.$parent.control && this.$parent.control.readonly) {
                readonly = true;
            }
            return readonly;
        },
        isParentDisabled: function(){
            let disabled = false;
            if (this.$parent && this.$parent.control && this.$parent.control.disabled) {
                disabled = true;
            }
            return disabled;
        },
    },
};