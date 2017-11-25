/**
 * @fileOverview file-manager-new component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

const _ = require('lodash');

var _appWrapper = window.getAppWrapper();
var appState = _appWrapper.getAppState();

/**
 * App debug component
 *
 * @name file-manager-new
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
    name: 'file-manager-new',
    template: '',
    props: [
        'instanceId',
        'methods',
    ],
    timeouts: {
        checkErrors: null,
    },
    created: function() {
        this.timeouts = {
            checkErrors: null
        };
    },
    data: function () {
        return appState.fileManagerInstances[this.instanceId];
    },
    methods: {
        checkErrors: function(e){
            clearTimeout(this.timeouts.checkErrors);
            this.timeouts.checkErrors = setTimeout(this.hasErrors, 50);
        },
        hasErrors: function(){
            let errors = false;
            if (!this.fm.newFileName){
                errors = true;
            } else if (this.fm.newFileNameMatch && !this.fm.newFileName.match(this.fm.newFileNameMatch)){
                errors = true;
            }
            if (errors){
                this.$nextTick(() => {
                    let input = this.$el.querySelector('.file-manager-new-file-name');
                    if (input && input.focus && _.isFunction(input.focus)){
                        input.focus();
                    }
                });
            }
            return errors;
        }
    },
    computed: {}
};