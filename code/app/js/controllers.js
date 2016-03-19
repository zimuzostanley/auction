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

    /**
     * Create a new auction from a player's inventory
     * @param{int} inventory_id
     * @param{string} item - type of item (bread/carrot/diamond)
     * @param{int} quantity - quantity of item
     */
    $scope.place_auction = function(inventory_id, item, quantity, cur_bid_amount) {
	var id = SessionService.getUser().id;
	console.log(cur_bid_amount);
	var auction = AuctionService.save({item: item, quantity: quantity, player_id: id, cur_state: "queued", cur_bid_amount: cur_bid_amount});
	for (var i = 0; i < 3; i++) {
	    $scope.inventory[i].input = undefined;
	    $scope.inventory[i].cur_bid_amount = undefined;	    
	}
	$window.alert('Your auction has been queued.');
    };

    /**
     * Checks that a new auction doesn't exceed the inventory and there's a valid minimum bid
     * @param{int} mine
     * @param{int} bid
     * @param{int} minimum_bid
     * @returns boolean
     */
    $scope.sufficient_inventory = function(mine, bid, minimum_bid) {
	if (parseInt(bid) != bid || parseInt(minimum_bid) != minimum_bid || parseInt(mine) != mine) {
	    return true;
	}
	if (mine < 0 || bid < 0 || minimum_bid < 0) {
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
     * @param{int} value - New bid value
     * @param{object} auction - current auction object
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

    /**
     * Indicates if the auction was won
     * @returns{boolean}
    */
    $scope.won = function() {
	return !!$scope.auction.cur_bid_player_name;
    }

    /**
     * Checks that a new bid (cur) is greater than the current highest bid (highest)
     * @param{int} highest
     * @param{int} cur
     * @returns boolean
     */
    $scope.sufficient_auction = function(highest, cur) {
	if (parseInt(cur) != cur || parseInt(highest) != highest) {
	    return true;
	}
	if (highest < 0 || cur < 0) {
	    return true;
	}
	if (highest < cur) {
	    return false;
	}
	return true;
    };
}]);

// Login controller
controllers.controller('LoginCtrl', ['$scope', '$state', 'AuthService', 'SessionService', 'SocketService', function($scope, $state, AuthService, SessionService, SocketService) {
    /**
     * Logs user in, and stores user id in localStorage as a session token
     * Broadcasts this event to all clients
     * @param{string} name - username
     */
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
controllers.controller('DashboardCtrl', ['$scope', '$state', '$interval', '$timeout', '$window', 'AuthService', 'SessionService', 'SocketService', 'PlayerService', 'InventoryService', 'AuctionService', function($scope, $state, $interval, $timeout, $window, AuthService, SessionService, SocketService, PlayerService, InventoryService, AuctionService) {
    /**
     * Log user out and disconnect socket
     */
    // TODO. Is disconnect event redundant?
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
     * @param{object} old_timer - cancels old timer to prevent any leaks or corruption (may not be necessary)
     * @param{boolean} start - resets the timer if true
     */
    // TODO. Make this block testable/reachable publicly?
    var reload = function(player, inventory, auction) {
	/**
	 * Cancels the timer if on the previous iteration,
	 * there was a disparity in the client and server timer
	 * and the server finished counting down before the client
	 * could end it's timer in it's callback
	 */
	if ($scope.timer) {
	    $interval.cancel($scope.timer);
	    $scope.timer = null;
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
			$scope.timer = null;
		    }
		}, 1000);
	    });
	}
    };


    /**
     * Checks if auction is completed
     * @returns boolean
     */
    $scope.completed = function() {
	return $scope.hideinput;
    }

    /**
     * When tab comes in focus, sync client time with server
     * Some browsers like Chrome, pause long running background activities
     * like timers, when their windows are not in focus
     */
    $window.onfocus = function() {
	reload(false, false, true);
    };

    /**
     * Important socket listeners. This is realtime!!
     */
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
	    reload(true, true, false);
	    $scope.auction = AuctionService.get();
	}, 10000);
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
