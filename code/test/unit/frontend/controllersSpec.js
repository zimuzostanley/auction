'use strict';

/* jasmine specs for controllers go here */
describe('Auction controllers', function() {
    beforeEach(module('AuctionApp'));

    describe('StatCtrl', function(){
	var scope, ctrl, $httpBackend;

	/* beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
	   $httpBackend = _$httpBackend_;
	   $httpBackend.expectGET('phones/phones.json').
	   respond([{name: 'Nexus S'}, {name: 'Motorola DROID'}]);

	   scope = $rootScope.$new();
	   ctrl = $controller('StatCtrl', {$scope: scope});
	   })); */
	module(function($provide) {
	    $provide.service('PlayerService', function() {
		
	   });
	});

	beforeEach(inject(function($rootScope, $controller, _PlayerService, _SessionService) {
	    scope = $rootScope.$new();
	    ctrl = $controller('StatCtrl', {$scope: scope}, );
	    
	}));
    });

    describe('InventoryCtrl', function() {
	
    });

    describe('AuctionCtrl', function() {
	
    });

    describe('LoginCtrl', function() {
	
    });

    describe('DashboardCtrl', function() {
	
    });

});
