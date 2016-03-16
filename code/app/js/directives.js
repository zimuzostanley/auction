'use strict';

/* Directives */
var directives = angular.module('Directives', []);

// Player stats widget
directives.directive('stats', function() {
    return {
	restrict: 'E',
	templateUrl: 'partials/stats.html',
	scope: {
	    player: '=',
	    logout: '&'
	},
	controller: 'StatCtrl'
    };
});


// Player inventory widget
directives.directive('inventory', function() {
    return {
	restrict: 'E',
	templateUrl: 'partials/inventory.html', // TODO.
	controller: 'InventoryCtrl'
    };
});

// Player current auction widget
directives.directive('auction', function() {
    return {
	restrict: 'E',
	templateUrl: 'partials/auction.html', // TODO.
	scope: {
	    amount: '='
	},
	controller: 'AuctionCtrl',
	link: function(scope, element, attr) {
	    
	}
    };
});
