'use strict';

/* Controllers */

var controllers = angular.module('Controllers', []);

// Stats controller
controllers.controller('StatCtrl', ['$scope', 'PlayerService', 'SessionService', function($scope, PlayerService, SessionService) {
    // Player stats of logged in user
    $scope.player = PlayerService.get({id: SessionService.getUser().id}, function(player) {

    });
}]);

// Inventory controller
controllers.controller('InventoryCtrl', ['$scope', 'InventoryService', 'SessionService', 'AuctionService', function($scope, InventoryService, SessionService, AuctionService) {
    // Inventory of logged in user
    $scope.inventory = InventoryService.get({id: SessionService.getUser().id}, function(inventory) {

    });

    $scope.place_auction = function(inventory_id, item, quantity) {
	var id = SessionService.getUser().id;
	var auction = AuctionService.save({item: item, quantity: quantity, player_id: id, cur_state: "queued"});
    };

    $scope.sufficient = function(mine, bid) {
	if (!bid) {
	    return true;
	}
	if (mine >= bid) {
	    $scope.quantity = undefined;
	    return false;	    
	}
	return true;
    }
}]);

// Auction controller
controllers.controller('AuctionCtrl', ['$scope', 'AuctionService', 'SessionService', 'PlayerService', function($scope, AuctionService, SessionService, PlayerService) {
    // Current auction
    $scope.auction = AuctionService.get({}, function(auction) {

    });

    /**
     * Makes a PUT request to modify current auction
     * @params{int} value - New bid value
     * @params{object} auction - current auction object
     */
    $scope.bid = function(value, auction) {
	var cur_player_id = SessionService.getUser().id;
	PlayerService.get({id: cur_player_id}, function(player) {
	    if (player.coins > value) {
		auction.cur_bid_amount = value;
		auction.cur_bid_player_id = cur_player_id
		AuctionService.update({id: auction.id}, auction, function(auction) {

		});
	    }
	    else {
		// Tell player he has insufficient coins
	    }
	});
    };

    $scope.sufficient = function(highest, cur) {
	if (!cur) {
	    return true;
	}
	if (highest < cur) {
//	    $scope.amount = undefined;
	    return false;
	}
	return true;
    }

}]);

// Login controller
controllers.controller('LoginCtrl', ['$scope', 'AuthService', 'SessionService', 'SocketService', function($scope, AuthService, SessionService, SocketService) {
    $scope.login = function(name) {
	AuthService.login(name, function() {
	    var player_id = SessionService.getUser().id
	    console.log("Socket login");
	    SocketService.emit('login', {id: player_id});
	    SocketService.on('user:login', function(data) {
		if (data.id == player_id) {
		    // If client receives a login from another client with same id
		    // logout this client
		    AuthService.logout(function() {
			$scope.$state.go('login');
		    });
		}
		console.log(data);
	    });
	    $scope.$state.go('dashboard');
	});
    };

    // Prevent visit if already logged in
    if (AuthService.isLoggedIn()) {
//	$scope.$state.go('dashboard');
    }
}]);

// Dashboard controller
controllers.controller('DashboardCtrl', ['$scope', '$interval', 'AuthService', 'SessionService', 'SocketService', 'PlayerService', 'InventoryService', 'AuctionService', function($scope, $interval, AuthService, SessionService, SocketService, PlayerService, InventoryService, AuctionService) {
    $scope.logout = function() {
	SocketService.emit('disconnect', function() {
	});
	console.log('disconnect');
	AuthService.logout(function() {
	    $scope.$state.go('login');
	});	    

    };
    // Let the server know we just got to the dashboard so it can send a signal for us to refresh the page
    SocketService.emit('dashboard');
    console.log('Dashboard');
    
    /**
     * Reload API resources
     * @params{object} old_timer - cancels old timer to prevent any leaks or corruption (may not be necessary)
     * @params{boolean} start - resets the timer if true
     */
    var reload = function(reset) {
	if ($scope.timer) {
	    $interval.cancel($scope.timer);
	}
	if (!SessionService.getUser()) {
	    return;
	}
	var id = SessionService.getUser().id;
	$scope.player = PlayerService.get({id: id});
	$scope.inventory = InventoryService.get({id: id});
	$scope.auction = AuctionService.get({}, function(auction) {
	    if (reset) {

		$scope.timer = $interval(function() {
		    if (--$scope.auction.time_remaining <= 0) {
			$scope.auction.time_remaining = 0;
			$interval.cancel($scope.timer);
		    }
		}, 1000);
		//console.log(timer);
	    }
	});
    };

    SocketService.on('auction:start', function(data) {
	console.log("Auction start");
	reload(true);
    });
    SocketService.on('auction:end', function(data) {
	reload(false);
	console.log("Auction end");
    });
    SocketService.on('auction:reload', function(data) {
	// Reload auction model
	console.log("Auction reload");
	reload(true);
    });
}]);
