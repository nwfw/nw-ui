// Object.keys(require.cache).forEach(function(key) { delete require.cache[key]; });
const DragList = require('../drag-list.js').component;
const _ = require('lodash');

// var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();

exports.component = {
    name: 'array-editor',
    extends: DragList,
    template: '',
    props: {
        array: {
            type: Array,
            required: true
        },
        title: {
            type: String,
            default: 'Array'
        },
        eventName: {
            type: String,
            default: 'change'
        },
    },
    data: function () {
        return {
            hasMinimizableChildren: false,
            allMinimized: false
        };
    },
    mounted: function(){
        this.$nextTick(() => {
            this.checkMinimizableChildren();
        });
    },
    methods: {
        moveItem: function(index, delta) {
            let newIndex = index + delta;
            let tempValue = this.array[newIndex];
            this.$set(this.array, newIndex, this.array[index]);
            this.$set(this.array, index, tempValue);
            // this.array[newIndex] = this.array[index];
            // this.array[index] = tempValue;
            this.doEmit();
            // this.$forceUpdate();
        },
        newItem: function(e, value = ''){
            let newIndex = this.array.length;
            this.array.push(value);
            this.doEmit();
            this.$forceUpdate();
            this.$nextTick(() => {
                this.focusMember(newIndex);
            });
        },
        newObjectItem: function(e){
            this.newItem(e, {});
        },
        newArrayItem: function(e){
            this.newItem(e, []);
        },
        newBooleanItem: function(e){
            this.newItem(e, false);
        },
        newNumberItem: function(e){
            this.newItem(e, 1.0);
        },
        toggleAll: function() {
            let minimized = true;
            if (this.allMinimized) {
                minimized = false;
            }
            for (let i=0; i<this.array.length; i++){
                let refName = 'member-editor_' + i;
                let child = this.getRefDescendant([refName, 'object-value-editor', 'object-editor-section-fieldset']);
                if (child && child.setMinimized) {
                    child.setMinimized(minimized);
                }
            }
            this.allMinimized = !this.allMinimized;
        },
        removeItem: function(e, index) {
            this.array.splice(index, 1);
            this.doEmit();
            this.refreshDragula();
        },
        cloneItem: function(index){
            let newIndex = this.array.length;
            this.array.push(_.cloneDeep(this.array[index]));
            this.doEmit();
            this.$nextTick(() => {
                this.scrollToMember(newIndex);
            });
        },
        focusMember (index) {
            this.$nextTick(() => {
                let newRef = this.getRef('member-editor_' + index);
                if (newRef && newRef.setFocus) {
                    newRef.setFocus();
                }
            });
        },
        scrollToMember (index) {
            this.$nextTick(() => {
                let newRef = this.getRef('member-editor_' + index);
                if (newRef && newRef.$el) {
                    newRef.$el.scrollIntoViewIfNeeded(true);
                    this.focusMember(index);
                }
            });
        },
        arrayChanged (value) {
            this.doEmit(value);
        },
        checkMinimizableChildren () {
            for (let i=0; i<this.array.length; i++){
                let refName = 'member-editor_' + i;
                let child = this.getRefDescendant([refName, 'object-value-editor', 'object-editor-section-fieldset']);
                if (child && child.toggleMinimized) {
                    this.hasMinimizableChildren = true;
                    return;
                }
            }
            this.hasMinimizableChildren = false;
        },
        // doEmit(eventName = 'change', value) {
        //     if (_.isUndefined(value)) {
        //         value = this.array;
        //     }
        //     this.$emit(eventName, value);
        // },
        doEmit (value, eventName){
            if (!eventName) {
                eventName = this.eventName;
            }
            if (_.isUndefined(value)){
                value = this.array;
            }
            this.$emit(eventName, value);
        },
        itemDropped: function(){
            this.doEmit(this.array, 'change');
            this.refreshDragula();
        },
        refreshDragula () {
            this.dragulaInitialized = false;
            this.$nextTick(() => {
                this.dragulaInitialized = true;
            });
        },
        getFieldsetClasses () {
            let classes = 'value-fieldset-array';
            if (this.componentOptions.viewerMode.enabled){
                classes += ' object-fieldset-viewer';
            }
            return classes;
        }
    }
};