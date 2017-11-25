/**
 * @fileOverview file-manager-top component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

const _ = require('lodash');

var _appWrapper = window.getAppWrapper();
var appState = _appWrapper.getAppState();

/**
 * App debug component
 *
 * @name file-manager-top
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
    name: 'file-manager-top',
    template: '',
    props: [
        'instanceId',
        'methods'
    ],
    data: function () {
        return appState.fileManagerInstances[this.instanceId];
    },
    created: function(){
        this.timeouts = {
            fm_massOperationsVisible: null,
            fm_clipboardItemsVisible: null,
            fm_settingsOpen: null,
        };
    },
    methods: {
        toggleClipboardItems: function(){
            this.fm.viewClipboardItems = !this.fm.viewClipboardItems;
            if (this.fm.viewClipboardItems){
                this.fm.massOperationsVisible = false;
            }
        },
        toggleMassOperations: function(){
            this.fm.massOperationsVisible = !this.fm.massOperationsVisible;
            if (this.fm.massOperationsVisible){
                this.fm.viewClipboardItems = false;
            } else {
                this.fm.viewSelectedItems = false;
            }
        },
        toggleSelectedList: function(){
            this.fm.viewSelectedItems = !this.fm.viewSelectedItems;
        },
        toggleSettings: function(){
            this.fm.settingsOpen = !this.fm.settingsOpen;
        },
        submenuMouseOver: function(e){
            let target = e.target;
            while (target.parentNode && !target.hasClass('fm-submenu-element')){
                target = target.parentNode;
            }
            let toggle = target.getAttribute('data-toggle');
            if (toggle){
                let toggleName = toggle.replace(/\./g, '_');
                clearTimeout(this.timeouts[toggleName]);
                _.set(this, toggle, true);
            }
        },
        submenuMouseOut: function(e){
            let target = e.target;
            while (target.parentNode && !target.hasClass('fm-submenu-element')){
                target = target.parentNode;
            }
            let toggle = target.getAttribute('data-toggle');
            if (toggle){
                let toggleName = toggle.replace(/\./g, '_');
                clearTimeout(this.timeouts[toggleName]);
                this.timeouts[toggleName] = setTimeout(() => {
                    if (this.fm.submenuAutoHide){
                        _.set(this, toggle, false);
                    }
                }, 600);
            }
        },
    },
    computed: {}
};