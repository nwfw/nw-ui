/**
 * @fileOverview ui-form-control-range component file
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
 * @name ui-form-control-range
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
    name: 'ui-form-control-range',
    extends: BaseControl,
    template: '',
    props: {},
    data: function () {
        return {};
    },
    methods: {
        getMinValue: function(){
            let minValue = 0;
            return minValue;
        },
        getMaxValue: function(){
            let maxValue = Infinity;
            return maxValue;
        },
        getStepValue: function(){
            let stepValue = 1;
            return stepValue;
        }
    },
};