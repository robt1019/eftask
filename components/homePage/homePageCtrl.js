'use strict';

angular.module('simplefacebook')
    .controller('HomePageCtrl', [
        'AccountService', 'ChatService',
        function(AccountService, ChatService) {
            
            var ctrl = this;

            ctrl.logout = function() {
                ChatService.closeConnection();
                if (AccountService.loggedIn()) {
                    AccountService.logoutUser().then(function() {
                        ctrl.loggedIn = false;
                    }, function() {
                        window.alert('problem logging out');
                    });
                } else {
                    ctrl.loggedIn = false;
                }
            };

            function initialise() {
                ctrl.loggedIn = AccountService.loggedIn();
                ctrl.username = AccountService.getUsername();
                ctrl.users = {};
            }
            initialise();
        }
    ]);
