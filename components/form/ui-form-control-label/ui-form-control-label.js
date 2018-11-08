/**
 * @fileOverview ui-form-control-label component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

// var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();
/**
 * Form control label component
 *
 * @name ui-form-control-label
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
    name: 'ui-form-control-label',
    template: '',
    props: {
        control: {
            type: Object,
            required: true
        },
        identifier: {
            type: [Number, String],
            required: false,
            default: ''
        }
    },
    data: function () {
        return {};
    },
    methods: {
        getErrorText: function() {
            let errorText = this.translate('Invalid value');
            if (this.control.rowErrorText) {
                errorText = this.control.rowErrorText;
            }
            return errorText;
        }
    }
};