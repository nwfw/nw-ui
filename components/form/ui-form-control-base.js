/**
 * @fileOverview ui-form-control-base component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

const _ = require('lodash');

// let _appWrapper = window.getAppWrapper();

/**
 * Form control text component
 *
 * @name ui-form-control-base
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
    name: 'ui-form-control-base',
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
        addRowActive: {
            type: Boolean,
            required: true
        },
        minimized: {
            type: Boolean,
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
        methods: {
            type: Object,
            required: true
        }
    },
    data: function () {
        return {};
    },
    methods: {
        innerValueChange: function(control) {
            return () => {
                let changed = false;
                let name = control.name;
                let value = control.value;
                let keys = Object.keys(this.control.value);
                for (let i=0; i<keys.length; i++) {
                    if (keys[i] == name) {
                        this.control.value[keys[i]] = value;
                        changed = true;
                    }
                }
                if (changed) {
                    if (this.methods && this.methods.onChange && _.isFunction(this.methods.onChange)) {
                        this.methods.onChange(control);
                    }
                }
            };
        },
        getFieldClasses: function (){
            let classes = {
                'ui-form-field-wrapper': true
            };
            return classes;
        },
        getControls: function() {
            let controls = this.methods.getDataControls();
            return controls;
        },
        getControlOptions: function(){
            let found = _.find(this.formData.formOptions.controls, (control) => control.path == this.control.path);
            if (!found) {
                let controls = this.getControls();
                found = _.find(controls, (control) => control.path == this.control.path);
            }
            return found;
        },
        onChange: function() {
            this.methods.onChange(this.control);
        },
        onOutputChange: function() {
            this.methods.onChange(this.control);
        },
        toggleAddRowActive: function(){
            if (this.$parent && !_.isUndefined(this.$parent.addRowActive)) {
                this.$parent.addRowActive = !this.$parent.addRowActive;
            }
        },
        toggleNewRow: function(){
            this.addRowActive = !this.addRowActive;
        },
        toggleRow: function(){
            if (this.$parent && !_.isUndefined(this.$parent.minimized)) {
                this.$parent.minimized = !this.$parent.minimized;
            }
        },
        validate: function(){
            let result = true;
            if (this.control.required && !this.control.value) {
                result = false;
            }
            this.control.error = !result;
            return result;
        }
    }
};