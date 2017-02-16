'use strict';

angular.module('simplefacebook.chat').service('ChatService', [
    '$q', '$http', '$rootScope', '$sessionStorage', 'AccountService',
    function($q, $http, $rootScope, $sessionStorage, AccountService) {

        var token, webSocket, listeners = [],
            username;

        function connectToWebService() {
            token = AccountService.getToken();
            webSocket = new WebSocket('ws://localhost:8080?token=' + token);
            webSocket.onmessage = function(message) {
                var data = JSON.parse(message.data);
                $rootScope.$broadcast(data.topic, data);
            };
        }

        function connect() {
            if (AccountService.loggedIn()) {
                if (!(webSocket && token)) {
                    connectToWebService();
                }
            }
        }

        this.closeConnection = function() {
            if (webSocket) {
                webSocket.close();
                angular.forEach(listeners, function(listener) {
                    $rootScope.$$listeners[listener] = null;
                });
                listeners = [];
                token = null;
                webSocket = null;
            }
        };

        // register listener to be updated on websocket event
        this.register = function(event, action) {
            connect();
            listeners.push(event);
            $rootScope.$on(event, function(event, data) {
                action(data);
                $rootScope.$apply();
            });
        };

        function messageSeen(messageId, conversationId) {
            var deferred = $q.defer();
            $http({
                headers: { 'x-auth-token': AccountService.getToken() },
                method: 'POST',
                url: 'http://localhost:8080/see',
                data: {
                    mid: messageId,
                    cid: conversationId
                }
            }).then(function(response) {
                deferred.resolve(response.data);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

        this.messageSeen = function(messageId, conversationId) {
            var deferred = $q.defer();
            messageSeen(messageId, conversationId).then(function() {
                deferred.resolve();
            }, function() {
                deferred.reject();
            });
            return deferred.promise;
        };

        function setRecipient(conversation) {
            for (var i = 0; i < conversation.peers.length; i++) {
                username = AccountService.getUsername();
                if (conversation.peers[i] !== username) {
                    conversation.recipientUsername = conversation.peers[i];
                }
            }
        }

        this.sendMessage = function(conversation) {
            var deferred = $q.defer();
            $http({
                headers: { 'x-auth-token': AccountService.getToken() },
                method: 'POST',
                url: 'http://localhost:8080/message',
                data: {
                    to: conversation.recipientUsername,
                    content: conversation.newMessage
                }
            }).then(function(response) {
                deferred.resolve(response.data);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        this.likeMessage = function(messageId, conversationId) {
            var deferred = $q.defer();
            $http({
                headers: { 'x-auth-token': AccountService.getToken() },
                method: 'POST',
                url: 'http://localhost:8080/like',
                data: {
                    mid: messageId,
                    cid: conversationId
                }
            }).then(function(response) {
                deferred.resolve(response.data);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        this.unlikeMessage = function(messageId, conversationId) {
            var deferred = $q.defer();
            $http({
                headers: { 'x-auth-token': AccountService.getToken() },
                method: 'POST',
                url: 'http://localhost:8080/unlike',
                data: {
                    mid: messageId,
                    cid: conversationId
                }
            }).then(function(response) {
                deferred.resolve(response.data);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        function getConversations() {
            var deferred = $q.defer();
            $http({
                headers: { 'x-auth-token': AccountService.getToken() },
                method: 'GET',
                url: 'http://localhost:8080/conversations'
            }).then(function(response) {
                deferred.resolve(response);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

        // make a more useful conversations object for use in view
        function setupConversationsObject(conversationArray) {
            var conversations = {};
            angular.forEach(conversationArray, function(conversation) {
                setRecipient(conversation);
                conversations[conversation.id] = {
                    show: conversation.recipientUsername !== AccountService.getUsername() ? true: false,
                    id: conversation.id,
                    messages: conversation.messages,
                    messageObjects: (function() {
                        var messages = {};
                        angular.forEach(conversation.messages, function(message) {
                            messages[message.id] = {
                                id: message.id,
                                from: message.from,
                                to: message.to,
                                likedBy: message.likedBy,
                                content: message.content
                            };
                        });
                        return messages;
                    }()),
                    peers: conversation.peers
                };
            });
            return conversations;
        }

        // copy over relevant parts of existing conversations data structure so
        // state is not lost
        function persistConversations(oldConversations, newConversations) {
            angular.forEach(newConversations, function(newConversation) {
                var oldConversationToInspect = oldConversations[newConversation.id],
                    newConversationToInspect = newConversations[newConversation.id];
                if (oldConversationToInspect) {
                    newConversationToInspect.unseenMessage = oldConversationToInspect.unseenMessage;
                    newConversationToInspect.show = oldConversationToInspect.show;
                    newConversationToInspect.recipientUsername = oldConversationToInspect.recipientUsername;
                }
                var messageCount = 0;
                angular.forEach(newConversation.messageObjects, function(message) {
                    messageCount ++;
                    if (oldConversationToInspect) {
                        var oldMessageToInspect = oldConversationToInspect.messageObjects[message.id],
                            newMessageToInspect = newConversationToInspect.messageObjects[message.id];
                        if (newMessageToInspect && oldMessageToInspect) {
                            if (newMessageToInspect.from !== AccountService.getUsername()) {
                                newMessageToInspect.seenByRecipient = oldMessageToInspect.seenByRecipient;
                            } else {
                                newMessageToInspect.seenByRecipient = false;
                            }
                            newMessageToInspect.likedBy = oldMessageToInspect.likedBy;
                        }
                    }
                });
            });
            $sessionStorage.conversations = angular.copy(newConversations);
        }

        this.getConversations = function() {
            var deferred = $q.defer();
            getConversations().then(function(response) {
                if (!$sessionStorage.conversations) {
                    $sessionStorage.conversations =
                        setupConversationsObject(response.data.conversations);
                } else {
                    persistConversations($sessionStorage.conversations,
                        setupConversationsObject(response.data.conversations));
                }
                deferred.resolve($sessionStorage.conversations);
            }, function() {
                deferred.reject();
            });
            return deferred.promise;
        };

        function getUnseenMessageSender(messages, currentMessage, conversation) {
            var username = AccountService.getUsername();
            for (var i = messages.length - 1; i >= 0; i--) {
                if (!messages[i].seen) {
                    if (username !== messages[i].from) {
                        if (!conversation.show) {
                            return messages[i].from;
                        } else {
                            messages[i].seen = true;
                            // don't do anything based on success/failure here
                            // as it's probably not catastrophic if message seen 
                            // functionality doesn't work?
                            messageSeen(messages[i].id, conversation.id);
                        }
                    }
                }
            }
        }

        this.updateConversation = function(conversationId, message) {
            var deferred = $q.defer();
            this.getConversations().then(function(conversations) {
                angular.forEach(conversations, function(conversation) {
                    if (conversation.id === conversationId) {
                        if (message) {
                            var unseenMessageSender =
                                getUnseenMessageSender(conversation.messages,
                                    message.data, conversation);
                            if (unseenMessageSender) {
                                $sessionStorage.users[unseenMessageSender].unseenMessage = true;
                            }
                        }
                    }
                    deferred.resolve($sessionStorage.conversations);
                });
            }, function() {
                deferred.reject();
            });
            return deferred.promise;
        };

        function persistUserStatuses(oldUsers, newUsers) {
            angular.forEach(newUsers, function(newUser) {
                if (oldUsers[newUser.username]) {
                    newUsers[newUser.username].unseenMessage = angular.copy(oldUsers[newUser.username].unseenMessage);
                    newUsers[newUser.username].online = angular.copy(oldUsers[newUser.username].online);
                }
                $sessionStorage.users = angular.copy(newUsers);
            });
        }

        this.getUsers = function() {
            var deferred = $q.defer();
            $http({
                headers: { 'x-auth-token': AccountService.getToken() },
                method: 'GET',
                url: 'http://localhost:8080/users'
            }).then(function(response) {
                var newUsers = {};
                angular.forEach(response.data.users, function(_username) {
                    newUsers[_username] = {
                        username: _username,
                        online: false
                    };
                    if (username === _username) {
                        newUsers[username].online = true;
                    }
                });
                if (!$sessionStorage.users) {
                    $sessionStorage.users = newUsers;
                } else {
                    persistUserStatuses($sessionStorage.users, newUsers);
                }
                deferred.resolve($sessionStorage.users);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };


        function initialise() {
            if (AccountService.loggedIn()) {
                username = AccountService.getUsername();
                token = AccountService.getToken();
                if (!(webSocket && token)) {
                    connectToWebService();
                }
            }
        }
        initialise();

    }
]);
