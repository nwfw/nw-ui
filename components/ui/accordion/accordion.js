/**
 * @fileOverview accordion component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

const _ = require('lodash');

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
    name: 'accordion',
    template: '',
    props: {
        // array of objects with 'title', 'text' and 'collapsed' properties
        items: {
            type: Array,
            default: function() {
                return [
                    {
                        title: 'Item',
                        text: 'Item text',
                        collapsed: false
                    },
                    {
                        title: 'Item 2',
                        text: 'Item 2 text',
                        collapsed: true
                    }
                ];
            }
        },
        itemClasses: {
            type: Array,
            default: function(){
                return [];
            }
        },
        titleClasses: {
            type: Array,
            default: function(){
                return [];
            }
        },
        textClasses: {
            type: Array,
            default: function(){
                return [];
            }
        },
        singleItem: {
            type: Boolean,
            default: false
        },
        transition: {
            type: [Boolean, String],
            default: false
        }
    },
    data: function () {
        return {

        };
    },
    methods: {
        toggleItem: function(index) {
            if (!this.singleItem) {
                let item = this.items[index];
                if (item && !_.isUndefined(item.collapsed)) {
                    item.collapsed = !item.collapsed;
                }
            } else {
                let item = this.items[index];
                let collapsed;
                if (item) {
                    collapsed = !item.collapsed;
                }
                if (!collapsed) {
                    for (let i=0; i<this.items.length; i++) {
                        if (i !== index && !this.items[i].collapsed) {
                            this.items[i].collapsed = true;
                        }
                    }
                }
                item.collapsed = collapsed;
            }
        }
    },
    computed: {}
};