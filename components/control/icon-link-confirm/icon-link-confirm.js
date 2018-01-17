/**
 * @fileOverview icon-link-confirm component file
 * @author Dino Ivankov <dinoivankov@gmail.com>
 * @version 1.3.1
 */

const _ = require('lodash');

var _appWrapper = window.getAppWrapper();
// var appState = _appWrapper.getAppState();

/**
 * App debug component
 *
 * @name icon-link-confirm
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
    name: 'icon-link-confirm',
    template: '',
    props: [
        'action',
        'iconClasses',
        'confirmClasses',
        'iconConfirmClasses',
        'confirmNotificationText',
        'resetConfirmNotificationText',
        'skipNotification',
        'noAutoCancel',
        'autoCancelDuration',
        'text',
        'confirmText',
        'title',
        'confirmTitle',
        'onClick',
        'onConfirm',
        'onConfirmTimeout',
    ],
    data: function () {
        return {
            confirmed: false,
            noNotification: false,
            confirmTimeout: null,
            confirmInterval: null,
            confirmTimeoutDuration: 6000,
            confirmTimeoutRemaining: 6
        };
    },
    mounted: function() {
        if (this.autoCancelDuration && parseInt(this.autoCancelDuration, 10) >= 1000) {
            this.confirmTimeoutDuration = this.autoCancelDuration;
        }
        this.noNotification = this.skipNotification;
    },
    beforeDestroy: function(){
        this.noNotification = true;
        this.resetConfirm(true);
    },
    methods: {
        getConfirmTitle: function(){
            let confirmTitle;
            if (!this.confirmTitle){
                confirmTitle = _appWrapper.translate('Click again to confirm');
            } else {
                confirmTitle = this.confirmTitle;
            }
            return confirmTitle;
        },
        getIconClasses: function(){
            let classes = ['icon-link-confirm'];
            if (this.noAutoCancel){
                classes.push('no-auto-cancel');
            }
            let iconClasses = [];
            if (this.iconClasses){
                iconClasses = this.iconClasses;
            }
            if (!_.isArray(iconClasses)){
                iconClasses = [iconClasses];
            }
            classes = _.concat(classes, iconClasses);
            return classes.join(' ');
        },
        getCheckboxWrapperClasses() {
            let classes = ['icon-link-confirm-checkbox-wrapper'];
            let confirmClasses = [];
            if (this.confirmClasses){
                confirmClasses = this.confirmClasses;
            }
            if (!_.isArray(confirmClasses)){
                confirmClasses = [confirmClasses];
            }
            if (confirmClasses.length){
                classes = _.concat(classes, confirmClasses);
            }
            return classes;
        },
        getConfirmClasses() {
            let classes = ['icon-link-confirm-checkbox'];
            return classes;
        },
        getCountdownClasses() {
            let classes = ['icon-link-confirm-checkbox-countdown'];
            return classes;
        },
        getIconConfirmClasses() {
            let classes = ['icon-confirm-checkbox'];
            let iconConfirmClasses = [];
            if (this.iconConfirmClasses){
                iconConfirmClasses = this.iconConfirmClasses;
            }
            if (!_.isArray(iconConfirmClasses)){
                iconConfirmClasses = [iconConfirmClasses];
            }
            if (iconConfirmClasses.length){
                classes = _.concat(classes, iconConfirmClasses);
            } else {
                classes.push('fa');
                classes.push('fa-square-o');
            }
            return classes;
        },
        confirm: function(e) {
            if (!this.confirmed) {
                if (this.onClick && _.isFunction(this.onClick)){
                    this.onClick(e);
                }
                this.confirmed = true;
                this.startConfirmCountdown();
                this.$nextTick( () => {
                    let checkboxEl = this.$el.querySelector('.icon-link-confirm-checkbox');
                    if (checkboxEl && checkboxEl.triggerCustomEvent && _.isFunction(checkboxEl.triggerCustomEvent)){
                        checkboxEl.triggerCustomEvent('mouseover');
                    }
                });
                this.confirmNotification();
            } else {
                if (this.action && _.isFunction(this.action)){
                    if (this.onConfirm && _.isFunction(this.onConfirm)){
                        this.onConfirm(e);
                    }
                    this.stopConfirmCountdown();
                    this.confirmed = false;
                    this.action(e);
                }
            }
        },
        startConfirmCountdown: function(){
            this.stopConfirmCountdown();
            if (!this.noAutoCancel){
                this.confirmTimeoutRemaining = Math.floor(this.confirmTimeoutDuration / 1000);
                this.confirmTimeout = setTimeout(this.resetConfirm, this.confirmTimeoutDuration);
                this.confirmInterval = setInterval(this.updateConfirmCountdown, 1000);
            }

        },
        stopConfirmCountdown: function(noHandler = true){
            clearTimeout(this.confirmTimeout);
            clearInterval(this.confirmInterval);
            if (!noHandler && this.onConfirmTimeout && _.isFunction(this.onConfirmTimeout)){
                this.onConfirmTimeout();
            }
        },
        updateConfirmCountdown: function(){
            if (this.confirmTimeoutRemaining > 0){
                this.confirmTimeoutRemaining--;
            }
        },
        confirmNotification: function() {
            if (!this.noNotification){
                let notificationText;
                if (this.confirmNotificationText){
                    notificationText = this.confirmNotificationText;
                } else {
                    notificationText = _appWrapper.translate('Click again to confirm');
                }
                _appWrapper.addNotification(notificationText, 'info', [], true, {immediate: true, duration: 1000});
            }
        },
        resetConfirmNotification: function() {
            if (!this.noNotification){
                let notificationText;
                if (this.confirmNotificationText){
                    notificationText = this.resetConfirmNotificationText;
                } else {
                    notificationText = _appWrapper.translate('Confirmation cancelled');
                }
                _appWrapper.addNotification(notificationText, 'warning', [], true, {immediate: true, duration: 1000});
            }
        },
        resetConfirm: function(noHandler = false){
            this.stopConfirmCountdown(noHandler);
            if (!window.noconfirm){
                this.confirmed = false;
            }
            this.resetConfirmNotification();
        },
        checkboxHover: function(e) {
            this.stopConfirmCountdown();
            if (e.target && e.target.hasClass){
                let el = e.target;
                if (!el.hasClass('icon-link-confirm-checkbox')){
                    while (!el.hasClass('icon-link-confirm-checkbox') && el.parentNode) {
                        el = el.parentNode;
                    }
                }
                if (el.hasClass('icon-link-confirm-checkbox')){
                    let iconEl = el.querySelector('.icon-confirm-checkbox');
                    if (iconEl && iconEl.hasClass && !iconEl.hasClass('fa-check-square-o')){
                        iconEl.addClass('fa-check-square-o');
                        iconEl.removeClass('fa-square-o');
                    }
                }
            }
        },
        checkboxBlur: function(e) {
            this.startConfirmCountdown();
            if (e.target && e.target.hasClass){
                let el = e.target;
                if (!el.hasClass('icon-link-confirm-checkbox')){
                    while (!el.hasClass('icon-link-confirm-checkbox') && el.parentNode) {
                        el = el.parentNode;
                    }
                }
                if (el.hasClass('icon-link-confirm-checkbox')){
                    let iconEl = el.querySelector('.icon-confirm-checkbox');
                    if (iconEl && iconEl.hasClass && iconEl.hasClass('fa-check-square-o')){
                        iconEl.removeClass('fa-check-square-o');
                        iconEl.addClass('fa-square-o');
                    }
                }
            }
        }
    },
    computed: {}
};