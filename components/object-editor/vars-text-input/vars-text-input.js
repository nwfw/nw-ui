const _ = require('lodash');

var _appWrapper = window.getAppWrapper();

exports.component = {
    name: 'vars-text-input',
    template: '',
    props: {
        value: {
            required: true
        },
        type: {
            type: String,
            default: 'text'
        },
        inputClass: {
            type: String,
            default: ''
        },
        eventName: {
            type: String,
            default: 'input'
        }
    },
    data: function () {
        return {
            showSuggestions: false,
            showSuggestionsTop: false,
            autocompleteData: [],
            autocompleteMethodData: {},
            activeSuggestionIndex: 0,
            matchedSuggestions: [],
            currentValue: '',
            processedValue: '',
            hasVars: false,
            listStyles: {},

            isNewVar: false,
            newVarSearch: '',
            currentVarStartPosition: -1,
            currentVarName: '',
            currentVarIndex: -1,
            controlCodes: [40, 38, 13, 27],
            codes: {
                enter: 13,
                backspace: 8,
                esc: 27,
                shift: 16,
                ctrl: 17,
                alt: 18,
                cmd: 91,
                rightCmd: 93,
                left: 37,
                up: 38,
                right: 39,
                down: 40,
            },
            ignoreCodes: [16, 17, 18, 91, 93],
            allArrowCodes: [37, 38, 39, 40],
            allNonWordCodes: [13, 8, 27, 91, 93, 37, 38, 39, 40],
        };
    },
    beforeMount: function(){
        this.currentValue = this.value;
        this.hasVars = this.valueHasVars();
    },
    methods: {
        getInput: function(){
            let input;
            if (this.$el && this.$el.querySelector) {
                input = this.$el.querySelector('.autocomplete-input');
            }
            return input;
        },
        getInputValue: function(){
            let value;
            let input = this.getInput();
            if (input.tagName.toLowerCase == 'textarea'){
                value = input.innerHTML;
            } else {
                value = input.value;
            }
            return value;
        },
        setInputValue: function(value){
            this.currentValue = value;
        },
        getSuggestionItem: function(suggestion) {
            let varName = suggestion;
            let varValue = '';
            if (!_.isUndefined(appState.appData.presentationData.userVars[varName])){
                varValue = appState.appData.presentationData.userVars[suggestion];
            }
            let html = '<div class="variable-suggestion">';
            html += '<span class="variable-name">' + varName + '</span>';
            html += '<span class="variable-value" title="' + _.escape(varValue) + '">' + varValue + '</span>';
            html += '</div>';
            return html;
        },
        itemClick(index) {
            this.activeSuggestionIndex = index;
            this.selectItem();
        },
        handleChange() {
            this.$emit('change');
        },
        doEmit: async function(value, eventName){
            if (!eventName) {
                eventName = this.eventName;
            }
            this.currentValue = value;
            this.hasVars = this.valueHasVars();
            this.$emit(eventName, value);
            if (eventName != 'change') {
                this.$emit('change', value);
            }
            return new Promise((resolve) => {
                setTimeout(() =>{
                    resolve(true);
                }, 0);
            });
        },
        selectItem(index, newPosition = null) {
            let input = this.getInput();
            let value = this.getInputValue();
            let position = input.selectionStart;
            if (position != input.selectionEnd){
                input.selectionEnd = position;
            }
            if (!(index || index === 0)) {
                index = this.activeSuggestionIndex;
            }
            if (index >= this.matchedSuggestions.length || index < 0){
                return;
            }
            let newVar = this.matchedSuggestions[index];
            let newValue;
            let replace = false;
            let preValue = value;
            let postValue = '';
            if (this.currentVarStartPosition > 0) {
                preValue = value.substring(0, this.currentVarStartPosition);
                postValue = value.substring(this.currentVarStartPosition);
            }
            if (this.isNewVar) {
                if (!(postValue && postValue.length)) {
                    replace = true;
                }
            }
            if (!replace) {
                if (this.isNewVar) {
                    newValue = preValue + newVar + '}}' + postValue;
                } else if (this.currentVarName) {
                    newValue = preValue + newVar + value.substring(this.currentVarStartPosition + this.currentVarName.length);
                }
            } else {
                newValue = value + newVar + '}}';
            }
            if (newValue) {
                this.doEmit(newValue);
                this.doEmit(newValue, 'change');
                this.$nextTick(() => {
                    if (newPosition === null) {
                        input.selectionStart = position;
                        input.selectionEnd = position;
                    } else {
                        input.selectionStart = newPosition;
                        input.selectionEnd = newPosition;
                    }
                });
            }
            this.hideSuggestions();
        },
        insertValue(newVar, position, newPosition = null, replace = false) {
            let input = this.getInput();
            let value = this.getInputValue();
            let newValue;
            let preValue = value;
            let postValue = '';
            if (position > 0) {
                preValue = value.substring(0, position);
                postValue = value.substring(position);
            }
            if (!replace) {
                newValue = preValue + newVar + '}}' + postValue;
            } else {
                preValue = preValue.substring(0, preValue.lastIndexOf('{') + 1);
                postValue = postValue.substring(postValue.indexOf('}'));
                newValue = preValue + newVar + postValue;
            }
            if (newValue) {
                this.doEmit(newValue);
                this.$nextTick(() => {
                    if (newPosition === null) {
                        input.selectionStart = position;
                        input.selectionEnd = position;
                    } else {
                        input.selectionStart = newPosition;
                        input.selectionEnd = newPosition;
                    }
                });
            }
        },
        getNewVarSearchHelp(){
            let nvsh = '';
            if (this.newVarSearch && !this.matchedSuggestions.length){
                nvsh = this.translate('press Enter to add new value');
            }
            return nvsh;
        },
        setNewIndex(newIndex) {
            if (newIndex >= this.matchedSuggestions.length) {
                newIndex = 0;
            } else if (newIndex < 0) {
                newIndex =  this.matchedSuggestions.length - 1;
            }
            this.activeSuggestionIndex = newIndex;
            this.scrollList();
        },
        handleKeyup: async function (e) {
            if (this.ignoreCodes.indexOf(e.keyCode) != -1){
                return;
            }
            let input = this.getInput();
            let value = this.getInputValue();
            let position = input.selectionStart;
            let preValue = value.substring(0, position);

            if (e.keyCode == this.codes.esc) {
                return this.hideSuggestions();
            }
            this.isNewVar = (!this.currentVarName && preValue.match(/{{$/) && preValue.match(/{{$/).length);
            if (this.isNewVar){
                this.currentVarStartPosition = position;
                if (!this.showSuggestions) {
                    await this.doEmit(value);
                    this.listSuggestions(e);
                } else if (this.showSuggestions) {
                    if (e.keyCode == 40) {
                        this.setNewIndex(this.activeSuggestionIndex + 1);
                    } else if (e.keyCode == 38) {
                        this.setNewIndex(this.activeSuggestionIndex - 1);
                    } else if (e.keyCode == 13) {
                        if (this.matchedSuggestions.length && this.activeSuggestionIndex >= 0) {
                            this.selectItem(null, position + 2 + this.matchedSuggestions[this.activeSuggestionIndex].length);
                        } else if (this.newVarSearch.length) {
                            this.insertValue(this.newVarSearch, position, position + 2 + this.newVarSearch.length);
                            this.hideSuggestions();
                        }
                    } else if (e.keyCode == 27) {
                        this.hideSuggestions();
                    }
                }
            } else {
                if (this.allNonWordCodes.indexOf(e.keyCode) == -1 || e.keyCode == 8){
                    this.doEmit(value);
                }
                if (!this.currentVarName) {
                    this.hideSuggestions();
                }
            }

        },
        handleKeydown: function(e){
            if (this.ignoreCodes.indexOf(e.keyCode) != -1){
                return;
            }
            this.currentVarIndex = -1;
            this.currentVarName = '';
            this.currentVarStartPosition = -1;
            let input = this.getInput();
            let value = this.getInputValue();
            let position = input.selectionStart;
            if (e.keyCode == this.codes.esc) {
                return this.hideSuggestions();
            }

            if ((e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) && (e.keyCode == this.codes.right || e.keyCode == this.codes.left)){
                return;
            }

            if (e.keyCode == this.codes.right && position < value.length) {
                position++;
            } else if (e.keyCode == this.codes.left && position > 0) {
                position--;
            }
            let varStartPosition = position;
            let preValue = value.substring(0, position);
            let varName = '';
            let varIndex = 0;
            let doPrevent = true;
            if (!this.isNewVar){
                let postValue = value.substring(position);
                let varMatchesPre = [];
                let varMatchesPost = [];
                if (preValue.match(/{{([^}\s]+)?$/)){
                    varMatchesPre = preValue.match(/{{([^}\s]+)?$/);
                    varMatchesPost = postValue.match(/^([^{}\s]+)}}/);
                    if (varMatchesPre && varMatchesPre.length >=2 && varMatchesPre[1]){
                        varName = varMatchesPre[1];
                        varStartPosition -= varMatchesPre[1].length;
                    }
                    if (varMatchesPost && varMatchesPost.length >=2 && varMatchesPost[1]){
                        varName += varMatchesPost[1];
                    }
                } else {
                    doPrevent = false;
                }
                let preValueComplete = preValue;
                if (varMatchesPost && varMatchesPost.length >= 2 && varMatchesPost[1]){
                    preValueComplete+= varMatchesPost[1] + '}}';
                }
                let preValueCompleteChunks = preValueComplete.split(/{{[^}]+}}/);
                if (preValueCompleteChunks && preValueCompleteChunks.length){
                    varIndex = preValueCompleteChunks.length - 1;
                }
            }

            if (!varName){
                this.resetCurrentVar();
            }

            if (varName){
                this.currentVarName = varName;
                this.currentVarIndex = varIndex;
                this.currentVarStartPosition = varStartPosition;

                if ([37, 38, 39, 40, 13].indexOf(e.keyCode) != -1){
                    if ([38, 40, 13].indexOf(e.keyCode) != -1){
                        e.preventDefault();
                    }

                    if (this.allArrowCodes.indexOf(e.keyCode) != -1){
                        if (!this.showSuggestions) {
                            this.listSuggestions(e);
                        }
                    }
                    if (this.showSuggestions) {
                        if (e.keyCode == this.codes.down) {
                            this.setNewIndex(this.activeSuggestionIndex + 1);
                        } else if (e.keyCode == this.codes.up) {
                            this.setNewIndex(this.activeSuggestionIndex - 1);
                        } else if (e.keyCode == 13) {
                            if (this.matchedSuggestions.length && this.activeSuggestionIndex >= 0) {
                                this.selectItem(null, this.currentVarStartPosition + 2 + this.matchedSuggestions[this.activeSuggestionIndex].length);
                            } else if (this.newVarSearch.length) {
                                let newPosition = this.currentVarStartPosition;
                                if (!newPosition) {
                                    newPosition = null;
                                } else {
                                    newPosition += this.newVarSearch.length + 2;
                                }
                                this.insertValue(this.newVarSearch, position, newPosition, true);
                                this.hideSuggestions();
                            }
                        }
                    }
                } else if (e.key.length == 1 && [27, 9].indexOf(e.keyCode) == -1) {
                    this.newVarSearch += e.key;
                    if (this.showSuggestions) {
                        e.preventDefault();
                    }
                    this.listSuggestions(e);
                } else if ([8].indexOf(e.keyCode) != -1) {
                    if (this.newVarSearch.length) {
                        e.preventDefault();
                        this.newVarSearch = this.newVarSearch.substring(0, this.newVarSearch.length - 1);
                        this.listSuggestions(e);
                    }
                }

            } else if (this.isNewVar && e.key.length == 1 && [37, 38, 39, 40, 13, 27, 9].indexOf(e.keyCode) == -1) {
                e.preventDefault();
                this.newVarSearch += e.key;
                this.listSuggestions(e);
            } else if (this.isNewVar && [8].indexOf(e.keyCode) != -1) {
                if (this.newVarSearch.length) {
                    e.preventDefault();
                    this.newVarSearch = this.newVarSearch.substring(0, this.newVarSearch.length - 1);
                    this.listSuggestions(e);
                }
            } else if (doPrevent && [38, 40, 13].indexOf(e.keyCode) != -1){
                e.preventDefault();
            } else if (e.keyCode == 8) {
                if (preValue.match(/}}$/) && input.selectionStart == input.selectionEnd) {
                    e.preventDefault();
                    let selectionLength = _.last(preValue.split('{{')).length + 2;
                    input.selectionStart = position - selectionLength;
                    input.selectionEnd = position;
                }
            }
        },
        scrollList () {
            this.$nextTick(() =>{
                let el = this.$el.querySelector('.active-suggestion');
                if (el && el.scrollIntoViewIfNeeded) {
                    el.scrollIntoViewIfNeeded(true);
                }
            });
        },
        resetCurrentVar () {
            this.currentVarName = '';
            this.currentVarIndex = -1;
            this.currentVarStartPosition = -1;
        },
        hideSuggestions () {
            this.activeSuggestionIndex = -1;
            this.newVarSearch = '';
            if (this.showSuggestions) {
                this.showSuggestions = false;
            }
            if (this.matchedSuggestions.length) {
                this.matchedSuggestions = [];
            }
            this.resetCurrentVar();
            this.isNewVar = false;
        },
        determineListPosition (e) {
            let showTop = false;
            if (this.forcePosition == 'below') {
                showTop = true;
            } else if (this.forcePosition == 'above') {
                showTop = false;
            } else if (e && e.target) {
                let position = _appWrapper.getHelper('html').getAbsolutePosition(e.target);
                if (position && position.offsetTop && position.offsetTop < 400) {
                    showTop = true;
                }
            }
            let styles = {};
            let height = this.$el.querySelector('.autocomplete-input').offsetHeight;
            if (showTop) {
                styles['margin-top'] = (height) + 'px';
            } else {
                styles['margin-bottom'] = (height) + 'px';
            }
            this.listStyles = styles;
            if (this.showSuggestionsTop != showTop){
                this.showSuggestionsTop = showTop;
            }
        },
        listSuggestions(e) {
            this.determineListPosition(e);
            let oldLength = this.matchedSuggestions.length;
            let search = this.newVarSearch;
            this.filterSuggestions(search);
            if (!search || oldLength != this.matchedSuggestions.length) {
                this.activeSuggestionIndex = 0;
            }
            if (this.activeSuggestionIndex >= this.matchedSuggestions.length){
                this.activeSuggestionIndex = this.matchedSuggestions.length - 1;
            }
            if (this.matchedSuggestions.length){
                this.showSuggestions = true;
            }
        },
        filterSuggestions (search = ''){
            if (!search){
                this.matchedSuggestions = _.cloneDeep(this.autocompleteData);
            } else {
                this.matchedSuggestions = [];
                let regex = new RegExp('^' + search, 'i');
                for (let i=0; i<this.autocompleteData.length; i++) {
                    if (this.autocompleteData[i].match(regex)) {
                        this.matchedSuggestions.push(this.autocompleteData[i]);
                    }
                }
            }
            return this.matchedSuggestions;
        },
        handleBlur: function(){
            this.doEmit(this.currentValue, 'change');
            // this.hideSuggestions();
        },
        validateValue () {
            let value = this.getInputValue();
            this.processedValue = this.processUserVars(value);
        },
        hideProcessedValue () {
            this.processedValue = '';
        },
        valueHasVars(){
            let result = false;
            let value = this.currentValue;
            if (value && value.match){
                result = value.match(/{{/) || value.match(/__(eval|random)\(/);
            }
            return result;
        }
    },
    watch: {
        value: function(newVal) {
            this.currentValue = newVal;
        }
    }
};