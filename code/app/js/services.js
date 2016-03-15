'use strict';

/* Services */
var services = angular.module('Services', ['ngResource']);

// Player
services.factory('Player', ['$resource', function($resource) {
    return $resource('phone/:phoneId.json', {}, {
	query: {method: 'GET', params: {phoneId: 'phones'}, isArray: true}
    })
}]);

// Inventory
services.factory('Inventory', ['$resource', function($resource) {
    return $resource('phone/:phoneId.json', {}, {
	query: {method: 'GET', params: {phoneId: 'phones'}, isArray: true}
    })
}]);

// Auction
services.factory('Auction', ['$resource', function($resource) {
    return $resource('phone/:phoneId.json', {}, {
	query: {method: 'GET', params: {phoneId: 'phones'}, isArray: true}
    })
}]);
