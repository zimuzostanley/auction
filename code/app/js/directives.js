'use strict';

/* Directives */
var directives = angular.module('Directives', []);

// Player stats widget
directives.directive('stats', function() {
    return {
	restrict: 'E',
	templateUrl: 'partials/stats.html',
	scope: {
	    player: '='
	},
	controller: function($scope) {
//	    $scope.player = {name: 'zim', coins: 60};
	}
    };
});


// Player inventory widget
directives.directive('inventory', function() {
    return {
	restrict: 'E',
	templateUrl: 'partials/inventory.html' // TODO.
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
	controller: function($scope) {
	  //$scope.amount = 5;  
	},
	link: function(scope, element, attr) {
	    
	}
    };
});
