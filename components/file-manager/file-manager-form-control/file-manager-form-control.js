/**
 * @fileOverview file-manager-form-control component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

const _ = require('lodash');

var _appWrapper = window.getAppWrapper();
var appState = _appWrapper.getAppState();
/**
 * App debug component
 *
 * @name file-manager-form-control
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
    name: 'file-manager-form-control',
    template: '',
    drakeId: null,
    props: {
        options: {
            type: Object,
        },
        onChange: {
            type: Function,
            required: true,
        },
        value: {
            type: Object,
            required: true,
            validator: function (value) {
                // console.log(value);
                let valid = value && !_.isUndefined(value.paths) && value.items && _.isArray(value.items);
                if (!valid){
                    console.error('File manager form control model must contain array "items" and string "paths"');
                }
                return valid;
            }
        },
    },
    data: function () {
        return {};
    },
    created: function(){
        this.drakeId = null;
        this.initializeDragula();
    },
    beforeDestroy: function(){
        this.destroyDragula();
    },
    methods: {
        getDrakeId: function(){
            if (!this.drakeId) {
                this.drakeId = _.uniqueId('items_');
            }
            return this.drakeId;
        },
        initializeDragula: function() {
            let drakeId = this.getDrakeId();
            this.$dragula.$service.options(drakeId, {
                direction: 'horizontal',
                revertOnSpill: true,
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
                }
            });
            let instance = this.$dragula.$service.find(drakeId);
            instance.on('drop', () => {
                this.$nextTick(() => {
                    this.setPaths();
                });
            });
        },
        destroyDragula: function(){
            let drakeId = this.getDrakeId();
            let instance = this.$dragula.$service.find(drakeId);
            if (instance && instance.destroy){
                instance.destroy();
            }
        },
        handleControlClick: function() {
            let options = _.cloneDeep(this.options);
            if (!options){
                options = {};
            }
            options = _.defaultsDeep({
                initialSelectedItems: this.value.items,
                confirmCallback: this.confirmCallback
            }, options);
            _appWrapper.app.fileManagerHelper.openFileManagerModal(options);
        },
        getItems: function(){
            return this.value.items;
        },
        setItems: function(items){
            this.value.items = items;
            this.$nextTick(() => {
                this.setPaths();
            });
        },
        setPaths: function(){
            this.value.paths = _.map(this.value.items, (item) => {
                return item.path;
            }).join(',');
            this.changed();
        },
        confirmCallback: function(items) {
            let modalHelper = _appWrapper.getHelper('modal');
            this.setItems(items);
            modalHelper.closeCurrentModal();
            return true;
        },
        changed: function() {
            this.$nextTick(() => {
                if (this.onChange && _.isFunction(this.onChange)){
                    return this.onChange(this.value.items);
                }
            });
        },
        removeItem: function(item){
            let items = _.filter(this.getItems(), (currentItem) => {
                return currentItem.path != item.path;
            });
            this.setItems(items);
        }
    },
    computed: {
        appState: function() {
            return appState;
        }
    },
};