/**
 * @fileOverview file-manager-form-control-path component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

const _ = require('lodash');

var _appWrapper = window.getAppWrapper();
var appState = _appWrapper.getAppState();
/**
 * App debug component
 *
 * @name file-manager-form-control-path
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
    name: 'file-manager-form-control-path',
    template: '',
    props: {
        options: {
            type: Object,
        },
        onChange: {
            type: Function,
            required: true,
        },
        value: {
            type: String,
            required: true,
            _validator: function (value) {
                let valid = value && !_.isUndefined(value.paths) && value.items && _.isArray(value.items);
                if (!valid){
                    console.error('File manager form control model must contain array "items" and string "paths"');
                }
                return valid;
            }
        },
    },
    data: function () {
        return {};
    },
    mounted: function(){
        console.log(this.options);
    },
    methods: {
        handleControlClick: function() {
            let options = _.cloneDeep(this.options);
            if (!options){
                options = {};
            }
            options = _.defaultsDeep({
                // initialSelectedItems: this.value,
                initialSelectedPaths: this.value,
                confirmCallback: this.confirmCallback
            }, options);
            _appWrapper.app.fileManagerHelper.openFileManagerModal(options);
        },
        getValue: function(){
            return this.value;
        },
        setValue: function(value){
            this.value = value;
            this.changed();
        },
        confirmCallback: function(items) {
            let modalHelper = _appWrapper.getHelper('modal');
            let itemPath = '';
            if (items && items.length && items[0] && items[0].path){
                itemPath = items[0].path;
            }
            this.setValue(itemPath);
            modalHelper.closeCurrentModal();
            return true;
        },
        changed: function() {
            this.$nextTick(() => {
                if (this.onChange && _.isFunction(this.onChange)){
                    return this.onChange(this.value);
                }
            });
        },
        clearValue: function(){
            this.setValue('');
        }
    },
    computed: {
        appState: function() {
            return appState;
        }
    },
};