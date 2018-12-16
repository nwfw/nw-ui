const _ = require('lodash');
const ObjectEditorBase = require('../objectEditorBase.js').component;

// var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();

exports.component = {
    name: 'object-editor',
    template: '',
    extends: ObjectEditorBase,
    props: {
        object: {
            type: Object,
            required: true
        },
        title: {
            type: String,
            default: 'Object'
        }
    },
    data: function () {
        return {};
    },
    methods: {
        newItem: function(e, value = ''){
            let newNameBase = 'newItem';
            let newName = 'newItem';
            let names = Object.keys(this.object);
            let counter = 1;
            while (names.indexOf(newName) != -1) {
                newName = newNameBase + '_' + counter;
                counter++;
            }
            this.object[newName] = value;
            this.$forceUpdate();
            this.doEmit();
            this.$nextTick(() => {
                let ref = this.getRef('property-editor_' + newName);
                if (ref){
                    if (ref.$el) {
                        ref.$el.scrollIntoViewIfNeeded(true);
                        this.$nextTick(() => {
                            if (ref.toggleRenaming) {
                                ref.toggleRenaming();
                            }
                        });
                    }
                }
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
        removeItem: function(name) {
            delete this.object[name];
            this.$forceUpdate();
            this.doEmit();
        },
        getTitlePrependText(name) {
            let text = '';
            if (_.isArray(this.object[name])){
                text = 'array';
            } else if (_.isObject(this.object[name])){
                text = 'object';
            } else if (_.isBoolean(this.object[name])){
                text = 'boolean';
            } else if (_.isNumber(this.object[name])){
                text = 'number';
            } else if (_.isString(this.object[name])){
                text = 'string';
            }
            return text;
        },
        renameItem: function(newName, oldName) {
            delete this.object[oldName];
            this.$forceUpdate();
            this.$nextTick(() => {
                let newRef = this.getRef('property-editor_' + newName);
                if (newRef && newRef.setFocus) {
                    newRef.setFocus();
                }
            });
            this.doEmit();
        },
        objectChanged (value) {
            this.doEmit('change', value);
        },

        doEmit(eventName = 'change', value) {
            if (_.isUndefined(value)) {
                value = this.object;
            }
            this.$emit(eventName, value);
        },
        isObject (name) {
            return _.isObject(this.object[name]);
        },
        isArray (name) {
            return _.isArray(this.object[name]);
        },
        isBoolean (name) {
            return _.isBoolean(this.object[name]);
        },
        isString (name) {
            return _.isString(this.object[name]);
        },
        isNumber (name) {
            return _.isFinite(this.object[name]);
        },
        getPropertyFieldsetClass (name) {
            let className = 'property';
            if (!this.isObject(name) && !this.isArray(name)) {
                className = this.getTitlePrependText(name);
            }
            return className;
        },
        cloneItem (name) {
            let newNameBase = name;
            let newName = name;
            let names = Object.keys(this.object);
            let counter = 1;
            while (names.indexOf(newName) != -1) {
                newName = newNameBase + '_' + counter;
                counter++;
            }
            this.object[newName] = _.cloneDeep(this.object[name]);
            this.$forceUpdate();
            this.doEmit();
            this.$nextTick(() => {
                let ref = this.getRef('property-editor_' + newName);
                if (ref){
                    if (ref.$el) {
                        ref.$el.scrollIntoViewIfNeeded(true);
                        this.$nextTick(() => {
                            if (ref.toggleRenaming) {
                                ref.toggleRenaming();
                            }
                        });
                    }
                }
            });
        },
        getFieldsetClasses () {
            let fieldsetClasses = 'value-fieldset-object';
            if (this.isRoot) {
                fieldsetClasses += ' root-object-fieldset';
            }
            return fieldsetClasses;
        }
    }
};