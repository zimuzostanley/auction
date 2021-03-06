'use strict';

/* Services */
var services = angular.module('Services', ['ngResource']);

// Player
services.factory('PlayerService', ['$resource', function($resource) {
    return $resource('api/v1/player/:id', {}, {
    });
}]);

// Inventory
services.factory('InventoryService', ['$resource', function($resource) {
    return $resource('api/v1/inventory/:id', {}, {
	get: {method: 'GET', params: {id: 'id'}, isArray: true},
    });
}]);

// Auction
services.factory('AuctionService', ['$resource', function($resource) {
    return $resource('api/v1/auction/:id', {}, {
	update: {method: 'PUT'},
	save: {method: 'POST', params: {item: 'id', quantity: 'quantity', player_id: 'player_id', cur_state: 'queued', cur_bid_amount: 'cur_bid_amount'}}}
    );
}]);


// Auth
services.service('AuthService', ['$http', 'SessionService', function($http, SessionService) {
    /**
     * Checks if the user is logged in
     * @returns boolean
     */
    this.isLoggedIn = function() {
	return SessionService.getUser() !== null;
    };

    /**
     * Logs a user in
     * @returns {Promise}
     */
    this.login = function(name, cb) {
	return $http.post('/api/v1/login', {name: name})
		    .then(function(res) {
			SessionService.setUser(res.data);
			cb();
		    });
    };

    /**
     * Logs a user out
     * @returns {Promise}
     */
    this.logout = function(cb) {
	$http.get('/api/v1/logout')
	     .then(function(res) {
		 SessionService.clearSession();
		 cb();
	     });
    };
}]);

// Session
services.service('SessionService', ['$log', 'LocalStorage', function($log, LocalStorage) {

    this._user = JSON.parse(LocalStorage.getItem('session.user'));

    /**
     * @returns {User}
     */
    this.getUser = function() {
	return this._user;
    };

    /**
     * Set user's session in service and localStorage
     * @returns {this}
     */
    this.setUser = function(user) {
	if (!user || !user.id) {
	    user = null;
	}
	this._user = user;
	LocalStorage.setItem('session.user', JSON.stringify(user));
	return this;
    };

    /**
     * Clear user's session from service and localStorage
     */
    this.clearSession = function() {
	this.setUser(null);
    };
}]);

// LocalStorage
services.service('LocalStorage', ['$window', function($window) {
    if ($window.localStorage) {
	return $window.localStorage;
    }
    else {
	throw new Error("LocalStorage not suppported on your browser");
    }
}]);

// WebSocket
services.factory('SocketService', ['$rootScope', function($rootScope) {
    var socket = io.connect('/');

    return {
	/**
	 * Listens on events
	 * @param{string} eventName
	 * @param{Function} cb
	*/
	on: function(eventName, cb) {
	    socket.on(eventName, function() {
		var args = arguments;
		$rootScope.$apply(function() {
		    cb.apply(socket, args);
		});
	    });
	},
	/**
	 * Emits on events
	 * @param{string} eventName
	 * @param{object} data
	 * @param{Function} cb
	 */
	emit: function(eventName, data, cb) {
	    socket.emit(eventName, data, function() {
		var args = arguments;
		$rootScope.$apply(function() {
		    if(cb) {
			cb.apply(socket, args);
		    }
		});
	    });
	}
    };
}]);
