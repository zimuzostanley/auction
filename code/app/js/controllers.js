'use strict';

/* Controllers */

var controllers = angular.module('Controllers', []);

// Stats controller
controllers.controller('statController', ['$scope', 'Player', 'Inventory', 'Auction', function($scope, Player, Inventory, Auction) {
    //  $scope.player = Player.query();
    $scope.player = {name: 'zim', coins: 600};
}]);

// Inventory controller
controllers.controller('inventoryController', ['$scope', 'Player', 'Inventory', 'Auction', function($scope, Player, Inventory, Auction) {
//    $scope.phones = Phone.query();
//    $scope.orderProp = 'age';
}]);

// Auction controller
controllers.controller('auctionController', ['$scope', 'Player', 'Inventory', 'Auction', function($scope, Player, Inventory, Auction) {
    $scope.amount = "5";
}]);
