/**
 * @fileOverview tree-item component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

const _ = require('lodash');

var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();

/**
 * App debug component
 *
 * @name tree-item
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
    name: 'tree-item',
    template: '',
    props: {
        isRoot: {
            type: Boolean,
            required: false,
            default: function(){
                return false;
            }
        },
        selectMode: {
            type: Boolean,
            required: true
        },
        options: {
            type: Object,
            required: true
        },
        item: {
            type: Object,
            required: true
        },
        methods: {
            type: Object,
            required: true,
        },
        listTransition: {
            type: String,
            required: false
        },
        drakeId: {
            type: String,
            required: false
        },
        dragulaArray: {
            type: Array,
            required: false
        },
    },
    data: function () {
        return {};
    },
    created: function(){
        if (this.isRoot) {
            this.initializeDragula();
        }
    },
    beforeDestroy: function(){
        if (this.isRoot) {
            this.destroyDragula();
        }
    },
    methods: {
        initializeDragula: function() {
            let mirrorContainer = document.querySelector('.tree-drag-wrapper');
            if (!mirrorContainer) {
                mirrorContainer = document.body;
            }
            const $service = this.$dragula.$service;
            $service.options(this.drakeId, {
                direction: 'vertical',
                revertOnSpill: true,
                isContainer: function (el) {
                    let result = el.classList.contains('tree-item-children-container');
                    return result;
                },
                moves: function (el, source, handle) {
                    let result = !el.classList.contains('no-drop') && handle.classList.contains('drag-handle');
                    return result;
                },
                accepts: function (el, target, source, sibling) {
                    let result = true;
                    if (!sibling) {
                        result = false;
                    } else if (sibling.classList.contains('no-drop')){
                        result = false;
                    }
                    return result;
                },
                mirrorContainer: mirrorContainer
            });
            let instance = this.$dragula.$service.find(this.drakeId);
            instance.on('over', this.onContainerOver);
            instance.on('out', this.onContainerOut);
            instance.on('drag', this.onDrag);
            instance.on('dragend', this.onDragEnd);
        },
        destroyDragula: function(){
            let instance = this.$dragula.$service.find(this.drakeId);
            if (instance){
                instance.off('over', this.onContainerOver);
                instance.off('out', this.onContainerOut);
                instance.off('drag', this.onDrag);
                instance.off('dragend', this.onDragEnd);
                if (instance.destroy){
                    instance.destroy();
                }
            }
        },

        onContainerOver: function(el, container, source) {
            console.log(container);
            // el.classList.push('tree-item-children-container-over');
        },
        onContainerOut: function(el, container, source) {
            // el.classList = _.without(el.classList, 'tree-item-children-container-over');
        },
        onDrag: function(el) {
            let htmlHelper = _appWrapper.getHelper('html');
            let rootEl = htmlHelper.getParentByClass(this.$el, 'tree-root-wrapper');
            if (rootEl){
                htmlHelper.addClass(rootEl, 'tree-root-wrapper-dragging');
            }
        },
        onDragEnd: function(el) {
            let htmlHelper = _appWrapper.getHelper('html');
            let rootEl = htmlHelper.getParentByClass(this.$el, 'tree-root-wrapper');
            if (rootEl){
                htmlHelper.removeClass(rootEl, 'tree-root-wrapper-dragging');
            }
        },

        getIconClasses: function(){
            let classes;
            if (this.item.node.classes && this.item.node.classes.length) {
                classes = this.item.node.classes;
            } else {
                classes = {
                    fa: true
                };
                if (this.methods.isOpen(this.item) && this.methods.hasChildren(this.item)){
                    classes['fa-folder-open'] = true;
                } else {
                    classes['fa-folder'] = true;
                }
            }
            if (_.isArray(classes) && classes.indexOf('tree-item-icon') === -1) {
                classes.unshift('tree-item-icon');
            } else if (_.isObject(classes)) {
                classes['tree-item-icon'] = true;
            }
            return classes;
        },
        itemIconClick: function(e){
            this.methods.itemIconClick(this.item, e);
        },
        itemClick: function(e){
            if (!this.selectMode) {
                e.preventDefault();
                this.methods.itemClick(this.item, e);
            } else {
                return false;
            }
        },
        deleteItemHandler: function(e) {
            e.preventDefault();
            this.methods.deleteItem(this.item);
        }
    },
    watch: {
        // 'item.name': function() {
        //     this.methods.onChangeHandler();
        // }
    },
    computed: {}
};