/**
 * @fileOverview file-manager-tree-item component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

var _appWrapper = window.getAppWrapper();
var appState = _appWrapper.getAppState();

/**
 * App debug component
 *
 * @name file-manager-tree-item
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
    name: 'file-manager-tree-item',
    template: '',
    props: [
        'instanceId',
        'item',
        'methods'
    ],
    data: function () {
        return appState.fileManagerInstances[this.instanceId];
    },
    methods: {
        itemClick: function(e) {
            this.methods.itemClick(e, this.item);
        },
        isOpen: function(){
            return this.item && this.item.path && this.fm.currentDir.match(new RegExp(_appWrapper.getHelper('util').quoteRegex(this.item.path)));
        },
        isActive: function(){
            return this.item && this.item.path && this.fm.currentDir == this.item.path;
        }
    },
    watch: {},
    computed: {}
};