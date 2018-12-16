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
        // method called on confirm
        'action',
        // classes added to icon link
        'iconClasses',
        // classes added to confirm wrapper
        'confirmClasses',
        // classes added to confirm checkbox icon
        'iconConfirmClasses',
        // Notification text when first click occurs
        'confirmNotificationText',
        // Notification type when first click occurs
        'confirmNotificationType',
        // Notification text when counter times out
        'resetConfirmNotificationText',
        // Notification type when counter times out
        'resetConfirmNotificationType',
        // Flag to skip notifications entirely
        'skipNotification',
        // Flag to prevent auto cancel countdown
        'noCancelCountdown',
        // Flag to prevent auto cancel timeout
        'noAutoCancel',
        // Duration in ms for auto cancel countdown (min 1000)
        'autoCancelDuration',
        // Text to display in the link
        'text',
        // Text to display for confirm link/icon
        'confirmText',
        // Flag to force confirm tooltip rendering below checkbox
        'confirmTooltipPosition',
        // Text for confirm checkbox tooltip
        'confirmTooltip',
        // Title html attribute for link
        'title',
        // Title html attribute for confirm checkbox
        'confirmTitle',
        // Function triggered when link is clicked (before confirming)
        'onClick',
        // Function triggered when confirm checkbox is clicked (after confirming)
        'onConfirm',
        // Function triggered when auto cancel timeout expires
        'onConfirmTimeout',
    ],
    data: function () {
        return {
            confirmed: false,
            noNotification: false,
            confirmTimeout: null,
            confirmInterval: null,
            doCancelCountdown: true,
            confirmTimeoutDuration: 6000,
            confirmTimeoutRemaining: 6
        };
    },
    mounted: function() {
        if (this.autoCancelDuration && parseInt(this.autoCancelDuration, 10) >= 1000) {
            this.confirmTimeoutDuration = this.autoCancelDuration;
        }
        this.noNotification = this.skipNotification;
        if (this.noCancelCountdown) {
            this.doCancelCountdown = false;
        }
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
        getConfirmTooltipData: function(){
            return JSON.stringify({
                classes: ['tooltip-warning'],
                immediate: true,
                showCloseLink: true
            });
        },
        getConfirmTooltipPosition () {
            if (this.confirmTooltipPosition) {
                return this.confirmTooltipPosition;
            } else {
                return 'left';
            }
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
            }
            classes.push('fa');
            classes.push('fa-square-o');
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
                if (!_.isUndefined(this.confirmNotificationText)){
                    notificationText = this.confirmNotificationText;
                } else {
                    notificationText = _appWrapper.translate('Click again to confirm');
                }
                let notificationType;
                if (this.confirmNotificationType){
                    notificationType = this.confirmNotificationType;
                } else {
                    notificationType = 'info';
                }
                if (notificationText) {
                    _appWrapper.addNotification(notificationText, notificationType, [], true, {immediate: true, duration: 1000});
                }
            }
        },
        resetConfirmNotification: function() {
            if (!this.noNotification){
                let notificationText;
                if (!_.isUndefined(this.resetConfirmNotificationText)){
                    notificationText = this.resetConfirmNotificationText;
                } else {
                    notificationText = _appWrapper.translate('Confirmation cancelled');
                }
                let notificationType;
                if (this.resetConfirmNotificationType){
                    notificationType = this.resetConfirmNotificationType;
                } else {
                    notificationType = 'info';
                }
                if (notificationText) {
                    _appWrapper.addNotification(notificationText, notificationType, [], true, {immediate: true, duration: 1000});
                }
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
            if (!this.doCancelCountdown) {
                this.resetConfirm();
            } else {
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
        }
    },
    computed: {}
};