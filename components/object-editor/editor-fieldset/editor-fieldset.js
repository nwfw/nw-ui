// var _appWrapper = window.getAppWrapper();

exports.component = {
    name: 'editor-fieldset',
    template: '',
    props: {
        title: {
            type: String,
            requied: true
        },
        showTitle: {
            type: Boolean,
            default: true,
        },
        preventMinimize: {
            type: Boolean,
            default: false,
        },
        initialMinimized: {
            type: Boolean,
            default: false
        },
        onToggle: {
            type: Function
        },
        renderFieldset: {
            type: Boolean,
            default: true
        },
        fieldsetClass: {
            type: String,
            default: ''
        },
        afterMaximize: {
            type: Function
        },
        afterMinimize: {
            type: Function
        },
    },
    created: function(){
        this.minimized = this.initialMinimized;
        if (this.preventMinimize) {
            this.minimized = false;
        }
    },
    methods: {
        toggleMinimized: function(){
            this.minimized = !this.minimized;
            if (this.onToggle && this.onToggle.call){
                this.onToggle(this.minimized);
            }
        },
        setMinimized: function(value){
            let minimized = this.minimized;
            this.minimized = value;
            if (minimized != value && this.onToggle && this.onToggle.call){
                this.onToggle(this.minimized);
            }
        },
        afterEnter (el) {
            if (this.afterMaximize && this.afterMaximize.call){
                this.afterMaximize(el);
            }
        },
        afterLeave (el) {
            if (this.afterMinimize && this.afterMinimize.call){
                this.afterMinimize(el);
            }
        }
    },
    data: function () {
        return {
            minimized: false
        };
    },
};