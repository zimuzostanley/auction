'use strict';

/* Controllers */

var controllers = angular.module('Controllers', []);

// Stats controller
controllers.controller('StatCtrl', ['$scope', 'PlayerService', 'SessionService', function($scope, PlayerService, SessionService) {
    $scope.player = PlayerService.get({id: SessionService.getUser().id}, function(player) {

    });
}]);

// Inventory controller
controllers.controller('InventoryCtrl', ['$scope', 'InventoryService', 'SessionService', function($scope, InventoryService, SessionService) {
    $scope.inventory = InventoryService.get({id: SessionService.getUser().id}, function(inventory) {

    });
}]);

// Auction controller
controllers.controller('AuctionCtrl', ['$scope', 'AuctionService', 'SessionService', function($scope, AuctionService, SessionService) {
    $scope.auction = AuctionService.get({}, function(auction) {

    });

    $scope.bid = function(value, auction) {
	auction.cur_bid_amount = value;
	auction.cur_bid_player_id = SessionService.getUser().id;
	AuctionService.update({id: auction.id}, auction, function(auction) {

	});
    };
}]);

// Login controller
controllers.controller('LoginCtrl', ['$scope', 'AuthService', 'SessionService', 'SocketService', function($scope, AuthService, SessionService, SocketService) {
    $scope.login = function(name) {
	var user = AuthService.login(name, function() {
	    
	    SocketService.emit('init', {id: SessionService.getUser().id});
	    SocketService.on('init', function(data) {
		console.log(data);
	    });
	    $scope.$state.go('dashboard');
	});
    };

    // Prevent visit if already logged in
    if (AuthService.isLoggedIn()) {
	$scope.$state.go('dashboard');
    }
}]);

// Dashboard controller
controllers.controller('DashboardCtrl', ['$scope', 'AuthService', 'SocketService', function($scope, AuthService, SocketService) {
    $scope.logout = function() {
	console.log('AuthService logout');
	AuthService.logout(function() {
	    $scope.$state.go('login');
	});
    };    
}]);
