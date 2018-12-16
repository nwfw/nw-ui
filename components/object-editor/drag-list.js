const _ = require('lodash');
const ObjectEditorBase = require('./objectEditorBase.js').component;
// var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();

exports.component = {
    name: 'drag-list',
    template: '',
    extends: ObjectEditorBase,
    props: {
        drakeOptions: {
            type: Object,
            default: function(){
                return {};
            }
        },
    },
    data: function () {
        return {
            drakeBase: 'drakeList',
            drakeName: '',
            serviceName: '',
            dragulaInitialized: false,
            serviceInstance: null,
            noDropClass: 'no-drop',
            dragHandleClass: 'drag-handle',
        };
    },
    beforeMount: function(){
        this.setNames();
    },
    mounted: function(){
        this.initializeDragula();
    },
    beforeDestroy: function(){
        this.destroyDragula();
    },
    methods: {
        setNames () {
            this.drakeName = _.uniqueId(this.drakeBase + '_');
            this.serviceName = _.uniqueId(this.drakeBase + 'Service_');
        },
        initializeDragula: function() {
            let drakeOptions = _.defaultsDeep(this.drakeOptions, {
                direction: 'both',
                revertOnSpill: true,
                copy: false,
                moves: this.itemMoves,
                accepts: this.itemAccepts,
                mirrorContainer: this.getMirrorContainer(),
            });

            let drakes = {};
            drakes[this.drakeName] = drakeOptions;

            this.serviceInstance = this.$dragula.createService({
                name: this.serviceName,
                drakes: drakes
            });
            this.addDrakeEventListeners();
            this.dragulaInitialized = true;
        },
        addDrakeEventListeners () {
            let service = Vue.$dragula.service(this.serviceName);
            if (this.dragStart) {
                service.eventBus.$on('drag', this.dragStart);
            }
            if (this.itemDropped) {
                service.eventBus.$on('drop', this.itemDropped);
            }
        },
        removeDrakeEventListeners () {
            let service = Vue.$dragula.service(this.serviceName);
            if (this.dragStart) {
                service.eventBus.$off('drag', this.dragStart);
            }
            if (this.itemDropped) {
                service.eventBus.$off('drop', this.itemDropped);
            }
        },
        itemMoves: function (el, source, handle) {
            let result = false;
            if (handle && handle.parentQuerySelector) {
                let handleSource = handle.parentQuerySelector('.drag-list-wrapper');
                if (handleSource && handleSource == source) {
                    result = !el.classList.contains(this.noDropClass) && handle.classList.contains(this.dragHandleClass);
                }
            }
            return result;
        },
        itemAccepts: function (el, target) {
            let result = true;
            if (!(target && !target.classList.contains(this.noDropClass))) {
                result = false;
            }
            return result;
        },
        destroyDragula: function(){
            let service = _.find(this.$dragula.services, {name: this.serviceName});
            this.removeDrakeEventListeners();
            if (service){
                if (service.destroy){
                    service.destroy(this.serviceName);
                } else {
                    console.error('no drake service destroy', service);
                }
            } else {
                console.error('no drake service');
            }
        },
        dragStart () {
            // console.log('dragStart - override this if needed', arguments);
        },
        itemDropped () {
            // console.log('itemDropped - override this if needed', arguments);
        },
        getMirrorContainer: function(){
            // console.log('override this if needed');
            let mirrorContainer;
            if (this.$el && this.$el.querySelector) {
                mirrorContainer = this.$el.querySelector('.drag-mirror-container');
                if (!mirrorContainer) {
                    console.warn('Mirror container for ' . this.$el.tagName + '.' + Array.from(this.$el.classList).join('.') + ' not found!');
                }
            }
            return mirrorContainer;
        },
    },
};