/**
 * @fileOverview file-manager-list component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

// const _ = require('lodash');

var _appWrapper = window.getAppWrapper();
var appState = _appWrapper.getAppState();

/**
 * App debug component
 *
 * @name file-manager-list
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
    name: 'file-manager-list',
    template: '',
    props: [
        'instanceId',
        'methods'
    ],
    data: function () {
        return appState.fileManagerInstances[this.instanceId];
    },
    methods: {
        beforeLeave: function (el) {
            if (!this.fm.config.thumbnailView){
                let dimensions = el.getCloneRealDimensions();
                let innerListEl = this.$el.querySelector('.list-inner');
                let offset = innerListEl.getComputedStyle(innerListEl, 'padding-top');
                if (offset){
                    offset = parseInt(offset, 10);
                } else {
                    offset = 0;
                }
                el.setElementStyles(el, {
                    'width': dimensions.width + 'px'
                }, true);
                el.absolutize();
                el.setElementStyles(el, {
                    'top': (offset + (parseInt(el.getAttribute('data-index'), 10) * dimensions.height)) + 'px'
                }, true);
            }
        },
        beforeEnter: function (el) {
            let styleHelper = _appWrapper.getHelper('style');
            if (this.fm.config.thumbnailView){
                el.setElementStyles(el, {
                    'transition-delay': styleHelper.getCssVarValue('--medium-animation-duration')
                }, true);
            }
        },
        afterEnter: function (el) {
            if (this.fm.config.thumbnailView){
                el.removeElementStyles(el, ['transition-delay']);
            }
        },
        getTransitionName: function(){
            let name = 'transform-scale-height';
            if (this.fm.config.thumbnailView){
                name = 'transform-scale';
            }
            return name;
        }
    },
    computed: {}
};