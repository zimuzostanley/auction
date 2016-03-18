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
controllers.controller('InventoryCtrl', ['$scope', '$window', 'InventoryService', 'SessionService', 'AuctionService', function($scope, $window, InventoryService, SessionService, AuctionService) {
    // Inventory of logged in user
    $scope.inventory = InventoryService.get({id: SessionService.getUser().id}, function(inventory) {

    });
    $scope.place_auction = function(inventory_id, item, quantity) {
	$scope.inventory[0].input = undefined;
	var id = SessionService.getUser().id;
	var auction = AuctionService.save({item: item, quantity: quantity, player_id: id, cur_state: "queued"});
	$window.alert('Your auction has been queued.');
    };

    $scope.sufficient_inventory = function(mine, bid) {
	if (!bid) {
	    return true;
	}
	if (mine >= bid) {
	    return false;
	}
	return true;
    }
}]);

// Auction controller
controllers.controller('AuctionCtrl', ['$scope', '$window', 'AuctionService', 'SessionService', 'PlayerService', function($scope, $window, AuctionService, SessionService, PlayerService) {
    // Current auction
    $scope.auction = AuctionService.get({}, function(auction) {

    });


    /**
     * Makes a PUT request to modify current auction
     * @params{int} value - New bid value
     * @params{object} auction - current auction object
     */
    $scope.bid = function(value, auction) {
	$scope.amount = undefined;
	var cur_player_id = SessionService.getUser().id;
	PlayerService.get({id: cur_player_id}, function(player) {
	    if (player.coins >= value) {
		auction.cur_bid_amount = value;
		auction.cur_bid_player_id = cur_player_id
		AuctionService.update({id: auction.id}, auction, function(auction) {

		});
		$window.alert('You have bidded successfully.');
	    }
	    else {
		$window.alert('You have insufficient coins!');
	    }
	});
    };

    $scope.sufficient_auction = function(highest, cur) {
	if (!cur) {
	    return true;
	}
	if (highest < cur) {
	    return false;
	}
	return true;
    };
}]);

// Login controller
controllers.controller('LoginCtrl', ['$scope', '$state', '$stateParams', 'AuthService', 'SessionService', 'SocketService', function($scope, $state, $stateParams, AuthService, SessionService, SocketService) {
    $scope.login = function(name) {
	AuthService.login(name, function() {
	    var player_id = SessionService.getUser().id;
	    SocketService.emit('login', {id: player_id});
	    SocketService.on('user:login', function(data) {
		if (data.id === player_id) {
		    // If client receives a login from another client with same id
		    // logout this client
		    AuthService.logout(function() {
			$state.go('login');
		    });
		}
	    });
	    $state.go('dashboard');
	});
    };

    // Prevent visit if already logged in
    if (AuthService.isLoggedIn()) {
	$state.go('dashboard');
    }
}]);

// Dashboard controller
controllers.controller('DashboardCtrl', ['$scope', '$state', '$stateParams', '$interval', '$timeout', 'AuthService', 'SessionService', 'SocketService', 'PlayerService', 'InventoryService', 'AuctionService', function($scope, $state, $stateParams, $interval, $timeout, AuthService, SessionService, SocketService, PlayerService, InventoryService, AuctionService) {
    $scope.logout = function() {
	SocketService.emit('disconnect', function() {
	});
	AuthService.logout(function() {
	    $state.go('login');
	});
    };

    // Let the server know we just got to the dashboard so it can send a signal for us to refresh the page
    var player_id = SessionService.getUser().id
    SocketService.emit('dashboard', {id: player_id});

    /**
     * Reload API resources
     * @params{object} old_timer - cancels old timer to prevent any leaks or corruption (may not be necessary)
     * @params{boolean} start - resets the timer if true
     */
    var reload = function(player, inventory, auction) {
	if ($scope.timer) {
	    $interval.cancel($scope.timer);
	}
	if (!SessionService.getUser()) {
	    return;
	}
	var id = SessionService.getUser().id;
	if (player) {
	    $scope.player = PlayerService.get({id: id});
	}
	if (inventory) {
	    $scope.inventory = InventoryService.get({id: id});
	}
	if (auction) {
	    $scope.auction = AuctionService.get({}, function(auction) {
		$scope.timer = $interval(function() {
		    if (--$scope.auction.time_remaining <= 0) {
			$scope.auction.time_remaining = 0;
			$interval.cancel($scope.timer);
		    }
		}, 1000);
	    });
	}
    };

    $scope.completed = function() {
	return $scope.hideinput;
    }

    SocketService.on('auction:start', function(data) {
	// Show 'place bid'
	$scope.hideinput = false;

	reload(false, false, true);
    });
    SocketService.on('auction:end', function(data) {
	// Hide 'place bid' input briefly
	$scope.hideinput = true;

	// Wait a few seconds to show winning bid before clearing it
	// The server counter is also waiting so you are not alone
	$timeout(function() {
	    reload(true, true, true);
	}, 5000);
    });
    SocketService.on('auction:reload', function(data) {
	reload(false, false, true);
    });
    SocketService.on('auction:bid', function(data) {
	$scope.auction = AuctionService.get();
    });
    SocketService.on('user:login', function(data) {
	if (data.id === player_id) {
	    // If client receives a login from another client with same id
	    // logout this client
	    AuthService.logout(function() {
		$state.go('login');
	    });
	}
    });
}]);
