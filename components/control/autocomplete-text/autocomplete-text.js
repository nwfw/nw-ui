/**
 * @fileOverview autocomplete-text component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

const _ = require('lodash');

var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();

/**
 * Autocomplete text control component
 *
 * Displays text input element with autocomplete derived from 'autocompleteData' array property.
 * By default, input will have tabindex '-1' but it can be passed as a 'tabindex' property if needed. It can display icon-link-confirm button
 * for clearing data if property 'clearDataMethod' is passed as fuction. Data clearing should be handled in parent component in the function
 * that is passed as 'clearDataMethod' property to avoid prop mutation. Upon selecting item from autocomplete list or on input blur event
 * it will fire 'input' event on itself so v-model passed to component gets updated. Blur event model updating is delayed by 500 milliseconds.
 *
 * @name autocomplete-text
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
    name: 'autocomplete-text',
    template: '',
    blurTimeout: null,
    props: {
        autocompleteData: Array,
        value: {
            default: '',
        },
        minChars: {
            type: Number,
            default: 1
        },
        tabindex: {
            type: String,
            default: '-1'
        },
        clearDataMethod: [Function, undefined]
    },

    /**
     * Created component handler, sets blurTimeout property to null
     *
     * @return {undefined}
     */
    created: function(){
        this.blurTimeout = null;
    },

    /**
     * Component data function
     *
     * @return {Object} Component data object
     */
    data: function () {
        return {
            autocompleteList: [],
            activeIndex: 0,
            showList: false,
            currentValue: '',
            ignoreKeys: ['Shift', 'Meta', 'Control', 'Alt', ',', 'Backspace', 'Esc'],
        };
    },
    methods: {
        /**
         * Resets data (clears and hides autocomplete list)
         *
         * @return {undefined}
         */
        resetData: function(){
            this.autocompleteList = [];
            this.showList = false;
            this.setActiveIndex(0, true);
        },

        /**
         * Handles input 'blur' method - sets timeout to update v-model with 500ms delay
         *
         * @return {undefined}
         */
        handleBlur: function(e) {
            clearTimeout(this.blurTimeout);
            this.blurTimeout = setTimeout(() => {
                this.updateModel();
                this.resetData();
            }, 500);
            this.$emit('blur', e);
        },

        handleFocus(e) {
            this.$emit('focus', e);
        },

        /**
         * Handles 'Escape' keyup event, hiding list if it is visible, if not, bubbles the event (passes it to parents)
         *
         * @return {undefined}
         */
        handleEscKey: function(e) {
            if (this.showList) {
                this.resetData();
                e.stopImmediatePropagation();
                // e.stopPropagation();
                e.preventDefault();
            }
        },

        /**
         * Handles 'keyup' event on input. Depending on key pressed, it will ignore event if key is one of members of this.ignoreKeys array,
         * set active item (if up/down arrows are pressed and list is visible) or show list if arrows are pressed and list is not visible,
         * or update input value and model if enter is pressed and active item is present
         *
         * @return {undefined}
         */
        handleKeyUp: function(e){
            let input = this.$el.querySelector('.autocomplete-text-input');
            if (this.minChars && input.value.length < this.minChars) {
                return;
            }
            if (_.includes(this.ignoreKeys, e.key)) {
                e.preventDefault();
            } else if (this.showList && this.autocompleteList.length && _.includes(['ArrowDown','ArrowUp'], e.key)) {
                e.preventDefault();
                let maxIndex = this.autocompleteList.length - 1;
                let nextIndex = this.activeIndex;
                if (e.key == 'ArrowDown') {
                    nextIndex++;
                } else {
                    if (e.key == 'ArrowUp') {
                        nextIndex--;
                    }
                }
                if (nextIndex > maxIndex) {
                    nextIndex = 0;
                } else if (nextIndex < 0) {
                    nextIndex = maxIndex;
                }
                this.setActiveIndex(nextIndex);
            } else if (!this.showList && _.includes(['ArrowDown'], e.key)) {
                this.displayList('', e);
            } else if (this.showList && this.autocompleteList.length && _.includes(['Enter'], e.key)) {
                this.pickItem(e);
            } else {
                this.displayList(input.value, e);
            }
            this.$emit('keyup', e);
        },

        handleKeyDown(e){
            this.$emit('keydown', e);
        },

        /**
         * Sets active index to value from parameter (0 is default)
         *
         * @return {undefined}
         */
        setActiveIndex(index = 0, noScroll = false) {
            this.activeIndex = index;
            let currentValue = '';
            if (this.autocompleteList.length > this.activeIndex) {
                currentValue = this.autocompleteList[this.activeIndex];
            }
            this.currentValue = currentValue;
            if (this.showList && !noScroll) {
                this.$nextTick(() => {
                    this.setListScroll();
                });
            }
        },

        /**
         * Updates input value, model and resets data (hides list and resets values to defaults)
         *
         * @return {undefined}
         */
        updateValue: function(value) {
            let input = this.$el.querySelector('.autocomplete-text-input');
            input.value = value;
            this.resetData();
            this.updateModel();
        },

        /**
         * Updates v-model by firing 'input' event on itself
         *
         * @return {undefined}
         */
        updateModel: function() {
            let input = this.$el.querySelector('.autocomplete-text-input');
            this.$emit('input', input.value);
        },

        /**
         * Displays list filtered by 'value' parameter. If filtering returns no values it will hide the list and update model to value in input
         *
         * @return {undefined}
         */
        displayList: function(value, e){
            let input = this.$el.querySelector('.autocomplete-text-input');
            let utilHelper = _appWrapper.getHelper('util');
            let data = this.autocompleteData;
            let list = [];
            if (data && data.length) {
                if (value) {
                    for (let i=0; i<data.length; i++){
                        if (data[i].match(new RegExp(utilHelper.quoteRegex(value), 'i'))) {
                            list.push(data[i]);
                        }
                    }
                } else {
                    list = _.cloneDeep(data);
                }
                if (list && list.length) {
                    if (e && e.preventDefault && _.isFunction(e.preventDefault)) {
                        e.preventDefault();
                    }
                    this.autocompleteList = list;
                    this.showList = true;
                    this.setActiveIndex(0);
                } else {
                    this.updateModel();
                }
            } else {
                this.resetData();
                this.updateModel();
            }
        },

        /**
         * Picks item using this.activeIndex to determine correct value
         *
         * @return {undefined}
         */
        pickItem: function(e) {
            if (e && e.preventDefault && _.isFunction(e.preventDefault)) {
                e.preventDefault()
            }
            if (this.autocompleteList.length > this.activeIndex) {
                let activeItem = this.autocompleteList[this.activeIndex];
                if (activeItem) {
                    this.updateValue(activeItem);
                }
            }
        },

        /**
         * Handles click event on list elements, setting value based on passed 'index' parameter
         *
         * @return {undefined}
         */
        clickItem: function(index) {
            clearTimeout(this.blurTimeout);
            if (!_.isUndefined(index)) {
                if (this.autocompleteList.length > index) {
                    let activeItem = this.autocompleteList[index];
                    if (activeItem) {
                        this.updateValue(activeItem);
                        this.focusInput();
                    }
                }
            } else {
                this.focusInput();
            }
        },

        /**
         * Handles hover event on list elements, setting active index to value based on passed 'index' parameter
         *
         * @return {undefined}
         */
        hoverItem: function(index) {
            this.setActiveIndex(index, true);
        },

        /**
         * Clears autocomplete data by calling property this.clearDataMethod if present and resets component data and list
         * Actual autocomplete data clearing should be handled in parent component to avoid prop mutation issues
         *
         * @return {undefined}
         */
        clearAutocompleteData: function(){
            if (this.clearDataMethod && _.isFunction(this.clearDataMethod)) {
                clearTimeout(this.blurTimeout);
                this.clearDataMethod();
                this.resetData();
                this.focusInput();
            }
        },

        /**
         * Confirm click handler for clear data icon (called before action is confirmed)
         *
         * @return {undefined}
         */
        clearConfirmClick: function(){
            if (this.clearDataMethod && _.isFunction(this.clearDataMethod)) {
                clearTimeout(this.blurTimeout);
            }
        },

        /**
         * Handles icon-link-confirm timeout (sets focus back to input field)
         *
         * @return {undefined}
         */
        clearConfirmTimeout: function(){
            this.focusInput();
        },

        /**
         * Focuses input element
         *
         * @return {undefined}
         */
        focusInput: function(){
            let input = this.$el.querySelector('.autocomplete-text-input');
            if (input && input.focus && _.isFunction(input.focus)) {
                input.focus();
            }
        },

        /**
         * Sets list scroll (if it has scroll) so selected element is visible
         *
         * @return {undefined}
         */
        setListScroll: function() {
            let listEl = this.$el.querySelector('.autocomplete-text-list');
            if (this.activeIndex > 0) {
                if (listEl && listEl.scrollHeight > listEl.clientHeight) {
                    let currentItemEl = listEl.querySelector('.autocomplete-text-list-item-active');
                    if (currentItemEl){
                        let itemTop = currentItemEl.offsetTop;
                        let itemHeight = currentItemEl.clientHeight;
                        let itemBottom = itemTop + itemHeight;
                        let newScrollTop = itemTop - itemHeight / 2;
                        listEl.scrollTop = newScrollTop;
                    }
                }
            } else {
                listEl.scrollTop = 0;
            }
        }
    },
    computed: {}
};