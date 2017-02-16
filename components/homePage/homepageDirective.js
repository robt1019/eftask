'use strict';

angular.module('simplefacebook')
    .directive('simplefacebookHomePage', [function() {
        return {
            restrict: 'E',
            scope: {},
            bindToController: true,
            templateUrl: 'components/homePage/homePageView.html',
            controller: 'HomePageCtrl',
            controllerAs: '$ctrl'
        };
    }]);
