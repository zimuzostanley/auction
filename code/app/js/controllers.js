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
    $scope.phones = AuctionService.get({id: SessionService.getUser().id}, function(auction) {
	
    });
    $scope.amount = "5";
}]);

// Login controller
controllers.controller('LoginCtrl', ['$scope', 'AuthService', function($scope, AuthService) {
    $scope.login = function(name) {
	var user = AuthService.login(name, function() {
	    $scope.$state.go('dashboard');   
	});
    };

    // Prevent visit if already logged in
    if (AuthService.isLoggedIn()) {
	//$scope.$state.go('dashboard');	
    }
}]);

// Dashboard controller
controllers.controller('DashboardCtrl', ['$scope', 'AuthService', function($scope, AuthService) {
    $scope.logout = function() {
	console.log('AuthService logout');
	AuthService.logout(function() {
	    $scope.$state.go('login'); 
	});
    };
}]);

