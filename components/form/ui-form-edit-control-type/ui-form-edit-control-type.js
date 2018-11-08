/**
 * @fileOverview ui-form-edit-control-type component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */
const _ = require('lodash');

// let _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();
/**
 * Form control component
 *
 * @name ui-form-edit-control-type
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
    name: 'ui-form-edit-control-type',
    template: '',
    props: {
        control: {
            type: [Object, Boolean],
            required: true
        },
        methods: {
            type: Object,
            required: true
        },
        propertyType: {
            type: String,
            required: true
        }
    },
    data: function () {
        let data = {
            propertyOptions: '',
            controlOptions: {
                multiple: this.control.multiple,
            },
        };
        if (this.control && this.control.options && this.control.options.join){
            data.propertyOptions = this.control.options.join(',');
        }
        return data;
    },
    methods: {
        controlOptionsChange: function(){
            let options = _.compact(this.propertyOptions.split(','));
            this.methods.setPropertyOptions(options);
        },
        controlChange: function(){
            this.methods.setControlSettings(this.controlOptions);
        }
    },
};