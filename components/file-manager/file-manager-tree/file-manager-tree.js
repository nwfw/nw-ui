/**
 * @fileOverview file-manager-tree component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

// const _ = require('lodash');

var _appWrapper = window.getAppWrapper();
var appState = _appWrapper.getAppState();

/**
 * App debug component
 *
 * @name file-manager-tree
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
    name: 'file-manager-tree',
    template: '',
    props: [
        'instanceId',
        'methods'
    ],
    data: function () {
        return appState.fileManagerInstances[this.instanceId];
    },
    methods: {

    },
    computed: {}
};