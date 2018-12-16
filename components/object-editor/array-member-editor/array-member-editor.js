const _ = require('lodash');
const ObjectEditorBase = require('../objectEditorBase.js').component;

// var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();

exports.component = {
    name: 'array-member-editor',
    template: '',
    extends: ObjectEditorBase,
    props: {
        array: {
            type: [Array],
            required: true
        },
        index: {
            type: [Number],
            required: true
        },
        originalIndex: {
            type: [Number],
            required: true
        },
        moveItem: {
            type: Function,
            required: true
        },
        removeItem: {
            type: Function,
            required: true
        },
        cloneItem: {
            type: Function,
            required: true
        },
        onChange: {
            type: Function
        },
        // initialMinimized: {
        //     type: Boolean,
        //     default: false
        // },
        // preventMinimize: {
        //     type: Boolean,
        //     default: false,
        // },
        // renderFieldset: {
        //     type: Boolean,
        //     default: true
        // },
        // allowDeleting: {
        //     type: Boolean,
        //     default: true
        // },
        // allowAdding: {
        //     type: Boolean,
        //     default: true
        // },
        // allowAddingTypes: {
        //     type: Array,
        //     default: function() {
        //         return [
        //             'object',
        //             'array',
        //             'boolean',
        //             'number',
        //         ];
        //     }
        // },
    },
    data: function () {
        return {
            showEditor: true
        };
    },

    methods: {
        valueChanged() {
            if (this.onChange && _.isFunction(this.onChange)){
                this.onChange(this.array);
            }
        },
        isObjectControl () {
            return _.isObject(this.array[this.index]);
        },
        isArrayControl () {
            return _.isArray(this.array[this.index]);
        },
        isNumberControl () {
            return _.isFinite(this.array[this.index]);
        },
        isBooleanControl () {
            return _.isBoolean(this.array[this.index]);
        },
        setFocus () {
            this.focusElement('.value-editor-input');
        },
        remove (e) {
            this.removeItem(e, this.index);
        }
    }
};