'use strict';

angular.module('simplefacebook.account')
    .controller('LoginCtrl', [
        'AccountService',
        function(AccountService) {

            var ctrl = this;

            ctrl.register = function(user) {
                AccountService.registerUser(user).then(
                    function() {
                        ctrl.registerError = null;
                        ctrl.username = AccountService.getUsername();
                        ctrl.loggedIn = AccountService.loggedIn();
                    },
                    function(error) {
                        ctrl.loggedIn = false;
                        if (error === 'conflict') {
                            ctrl.registerError = 'username ' + user.username + ' already registered. Please login';
                        } else {
                            ctrl.registerError = 'something went wrong. Please try again in a bit';
                        }
                    });
            };

            ctrl.login = function(user) {
                AccountService.loginUser(user).then(
                    function() {
                        ctrl.loginError = null;
                        ctrl.username = AccountService.getUsername();
                        ctrl.loggedIn = AccountService.loggedIn();
                    },
                    function(error) {
                        ctrl.loggedIn = AccountService.loggedIn();
                        if (error === 'unauthorized') {
                            ctrl.loginError = 'Login details are incorrect';
                        } else {
                            ctrl.loginError = 'Something went wrong. Please try again in a bit.';
                        }
                    });
            };

            function initialise() {
                ctrl.user = {};
                ctrl.action = 'login';
                ctrl.username = AccountService.getUsername();
                ctrl.loggedIn = AccountService.loggedIn();
            }
            initialise();
        }
    ]);
