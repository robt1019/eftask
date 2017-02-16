'use strict';

angular.module('simplefacebook.account')
    .directive('simplefacebookLogin', [
        function() {
            return {
                restrict: 'E',
                scope: {
                    loggedIn: '=',
                    username: '='
                },
                templateUrl: 'components/account/login/loginView.html',
                bindToController: true,
                controller: 'LoginCtrl',
                controllerAs: '$ctrl'
            };
        }

    ]);
