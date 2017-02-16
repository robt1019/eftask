'use strict';

angular.module('simplefacebook')
    .controller('ConversationsCtrl', [
        'ChatService', 'AccountService',
        function(ChatService, AccountService) {
            var ctrl = this;

            function getUsers() {
                if (AccountService.loggedIn()) {
                    ChatService.getUsers().then(function(data) {
                        ctrl.users = data;
                        if (!ctrl.users) {
                            ctrl.users = {};
                        }
                    }, function() {
                        ctrl.getUsersError = 'problem getting users :( Please wait a while then try again';
                        // if this call fails the site is more or less useless so logout
                        AccountService.logoutUser();
                    });
                }
            }

            function getConversations() {
                ChatService.getConversations().then(function(response) {
                    ctrl.conversations = response;
                    if (!ctrl.conversations) {
                        ctrl.conversations = {};
                    }
                    angular.forEach(ctrl.conversations, function(conversation) {
                        conversation.show = false;
                    });
                }, function() {
                    ctrl.getConversationsError = 'There was a problem getting your conversations. Please try again later';
                });
            }

            function updateConversation(conversationId, message, username) {
                ChatService.updateConversation(conversationId, message, username).then(function(response) {
                    ctrl.conversations = response;
                });
            }

            function userOnline(message) {
                if (ctrl.users[message.data.username]) {
                    ctrl.users[message.data.username].online = true;
                } else {
                    ctrl.users[message.data.username] = {
                        username: message.data.username,
                        online: true
                    };
                }
            }

            function userOffline(message) {
                if (ctrl.users[message.data.username]) {
                    ctrl.users[message.data.username].online = false;
                } else {
                    ctrl.users[message.data.username] = {
                        username: message.data.username,
                        online: false
                    };
                }
            }

            function messageSeen(message) {
                var username = AccountService.getUsername();
                var messageToInspect =
                    ctrl.conversations[message.data.cid].messageObjects[message.data.mid];
                if (messageToInspect &&
                    messageToInspect.to !== username) {
                    messageToInspect.seenByRecipient = true;
                } else {
                    messageToInspect.seenByRecipient = false;
                }
            }

            function setupWebSocketWatchers() {
                ChatService.register('user-online', userOnline);
                ChatService.register('user-offline', userOffline);
                ChatService.register('user-new', function() {
                    getUsers();
                });
                ChatService.register('message', function(message) {
                    updateConversation(message.data.cid, message);
                    ctrl.users[message.data.from].online = true;
                });
                ChatService.register('message-seen', function(message) {
                    messageSeen(message);
                });
                ChatService.register('message-like', function(message) {
                    var messageToInspect =
                        ctrl.conversations[message.data.cid].messageObjects[message.data.mid];
                    if (messageToInspect && messageToInspect.likedBy.indexOf(message.data.by) === -1) {
                        messageToInspect.likedBy.push(message.data.by);
                    }
                });
                ChatService.register('message-unlike', function(message) {
                    var messageToInspect =
                        ctrl.conversations[message.data.cid].messageObjects[message.data.mid];
                    if (messageToInspect && messageToInspect.likedBy.indexOf(message.data.by) !== -1) {
                        messageToInspect.likedBy.splice(messageToInspect.likedBy.indexOf(message.data.by), 1);
                    }
                });
            }

            ctrl.startChat = function(username) {
                if (ctrl.users[username].unseenMessage) {
                    ctrl.users[username].unseenMessage = false;
                }
                var chatFound = false;
                angular.forEach(ctrl.conversations, function(conversation) {
                    if (conversation.peers && conversation.peers.indexOf(username) !== -1) {
                        chatFound = true;
                        conversation.show = true;
                        angular.forEach(conversation.messages, function(message) {
                            if (message.from === username) {
                                if (!message.seen) {
                                    ChatService.messageSeen(message.id, conversation.id);
                                }
                            }
                        });
                        conversation.recipientUsername = username;
                    }
                });
                if (!chatFound) {
                    ctrl.conversations['new'] = {
                        show: true,
                        recipientUsername: username
                    };
                }
            };

            ctrl.sendMessage = function(conversation) {
                ChatService.sendMessage(conversation).then(
                    function() {
                        updateConversation(conversation.id);
                    },
                    function() {
                        ctrl.sendMessageError = 'Could\'nt send your message. Please try again later';
                    });
            };

            ctrl.likeMessage = function(messageId, conversationId) {
                ChatService.likeMessage(messageId, conversationId).then(
                    function() {},
                    function() {
                        ctrl.likeError = 'There was a problem liking this message. Please try again later';
                    });
            };

            ctrl.unlikeMessage = function(messageId, conversationId) {
                ChatService.unlikeMessage(messageId, conversationId).then(
                    function() {},
                    function() {
                        ctrl.likeError = 'There was a problem unliking this message. Please try again later';
                    });
            };

            function initialise() {
                ctrl.username = AccountService.getUsername();
                getUsers();
                getConversations();
                setupWebSocketWatchers();
            }
            initialise();
        }
    ]);
