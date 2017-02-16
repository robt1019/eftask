'use strict';

angular.module('simplefacebook.account').service('AccountService', [
    '$q', '$http', '$rootScope', '$sessionStorage',
    function($q, $http, $rootScope, $sessionStorage) {

        function initialise() {
            if (!$sessionStorage.user) {
                $sessionStorage.user = {};
            }
        }

        initialise();

        this.loggedIn = function() {
            if($sessionStorage.user !== undefined &&
                $sessionStorage.user.token) {
                return true;
            }
            return false;
        };

        this.getUsername = function() {
            if ($sessionStorage.user) {
                return $sessionStorage.user.username;
            }
            return null;
        };

        this.getToken = function() {
            if ($sessionStorage.user !== undefined) {
                return $sessionStorage.user.token;
            }
            return null;
        };

        this.logoutUser = function() {
            var deferred = $q.defer();
            $http({
                headers: { 'x-auth-token': this.getToken() },
                method: 'POST',
                url: 'http://localhost:8080/logout'
            }).then(function(response) {
                $sessionStorage.$reset();
                deferred.resolve(response);
            }, function(error) {
                if (error.status === 401) {
                    // assume that this means user is already logged out and delete sessionstorage
                    $sessionStorage.$reset();
                    deferred.resolve('unauthorized');
                }
                deferred.reject(error);
            });
            return deferred.promise;
        };

        this.registerUser = function(user) {
            var deferred = $q.defer();
            if (!$sessionStorage.user) {
                initialise();
            }
            $http({
                method: 'POST',
                url: 'http://localhost:8080/register',
                data: user
            }).then(function(response) {
                $sessionStorage.user.token = response.data.token;
                $sessionStorage.user.username = user.username;
                deferred.resolve(response);
            }, function(error) {
                if (error.status === 409) {
                    deferred.reject('conflict');
                } else {
                    deferred.reject(error);
                }
            });
            return deferred.promise;
        };

        this.loginUser = function(user) {
            var deferred = $q.defer();
            if (!$sessionStorage.user) {
                initialise();
            }
            $http({
                method: 'POST',
                url: 'http://localhost:8080/login',
                data: user
            }).then(function(response) {
                $sessionStorage.user.token = response.data.token;
                $sessionStorage.user.username = user.username;
                deferred.resolve(response);
            }, function(error) {
                if (error.status === 401) {
                    deferred.reject('unauthorized');
                } else {
                    deferred.reject(error);
                }
            });
            return deferred.promise;
        };
    }
]);
