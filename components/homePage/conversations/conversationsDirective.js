'use strict';

angular.module('simplefacebook')
    .directive('simplefacebookConversations', [function() {
        return {
            restrict: 'E',
            scope: {
                users: '=',
                conversations: '='
            },
            bindToController: true,
            templateUrl: 'components/homePage/conversations/conversationsView.html',
            controller: 'ConversationsCtrl',
            controllerAs: '$ctrl'
        };
    }]);
