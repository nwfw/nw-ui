/**
 * @fileOverview file-manager-list-item component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

var _appWrapper = window.getAppWrapper();
var appState = _appWrapper.getAppState();
/**
 * App debug component
 *
 * @name file-manager-list-item
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
    name: 'file-manager-list-item',
    template: '',
    props: [
        'instanceId',
        'item',
        'openFile',
        'downloadFile',
        'listItemReset',
        'itemClick',
        'itemOperation',
        'itemConfirm',
        'itemCancel',
        'isSelectedItem',
        'isCopiedItem',
        'isCutItem',
        'isOnClipboardItem',
        'getItemIconClass',
        'zoomImage',
        'getThumbWidth',
    ],
    data: function () {
        return appState.fileManagerInstances[this.instanceId];
    },
    methods: {
        toggleInfo: function(){
            this.item.showInfo = !this.item.showInfo;
        }
    },
    computed: {
        fileIconClass: function(){
            return this.getItemIconClass(this.item);
        }
    }
};