/**
 * @fileOverview nw-tabs component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

const _ = require('lodash');

var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();

/**
 * App debug component
 *
 * @name nw-tabs
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
    name: 'nw-tabs',
    template: '',
    props: {
        // Function triggered when auto cancel timeout expires
        tabData: {
            default: function() {
                return {
                    autoHeight: true,
                    tabs: [
                        {
                            title: 'Tab',
                            body: 'Tab body',
                            bodyComponentData: {},
                            bodyComponentName: '',
                            active: true
                        },
                        {
                            title: 'Tab 2',
                            body: 'Tab 2 body',
                            bodyComponentData: {},
                            bodyComponentName: '',
                            active: false
                        }
                    ]
                };
            }
        },
        tabChange: {
            type: Function
        }
    },
    data: function () {
        return {
            tabHeight: 0,
            tabStyles: {},
        };
    },
    beforeMount: function(){
        this.setTabStyles();
    },
    mounted: function() {
        this.updateMaxHeight();
    },
    methods: {
        updateMaxHeight: async function(){
            if (this.tabData.autoHeight){
                let htmlHelper = _appWrapper.getHelper('html');
                let maxHeight = 0;
                let elDimensions = htmlHelper.getRealDimensions(this.$el);
                let tabElements = this.$el.querySelectorAll('.nw-tab');
                for (let i=0; i<this.tabData.tabs.length; i++) {
                    if (!this.tabData.tabs[i].active) {
                        htmlHelper.removeClass(tabElements[i], 'inactive-tab');
                    }
                }

                for (let i=0; i<this.tabData.tabs.length; i++) {
                    let dimensions = htmlHelper.getRealDimensions(tabElements[i]);
                    if (!this.tabData.tabs[i].active) {
                        htmlHelper.addClass(tabElements[i], 'inactive-tab');
                    }
                    if (maxHeight < dimensions.height) {
                        maxHeight = dimensions.height;
                    }
                }
                if (maxHeight && this.tabHeight != maxHeight) {
                    this.tabHeight = maxHeight;
                    this.setTabStyles();
                }
            }
        },
        setTabStyles: function() {
            let styles = {};
            if (this.tabHeight){
                styles.height = this.tabHeight + 'px';
            }
            this.tabStyles = styles;
        },
        setTab: function(e) {
            let target = e.target;
            let index = +target.getAttribute('data-index');
            for (let i=0; i<this.tabData.tabs.length; i++) {
                if (i != index) {
                    this.tabData.tabs[i].active = false;
                }
            }
            this.tabData.tabs[index].active = true;
            if (this.tabChange && _.isFunction(this.tabChange)) {
                this.tabChange(index);
            }
            this.$forceUpdate();
        }
    },
    computed: {}
};