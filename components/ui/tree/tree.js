/**
 * @fileOverview tree component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

const _ = require('lodash');

var _appWrapper = window.getAppWrapper();
var appState = _appWrapper.getAppState();

/**
 * App debug component
 *
 * @name tree
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
    name: 'tree',
    template: '',
    itemMethods: {},
    props: {
        openOnItemClick: {
            type: Boolean,
            required: false,
            default: function(){
                return false;
            }
        },
        onItemSelect: {
            type: Function,
            required: false
        },
        onItemDeselect: {
            type: Function,
            required: false
        },
        onChange: {
            type: Function,
            required: false
        },

        listTransition: {
            type: String,
            required: false
        },

        allowCloning: {
            type: Boolean,
            required: false,
            default: function(){
                return true;
            }
        },

        allowDeleting: {
            type: Boolean,
            required: false,
            default: function(){
                return true;
            }
        },

        allowCreating: {
            type: Boolean,
            required: false,
            default: function(){
                return true;
            }
        },

        allowDragdrop: {
            type: Boolean,
            required: false,
            default: function(){
                return true;
            }
        },

        defaultItem: {
            type: Object,
            required: false,
            default: function(){
                return _.cloneDeep({
                    data: {},
                    dataControlOptions: {},
                    node: {
                        name: 'Item',
                        open: false,
                        busy: false,
                        readonly: false,
                        disabled: false,
                        selected: false,
                        classes: [],
                    },
                    children:[]
                });
            }
        },
        data: {
            type: Object,
            required: false,
            default: function(){
                return {
                    item: {
                        data: {},
                        node: {
                            name: 'Root',
                            open: true,
                            busy: false,
                            readonly: false,
                            disabled: false,
                            selected: true,
                            classes: [],
                        },
                        children:[
                            {
                                data: {},
                                node: {
                                    name: 'Item 1',
                                    open: false,
                                    readonly: false,
                                    disabled: false,
                                    selected: false,
                                    classes: [],
                                },
                                children: []
                            },
                            {
                                data: {},
                                node: {
                                    name: 'Item 2',
                                    open: false,
                                    readonly: false,
                                    disabled: false,
                                    selected: false,
                                    classes: [],
                                },
                                children: [
                                    {
                                        data: {},
                                        node: {
                                            name: 'Item 2 child',
                                            open: false,
                                            readonly: false,
                                            disabled: false,
                                            selected: false,
                                            classes: [],
                                        },
                                        children: []
                                    },
                                    {
                                        data: {},
                                        node: {
                                            name: 'Item 2 child 2',
                                            open: false,
                                            readonly: false,
                                            disabled: false,
                                            selected: false,
                                            classes: [],
                                        },
                                        children: []
                                    }
                                ]
                            },
                            {
                                data: {},
                                node: {
                                    name: 'Item 3',
                                    open: true,
                                    readonly: false,
                                    disabled: false,
                                    selected: false,
                                    classes: [],
                                },
                                children: [
                                    {
                                        data: {},
                                        node: {
                                            name: 'Item 3 child',
                                            open: true,
                                            readonly: false,
                                            disabled: false,
                                            selected: false,
                                            classes: [],
                                        },
                                        children: [
                                            {
                                                data: {},
                                                node: {
                                                    name: 'Item 3 grandchild 1',
                                                    open: true,
                                                    readonly: false,
                                                    disabled: false,
                                                    selected: false,
                                                    classes: [],
                                                },
                                                children: [
                                                    {
                                                        data: {},
                                                        node: {
                                                            name: 'Item 3 grand-grand-child 1',
                                                            open: true,
                                                            readonly: false,
                                                            disabled: false,
                                                            selected: false,
                                                            classes: [],
                                                        },
                                                        children: []
                                                    },
                                                ]
                                            },
                                            {
                                                data: {},
                                                node: {
                                                    name: 'Item 3 grandchild 2',
                                                    open: true,
                                                    readonly: false,
                                                    disabled: false,
                                                    selected: false,
                                                    classes: [],
                                                },
                                                children: []
                                            },
                                        ]
                                    },
                                    {
                                        data: {},
                                        node: {
                                            name: 'Item 3 child 2',
                                            open: false,
                                            readonly: false,
                                            disabled: false,
                                            selected: false,
                                            classes: [],
                                        },
                                        children: []
                                    }
                                ]
                            },
                            {
                                data: {},
                                node: {
                                    name: 'Item 4',
                                    open: false,
                                    readonly: false,
                                    disabled: true,
                                    selected: false,
                                    classes: [],
                                },
                                children: [
                                    {
                                        data: {},
                                        node: {
                                            name: 'Item 4 child',
                                            open: false,
                                            readonly: false,
                                            disabled: false,
                                            selected: false,
                                            classes: [],
                                        },
                                        children: []
                                    },
                                    {
                                        data: {},
                                        node: {
                                            name: 'Item 4 child 2',
                                            open: false,
                                            readonly: false,
                                            disabled: false,
                                            selected: false,
                                            classes: [],
                                        },
                                        children: []
                                    }
                                ]
                            }
                        ]
                    }
                };
            }
        },
    },
    created: function(){
        this.itemMethods = {
            getTreeItemClasses: this.getTreeItemClasses.bind(this),
            hasChildren: this.hasChildren.bind(this),
            isOpen: this.isOpen.bind(this),
            itemIconClick: this.itemIconClick.bind(this),
            itemClick: this.itemClick.bind(this),
            getSelectedItem: this.getSelectedItem.bind(this),
            getItem: this.getItem.bind(this),
            getItemParent: this.getItemParent.bind(this),
            getItemIdentifier: this.getItemIdentifier.bind(this),
            selectItem: this.selectItem.bind(this),
            deselectItem: this.deselectItem.bind(this),
            deleteItem: this.deleteItem.bind(this),
            addChild: this.addChild.bind(this),
            cloneItem: this.cloneItem.bind(this),
            onChangeHandler: this.onChangeHandler.bind(this),
            isItemInSelection: this.isItemInSelection.bind(this),
            toggleItemInSelection: this.toggleItemInSelection.bind(this),
        };
        window._tree = this;
    },
    mounted: function(){
        this.itemNameMap = this.getItemNameMap();
        this.allCollapsed = this.areAllCollapsed();
        let selectedItem = this.getSelectedItem();
        if (selectedItem && this.onItemSelect && _.isFunction(this.onItemSelect)) {
            this.onItemSelect(selectedItem);
        }
        this.initialized = true;
        window._item = this.data.item;
    },

    data: function () {
        let options = {
            allowCloning: true,
            allowCreating: true,
            allowDeleting: true,
            allowDragdrop: true,
        };
        let optionKeys = Object.keys(options);
        for (let i=0; i<optionKeys.length; i++){
            if (!_.isUndefined(this[optionKeys[i]])){
                options[optionKeys[i]] = this[optionKeys[i]];
            }
        }
        return {
            drakeId: null,
            initialized: false,
            item: this.data.item,
            itemNameMap: [],
            allCollapsed: true,
            selectMode: false,
            selectionIdentifiers: [],
            options: options,
        };
    },
    methods: {
        getDrakeId: function(){
            if (!this.drakeId) {
                this.drakeId = _.uniqueId('tree_');
            }
            return this.drakeId;
        },
        refresh: function(){
            this.$nextTick(() => {
                this.$forceUpdate();
            });
        },
        toggleItemOpen: function(item) {
            if (item && !_.isUndefined(item.node.open)) {
                item.node.open = !item.node.open;
            }
        },
        openCloseRecursive: function(item, open) {
            if (item && !_.isUndefined(item.node.open)) {
                item.node.open = open;
                if (this.hasChildren(item)) {
                    for (let i=0; i<item.children.length; i++) {
                        this.openCloseRecursive(item.children[i], open);
                    }
                }
            }
        },
        areAllCollapsed: function(item){
            let allCollapsed = true;
            if (!item) {
                item = this.data.item;
            }
            if (this.getItemIdentifier(item) && item.node.open && this.hasChildren(item)) {
                allCollapsed = false;
            }
            if (allCollapsed && this.hasChildren(item)) {
                for (let i=0; i<item.children.length; i++) {
                    allCollapsed = allCollapsed && this.areAllCollapsed(item.children[i]);
                    if (!allCollapsed) {
                        break;
                    }
                }
            }
            return allCollapsed;
        },
        getSelectedItem: function(root) {
            if (!root) {
                root = this.item;
            }
            let selectedItem;
            if (root.node.selected) {
                selectedItem = root;
            } else {
                for (let i=0; i<root.children.length; i++) {
                    let selected = this.getSelectedItem(root.children[i]);
                    if (selected){
                        // console.log(i, root.children[i]);
                        selectedItem = selected;
                        break;
                    }
                }
            }
            return selectedItem;
        },
        getItemIdentifier: function(item, scope, identifierPrepend = '') {
            let identifier = '';
            let scopeIsRoot = false;
            if (!scope) {
                scope = [this.item];
                scopeIsRoot = true;
            }
            let foundItem = false;
            for (let i=0; i<scope.length; i++) {
                if (_.isEqual(scope[i], item)) {
                    if (scopeIsRoot) {
                        return '';
                    }
                    identifier += '_' + i;
                    foundItem = true;
                    break;
                }
            }
            if (!foundItem) {
                for (let i=0; i<scope.length; i++) {
                    let prepend = identifierPrepend;
                    if (!scopeIsRoot){
                        prepend += '_' + i;
                    }
                    let childIdentifier = this.getItemIdentifier(item, scope[i].children, prepend);
                    if (childIdentifier){
                        identifier = childIdentifier;
                        break;
                    }
                }
            } else {
                identifier = identifierPrepend + identifier;
            }
            if (!identifierPrepend) {
                identifier = identifier.replace(/^_/, '');
            }
            return identifier;
        },
        getItem: function(identifier) {
            let root = this.data.item;
            let item = root;
            let undef;
            if (identifier) {
                let identifierChunks = identifier.split('_');
                for (let i=0; i<identifierChunks.length; i++) {
                    if (item.children && item.children[identifierChunks[i]]) {
                        item = item.children[identifierChunks[i]];
                    } else {
                        item = undef;
                        break;
                    }
                }
            }
            return item;
        },
        getItemParent: function(item) {
            let identifier = item;
            let parent;
            if (!_.isString(item)) {
                identifier = this.getItemIdentifier(item);
            }
            if (identifier) {
                let identifierChunks = identifier.split('_');
                if (identifierChunks.length > 0) {
                    let parentIdentifier = identifierChunks.slice(0, -1).join('_');
                    parent = this.getItem(parentIdentifier);
                }
            }
            return parent;
        },
        selectItem: function(item) {
            let selectedItem = this.getSelectedItem();
            if (selectedItem && selectedItem.node.selected) {
                selectedItem.node.selected = false;
            }
            if (item && !_.isUndefined(item.node.selected) && !item.node.selected){
                item.node.selected = true;
                if (this.onItemSelect && _.isFunction(this.onItemSelect)) {
                    this.onItemSelect(item);
                }
            }
        },
        deselectItem: function(item) {
            if (item && item.node.selected) {
                item.node.selected = false;
                if (this.onItemDeselect && _.isFunction(this.onItemDeselect)) {
                    this.onItemDeselect(item);
                }
            }
        },
        deleteItem: function(item) {
            if (item.node.selected) {
                this.deselectItem(item);
            }
            let parent = this.getItemParent(item);
            // let childCount = parent.children.length;
            let childIndex = _.findIndex(parent.children, (child) => _.isEqual(child, item));
            parent.children.splice(childIndex, 1);
            if (this.onItemDeselect && _.isFunction(this.onItemDeselect)) {
                this.onItemDeselect(item);
            }
            this.onChangeHandler();
        },
        getNewItem: function(){
            return _.cloneDeep(this.defaultItem);
        },
        addChild: function(item) {
            if (item && item.children) {
                let newItem = this.getNewItem();
                item.children.push(newItem);
                if (!this.isOpen(item)) {
                    this.toggleItemOpen(item);
                }
                this.onChangeHandler();
            }
        },
        cloneItem: function(item) {
            if (item) {
                let itemClone = this.getItemClone(item);
                let parent = this.getItemParent(item);
                if (!parent){
                    parent = this.data.item;
                }
                let identifier = this.getItemIdentifier(item);
                let itemIndex = (+_.last(identifier.split('_'))) + 1;
                parent.children = _.concat(parent.children.slice(0, itemIndex), [itemClone], parent.children.slice(itemIndex));
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.selectItem(parent.children[itemIndex]);
                        this.onChangeHandler();
                    }, 100);
                });
            }
        },
        getItemClone: function(item) {
            let itemClone = _.cloneDeep(item);
            let name = itemClone.node.name + ' clone';
            let counter = 0;
            while (this.itemNameMap.indexOf(name) !== -1) {
                counter++;
                name = itemClone.node.name + ' clone ' + counter;
            }
            itemClone.node.name = name;
            itemClone.node.selected = false;
            if (this.hasChildren(itemClone)) {
                let children = [];
                for (let i=0; i<itemClone.children.length; i++) {
                    children.push(this.getItemClone(itemClone.children[i]));
                }
                itemClone.children = children;
            }
            return itemClone;
        },
        getItemNameMap: function(rootItem, itemNameMap = []){
            if (!rootItem) {
                rootItem = this.data.item;
            }
            itemNameMap.push(rootItem.node.name);
            if (this.hasChildren(rootItem)) {
                for (let i=0; i<rootItem.children.length; i++) {
                    this.getItemNameMap(rootItem.children[i], itemNameMap);
                }
            }
            return itemNameMap;
        },
        onChangeHandler: function() {
            this.itemNameMap = this.getItemNameMap();
            if (this.onChange && _.isFunction(this.onChange)) {
                this.onChange(this.data.item);
            }
        },

        getCollapseExpandAllText: function(){
            let text = 'Collapse all';
            if (this.areAllCollapsed()) {
                text = 'Expand all';
                this.allCollapsed = true;
            } else {
                this.allCollapsed = false;
            }
            return text;
        },
        getCollapseExpandAllIconClasses: function(){
            let classes = ['fa'];
            if (this.areAllCollapsed()) {
                classes.push('fa-expand');
            } else {
                classes.push('fa-compress');
            }
            return classes;
        },
        collapseExpandAll: function(){
            if (this.allCollapsed) {
                this.openCloseRecursive(this.data.item, true);
            } else {
                this.openCloseRecursive(this.data.item, false);
                this.toggleItemOpen(this.data.item);
            }
            this.allCollapsed = !this.allCollapsed;
        },

        toggleItemInSelection: function(item, doSelect) {
            let identifier = this.getItemIdentifier(item);
            if (identifier) {
                if (_.isUndefined(doSelect)){
                    if (this.isItemInSelection(item)) {
                        let identifierIndex = _.findIndex(this.selectionIdentifiers, (selectionIdentifier) => selectionIdentifier == identifier);
                        this.selectionIdentifiers.splice(identifierIndex, 1);
                        doSelect = false;
                    } else {
                        this.selectionIdentifiers.push(identifier);
                        doSelect = true;
                    }
                } else {
                    if (doSelect) {
                        if (!this.isItemInSelection(item)) {
                            this.selectionIdentifiers.push(identifier);
                        }
                    } else {
                        if (this.isItemInSelection(item)) {
                            let identifierIndex = _.findIndex(this.selectionIdentifiers, (selectionIdentifier) => selectionIdentifier == identifier);
                            this.selectionIdentifiers.splice(identifierIndex, 1);
                        }
                    }
                }
                this.selectionIdentifiers.sort();
                if (this.hasChildren(item) && appState.status.ctrlPressed) {
                    for (let i=0; i<item.children.length; i++) {
                        this.toggleItemInSelection(item.children[i], doSelect);
                    }
                }
            }
        },
        isItemInSelection: function(item) {
            let inSelection = false;
            let identifier = this.getItemIdentifier(item);
            if (identifier && this.selectionIdentifiers.indexOf(identifier) !== -1) {
                inSelection = true;
            }
            return inSelection;
        },
        deleteSelected: function(){
            let identifiers = this.selectionIdentifiers.reverse();
            for (let i=0; i<identifiers.length; i++) {
                let item = this.getItem(identifiers[i]);
                this.deleteItem(item);
            }
            this.selectionIdentifiers = [];
        },
        setSelectedDisabled: function(){
            let identifiers = this.selectionIdentifiers.reverse();
            let disabled = !this.areSelectedDisabled();
            for (let i=0; i<identifiers.length; i++) {
                let item = this.getItem(identifiers[i]);
                item.node.disabled = disabled;
            }
        },
        setSelectedReadonly: function(){
            let identifiers = this.selectionIdentifiers.reverse();
            let readonly = !this.areSelectedReadonly();
            for (let i=0; i<identifiers.length; i++) {
                let item = this.getItem(identifiers[i]);
                item.node.readonly = readonly;
            }
        },
        areSelectedDisabled: function(){
            let disabled = true;
            let identifiers = _.cloneDeep(this.selectionIdentifiers).reverse();
            for (let i=0; i<identifiers.length; i++) {
                let item = this.getItem(identifiers[i]);
                disabled = disabled && item.node.disabled;
                if (!disabled) {
                    break;
                }
            }
            return disabled;
        },
        areSelectedReadonly: function(){
            let readonly = true;
            let identifiers = _.cloneDeep(this.selectionIdentifiers).reverse();
            for (let i=0; i<identifiers.length; i++) {
                let item = this.getItem(identifiers[i]);
                readonly = readonly && item.node.readonly;
                if (!readonly) {
                    break;
                }
            }
            return readonly;
        },
        clearSelection: function(){
            this.selectionIdentifiers = [];
        },
        selectAll: function(item){
            if (!item) {
                item = this.data.item;
            }
            if (!this.isItemInSelection(item)) {
                this.toggleItemInSelection(item);
            }
            if (this.hasChildren(item)) {
                for (let i=0; i<item.children.length; i++) {
                    this.selectAll(item.children[i]);
                }
            }
        },
        canSelectAll: function(){
            return this.selectionIdentifiers.length < (this.itemNameMap.length - 1);
        },
        getSelectedCountText: function(){
            let text = '';
            if (!this.selectionIdentifiers.length) {
                text = this.translate('No items selected');
            } else if (this.selectionIdentifiers.length % 10 == 1) {
                text = this.translate('{1} item selected', '', [this.selectionIdentifiers.length]);
            } else {
                text = this.translate('{1} items selected', '', [this.selectionIdentifiers.length]);
            }
            return text;
        },



        getTreeItemClasses: function(item){
            let classes = ['tree-item-wrapper'];
            if (item.node.open) {
                classes.push('tree-item-wrapper-open');
            }
            if (item.node.readonly) {
                classes.push('tree-item-wrapper-readonly');
            }
            if (item.node.disabled) {
                classes.push('tree-item-wrapper-disabled');
            }
            if (item.node.selected) {
                classes.push('tree-item-wrapper-selected');
            }
            return classes;
        },
        hasChildren: function(item){
            return item.children && item.children.length;
        },
        isOpen: function(item){
            return item.node.open;
        },
        itemIconClick: function(item, e){
            e.preventDefault();
            // console.log('itemIconClick');
            this.toggleItemOpen(item);
        },
        itemClick: function(item, e){
            e.preventDefault();
            this.selectItem(item);
            if (this.openOnItemClick) {
                this.toggleItemOpen(item);
            }
            // console.log('itemClick');
        },
        setItem(item) {
            this.item = item;
        },

        getItemMethods: function(){
            return this.itemMethods;
        }
    },
    computed: {},
    watch: {
        'selectMode': function(value) {
            if (!value){
                this.clearSelection();
            }
        }
    }
};