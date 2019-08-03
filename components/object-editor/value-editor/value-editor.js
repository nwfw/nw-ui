const _ = require('lodash');
const ObjectEditorBase = require('../objectEditorBase.js').component;

// var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();

exports.component = {
    name: 'value-editor',
    extends: ObjectEditorBase,
    template: '',
    props: {
        item: {
            required: true
        },
        title: {
            type: String,
            default: 'Value'
        },
        eventName: {
            type: String,
            default: 'change'
        },

    },
    data: function () {
        return {
            valuePlaceholder: null
        };
    },
    beforeMount () {
        if (!this.isArray() && !this.isObject()) {
            if (this.isDate() && this.item){
                let fh = window.appWrapper.getHelper('format');
                this.valuePlaceholder = fh.formatDateNormalize(this.item);
            } else {
                this.valuePlaceholder = this.item;
            }
        }
    },
    methods: {
        isDate () {
            return _.isDate(this.item);
        },
        isObject () {
            return _.isObject(this.item) && !_.isDate(this.item);
        },
        isArray () {
            return _.isArray(this.item);
        },
        isBoolean () {
            return _.isBoolean(this.item);
        },
        isString () {
            return _.isString(this.item);
        },
        isNumber () {
            return _.isFinite(this.item);
        },
        doEmit (value, eventName){
            if (!eventName) {
                eventName = this.eventName;
            }
            if (_.isUndefined(value)){
                value = this.item;
            }
            this.$emit(eventName, value);
        },
        handleChange (value) {
            this.doEmit(value);
        },
        placeholderChanged () {
            this.handleChange(this.valuePlaceholder);
        }
    }
};