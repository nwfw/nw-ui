/**
 * @fileOverview ui-form-add-row component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */
const _ = require('lodash');

let _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();
/**
 * Form control component
 *
 * @name ui-form-add-row
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
    name: 'ui-form-add-row',
    template: '',
    props: {
        item: {
            type: Object,
            required: true
        },
        control: {
            type: [Object, Boolean],
            required: true
        },
        addHandler: {
            type: Function,
            required: true
        },
        closeHandler: {
            type: Function,
            required: true
        }
    },
    data: function () {
        return {
            methods: {
                setPropertyOptions: this.setPropertyOptions.bind(this),
            },
            propertyType: 'text',
            propertyName: '',
            propertyValue: null,
            propertyOptions: [],
        };
    },
    mounted: function(){
        if (this.control.type == 'array') {
            this.propertyName = this.control.value.length;
        }
        this.$nextTick(() => {
            let inputs = this.$el.querySelectorAll('input');
            for (let i = 0; i < inputs.length; i++){
                let input = inputs[i];
                if (input && input.focus && input.type && input.type == 'text' && !input.disabled && !input.readOnly) {
                    input.focus();
                    return;
                }
            }
        });
    },
    methods: {
        setPropertyOptions: function(options) {
            if (options && _.isArray(options)) {
                this.propertyOptions = options;
            }
        },
        addNewRow: function(){
            if (this.canAddNewObjectRow()){
                let controlOptions = {
                    options: this.propertyOptions,
                    type: this.propertyType
                };
                if (_.isNull(this.propertyValue)) {
                    if (this.propertyType == 'text') {
                        this.propertyValue = '';
                    } else if (this.propertyType == 'checkbox') {
                        this.propertyValue = false;
                    }
                }
                let result = this.addHandler(this.propertyName, this.propertyValue, this.control, controlOptions);
                if (this.$parent && this.$parent.toggleRowActive) {
                    this.$parent.toggleAddRowActive();
                }
                return result;
            } else {
                return false;
            }
        },
        canAddNewObjectRow: function(){
            let result = false;
            let newName = this.propertyName;
            if (newName || newName == '0') {
                if (this.control) {
                    if (_.isUndefined(this.control.value[newName])) {
                        result = true;
                    }
                } else if (this.item) {
                    if (_.isUndefined(this.item[newName])) {
                        result = true;
                    }
                } else {
                    result = true;
                }
                if (this.propertyType == 'select' && !this.propertyOptions.length) {
                    result = false;
                }
            }
            return result;
        },
    },
    computed: {
        controlTypes: function() {
            return _appWrapper.app.uiFormHelper.getControlTypes();
        }
    }
};