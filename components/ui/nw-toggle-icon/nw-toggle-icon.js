/**
 * @fileOverview accordion component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

// const _ = require('lodash');

// var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();

/**
 * App debug component
 *
 * @name accordion
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
    name: 'nw-toggle-icon',
    template: '',
    props: {
        // array of objects with 'title', 'text' and 'collapsed' properties
        parent: {
            type: Object,
            required: true,
        },
        title: {
            type: String,
            default: '',
        },
        name: {
            type: String,
            required: true,
        },
        activeClasses: {
            type: Array,
            required: true,
        },
        inactiveClasses: {
            type: Array,
            required: true,
        },
    },
    data: function () {
        return {

        };
    },
    methods: {
        handleClick () {
            this.parent[this.name] = !this.parent[this.name];
            this.$emit('change', this.parent[this.name], this);
        },
        getClasses () {
            if (this.parent[this.name]){
                return this.activeClasses;
            } else {
                return this.inactiveClasses;
            }
        },
    },
    computed: {}
};