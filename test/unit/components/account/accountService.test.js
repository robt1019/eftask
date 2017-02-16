'use strict';

describe('AccountService', function() {

    var AccountService, $q, $rootScope, mockSessionStorage,
        $httpBackend;

    mockSessionStorage = {
        $reset: function() {}
    };

    beforeEach(module('simplefacebook.account', 'ngStorage'));

    beforeEach(inject(function(_AccountService_, _$q_, _$rootScope_,
        _$httpBackend_) {
        AccountService = _AccountService_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
    }));

    var successfulRegistration = function() {
        $httpBackend.whenPOST('http://localhost:8080/register').respond(200,{
            token: 12345
        });
        AccountService.registerUser({ username: 'testUser', password: 'testPassword' });
        $httpBackend.expectPOST('http://localhost:8080/register');
        $httpBackend.flush();
    };

    var successfulLogin = function() {
        $httpBackend.whenPOST('http://localhost:8080/login').respond(200,{
            token: 12345
        });
        AccountService.loginUser({ username: 'testUser', password: 'testPassword' });
        $httpBackend.expectPOST('http://localhost:8080/login');
        $httpBackend.flush();
    };

    var unauthorizedLogout = function() {
        $httpBackend.whenPOST('http://localhost:8080/logout').respond(401);
        AccountService.logoutUser({ username: 'testUser', password: 'testPassword' });
        $httpBackend.expectPOST('http://localhost:8080/logout');
        $httpBackend.flush();
    };

    var successfulLogout = function() {
        $httpBackend.whenPOST('http://localhost:8080/logout').respond(200);
        AccountService.logoutUser();
        $httpBackend.expectPOST('http://localhost:8080/logout');
        $httpBackend.flush();
    };

    describe('registerUser', function() {
        it('should set token and username correctly if $http call resolves correctly', function() {
            successfulRegistration();
            expect(AccountService.getToken()).toEqual(12345);
            expect(AccountService.getUsername()).toEqual('testUser');
            AccountService.logoutUser();
        });
        it('should resolve returned promise correctly if $http call resolves correctly', function() {
            $httpBackend.whenPOST('http://localhost:8080/register').respond(200,{
                token: 12345
            });
            var _response, _error;
            AccountService.registerUser({ username: 'testUser', password: 'testPassword' }).
            then(function(response) {
                _response = response;
            }, function(error) {
                _error = error;
            });
            $httpBackend.expectPOST('http://localhost:8080/register');
            $httpBackend.flush();
            $rootScope.$apply();
            expect(_error).toBe(undefined);
            expect(_response).not.toBe(undefined);
            successfulLogout();
        });
        it('should reject returned promise correctly if $http call status other than 200', function() {
            $httpBackend.whenPOST('http://localhost:8080/register').respond(400);
            var _response, _error;
            AccountService.registerUser().
            then(function(response) {
                _response = response;
            }, function(error) {
                _error = error;
            });
            $httpBackend.expectPOST('http://localhost:8080/register');
            $httpBackend.flush();
            $rootScope.$apply();
            expect(_error).not.toBe(undefined);
            expect(_response).toBe(undefined);
            successfulLogout();
        });
        it('should reject returned promise correctly if $http call status of 409', function() {
            $httpBackend.whenPOST('http://localhost:8080/register').respond(409);
            var _response, _error;
            AccountService.registerUser().
            then(function(response) {
                _response = response;
            }, function(error) {
                _error = error;
            });
            $httpBackend.expectPOST('http://localhost:8080/register');
            $httpBackend.flush();
            $rootScope.$apply();
            expect(_error).toEqual('conflict');
            expect(_response).toBe(undefined);
            successfulLogout();
        });
    });

    describe('loginUser', function() {
        it('should set token and username correctly if $http call resolves correctly', function() {
            successfulLogin();
            expect(AccountService.getToken()).toEqual(12345);
            expect(AccountService.getUsername()).toEqual('testUser');
            AccountService.logoutUser();
        });
        it('should resolve returned promise correctly if $http call resolves correctly', function() {
            $httpBackend.whenPOST('http://localhost:8080/login').respond(200,{
                token: 12345
            });
            var _response, _error;
            AccountService.loginUser({ username: 'testUser', password: 'testPassword' }).
            then(function(response) {
                _response = response;
            }, function(error) {
                _error = error;
            });
            $httpBackend.expectPOST('http://localhost:8080/login');
            $httpBackend.flush();
            $rootScope.$apply();
            expect(_error).toBe(undefined);
            expect(_response).not.toBe(undefined);
            successfulLogout();
        });
        it('should reject returned promise correctly if $http call status other than 200', function() {
            $httpBackend.whenPOST('http://localhost:8080/login').respond(400);
            var _response, _error;
            AccountService.loginUser().
            then(function(response) {
                _response = response;
            }, function(error) {
                _error = error;
            });
            $httpBackend.expectPOST('http://localhost:8080/login');
            $httpBackend.flush();
            $rootScope.$apply();
            expect(_error).not.toBe(undefined);
            expect(_response).toBe(undefined);
            successfulLogout();
        });
        it('should reject returned promise correctly if $http call status of 401', function() {
            $httpBackend.whenPOST('http://localhost:8080/login').respond(401);
            var _response, _error;
            AccountService.loginUser().
            then(function(response) {
                _response = response;
            }, function(error) {
                _error = error;
            });
            $httpBackend.expectPOST('http://localhost:8080/login');
            $httpBackend.flush();
            $rootScope.$apply();
            expect(_error).toEqual('unauthorized');
            expect(_response).toBe(undefined);
            successfulLogout();
        });
    });

    describe('logoutUser', function() {
        it('should reset session storage variables correctly if 200 status', function() {
            successfulLogin();
            expect(AccountService.getToken()).toBe(12345);
            expect(AccountService.getUsername()).toBe('testUser');
            expect(AccountService.loggedIn()).toBe(true);
            successfulLogout();
            expect(AccountService.getToken()).toBe(null);
            expect(AccountService.getUsername()).toBe(null);
            expect(AccountService.loggedIn()).toBe(false);
        });
        it('should reset session storage variables correctly if 401 status', function() {
            successfulLogin();
            expect(AccountService.getToken()).toBe(12345);
            expect(AccountService.getUsername()).toBe('testUser');
            expect(AccountService.loggedIn()).toBe(true);
            unauthorizedLogout();
            expect(AccountService.getToken()).toBe(null);
            expect(AccountService.getUsername()).toBe(null);
            expect(AccountService.loggedIn()).toBe(false);
        });
        it('should resolve returned promise correctly if $http call resolves with 200', function() {
            $httpBackend.whenPOST('http://localhost:8080/logout').respond(200);
            var _response, _error;
            AccountService.logoutUser().
            then(function(response) {
                _response = response;
            }, function(error) {
                _error = error;
            });
            $httpBackend.expectPOST('http://localhost:8080/logout');
            $httpBackend.flush();
            $rootScope.$apply();
            expect(_error).toBe(undefined);
            expect(_response).not.toBe(undefined);
            successfulLogout();
        });
        it('should resolve returned promise correctly if $http call resolves with 401', function() {
            $httpBackend.whenPOST('http://localhost:8080/logout').respond(401);
            var _response, _error;
            AccountService.logoutUser().
            then(function(response) {
                _response = response;
            }, function(error) {
                _error = error;
            });
            $httpBackend.expectPOST('http://localhost:8080/logout');
            $httpBackend.flush();
            $rootScope.$apply();
            expect(_error).toBe(undefined);
            expect(_response).toEqual('unauthorized');
            successfulLogout();
        });
        it('should reject returned promise correctly if $http call resolves with code other than 200 or 401', function() {
            $httpBackend.whenPOST('http://localhost:8080/logout').respond(400);
            var _response, _error;
            AccountService.logoutUser().
            then(function(response) {
                _response = response;
            }, function(error) {
                _error = error;
            });
            $httpBackend.expectPOST('http://localhost:8080/logout');
            $httpBackend.flush();
            $rootScope.$apply();
            expect(_error).not.toBe(undefined);
            expect(_response).toBe(undefined);
            successfulLogout();
        });
    });

});
