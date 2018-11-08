/**
 * @fileOverview ui-form-control-textarea component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

// const _ = require('lodash');
const BaseControl = require('../ui-form-control-base').component;

// var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();
/**
 * Form control text component
 *
 * @name ui-form-control-textarea
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
    name: 'ui-form-control-textarea',
    extends: BaseControl,
    template: '',
    props: {},
    data: function () {
        return {};
    },
    methods: {
        inputFocus: function(){
            this.control.error = false;
        }
    },
};