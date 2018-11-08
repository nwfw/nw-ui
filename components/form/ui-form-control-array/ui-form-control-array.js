/**
 * @fileOverview ui-form-control-array component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */
const _ = require('lodash');
const BaseControl = require('../ui-form-control-base').component;

// var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();
/**
 * Form control text component
 *
 * @name ui-form-control-array
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
    name: 'ui-form-control-array',
    template: '',
    extends: BaseControl,
    props: {},
    data: function () {
        return {
            parentControl: this.$parent.control,
            parentValue : this.$parent.control.value,
            dragulaInitialized: false,
            serviceName: '',
            drakeId: '',
            serviceInstance: null,
            boundMethods: {
                onDrop: this.onDrop.bind(this)
            },
        };
    },
    created: function(){
        this.initializeDragula();
    },
    mounted: function(){
        this.finalizeDragula();
    },
    beforeDestroy: function(){
        this.destroyDragula();
    },
    methods: {
        getDrakeId: function(){
            if (!this.drakeId) {
                this.drakeId = _.uniqueId(this.control.path + '_');
            }
            return this.drakeId;
        },
        getServiceName: function(){
            if (!this.serviceName) {
                this.serviceName = _.uniqueId(this.control.path + '_service_');
            }
            return this.serviceName;
        },
        initializeDragula: function() {
            let drakeId = this.getDrakeId();
            let serviceName =  this.getServiceName();
            let dragula = this.$dragula;
            let drakeOptions = {
                direction: 'vertical',
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
            };
            let drakes = {};
            drakes[drakeId] = drakeOptions;
            this.serviceInstance = dragula.createService({
                name: serviceName,
                drakes: drakes,
                options: {
                    // logging: true
                }
            });
            this.dragulaInitialized = true;
        },
        finalizeDragula: function() {
            let drakeId = this.getDrakeId();
            let serviceName =  this.getServiceName();
            let drake = this.$dragula._serviceMap[serviceName].drakes[drakeId];
            drake.on('drop', this.boundMethods.onDrop);
        },
        destroyDragula: function(){
            let drakeId = this.getDrakeId();
            let serviceName =  this.getServiceName();
            let drake = this.$dragula._serviceMap[serviceName].drakes[drakeId];
            drake.off('drop', this.boundMethods.onDrop);
            let instance = this.$dragula.$service.find(drakeId);
            if (instance && instance.destroy){
                instance.destroy();
            }
            this.dragulaInitialized = false;
        },
        onDrop: function(){
            this.toggleRow();
            if (this.methods && this.methods.onChange && _.isFunction(this.methods.onChange)) {
                this.methods.onChange();
            }
        },
        getParentValue: function(){
            return this.parentControl.value;
        },
    },
    components: []
};