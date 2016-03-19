'use strict';

/* jasmine specs for controllers go here */
describe('Controllers', function() {
    beforeEach(module('AuctionApp'));
    
    var player = {
	id: '1',
	name: 'zim',
	coins: '1000'
    };

    var inventory = [
	{
	    id: 1,
	    name: 'Bread',
	    quantity: 4,
	},
	{
	    id: 2,
	    name: 'Carrot',
	    quantity: 6,
	},
	{
	    id: 3,
	    name: 'Diamond',
	    quantity: 8,
	}
    ];

    var auction = {
	id: 1,
	item: 'bread',
	quantity: 5,
	time_remaining: 8,
	player_id: 1,
	player_name: 'zim',
	cur_bid_player_id: '2',
	cur_bid_player_name: 'eky',
	cur_bid_amount: 50
    };

    beforeEach(module({
	SessionService: {
	    getUser: function() {
		return { id: 1};
	    }
	}
    }));
    beforeEach(module({
	PlayerService: {
	    get: function(param, cb) {
		return player;
	    }
	}
    }));
    beforeEach(module({
	InventoryService: {
	    get: function() {
		return inventory;
	    }
	}
    }));


    beforeEach(module({
	AuctionService: {
	    get: function() {
		return auction;
	    },
	    update: function() {

	    },
	    save: function(obj) {
		return obj;
	    }
	}
    }));

    beforeEach(module({
	AuthService: {
	    isLoggedIn: function() {
		return true;
	    },
	    login: function() {
		
	    },
	    logout: function(obj) {
		
	    }
	}
    }));

    beforeEach(module({
	SocketService: {
	    emit: function() {
		
	    },
	    on: function() {
		
	    }
	}
    }));


    describe('StatCtrl', function(){
	var scope, ctrl;

	beforeEach(inject(function($rootScope, $controller) {
	    scope = $rootScope.$new();
	    ctrl = $controller('StatCtrl', {$scope: scope});
	}));

	it('should retrieve a player object', function() {
	    should(player.id).be.equal(scope.player.id);
	});
    });

    describe('InventoryCtrl', function() {
	var scope, ctrl, _AuctionService;

	beforeEach(inject(function($rootScope, $controller, AuctionService) {
	    scope = $rootScope.$new();
	    ctrl = $controller('InventoryCtrl', {$scope: scope});
	    _AuctionService = AuctionService;
	}));

	it('should retrieve an inventory object', function() {
	    should(inventory[0].id).be.equal(scope.inventory[0].id);
	});

	it('should create auction object when place_auction is called', function() {
	    var _inventory = {item: 'bread', quantity: 7, player_id: 2, cur_state: "queued"};
	    var spy = sinon.spy(_AuctionService, 'save');
	    scope.place_auction(_inventory);
	    should(spy.called);
	});

	it('should check that my inventory quantity is greater than my bid', function() {
	    should(scope.sufficient_inventory(40, 8)).be.true;
	    should(scope.sufficient_inventory(40, undefined)).be.true;
	    should(scope.sufficient_inventory(40, 41)).be.false;
	    should(scope.sufficient_inventory(40, 40)).be.true;
	});
    });

    describe('AuctionCtrl', function() {
	var scope, ctrl, _AuctionService;

	beforeEach(inject(function($rootScope, $controller, AuctionService) {
	    scope = $rootScope.$new();
	    ctrl = $controller('AuctionCtrl', {$scope: scope});
	    _AuctionService = AuctionService;
	}));

	it('should accept bid and update auction if player has sufficient funds and highest bid is less than new bid', function() {
	    var spy = sinon.spy(_AuctionService, 'update');
	    
	    scope.bid(40, {cur_bid_amount: 50});
	    should(spy.called).be.false;
	    
	    scope.bid(40, {cur_bid_amount: 40});
	    should(spy.called).be.true;

	    scope.bid(50, {cur_bid_amount: 40});
	    should(spy.called).be.true;
	});

	it('should check that my inventory quantity is greater than my bid', function() {
	    should(scope.sufficient_auction(40, 8)).be.true;
	    should(scope.sufficient_auction(40, undefined)).be.true;
	    should(scope.sufficient_auction(40, 41)).be.false;
	    should(scope.sufficient_auction(40, 40)).be.true;
	});
    });

    describe('LoginCtrl', function() {
	var scope, ctrl, _AuthService, _SocketService;

	beforeEach(inject(function($rootScope, $controller, SocketService, AuthService) {
	    scope = $rootScope.$new();
	    ctrl = $controller('LoginCtrl', {$scope: scope});
	    _AuthService = AuthService;
	    _SocketService = SocketService;
	}));

	it('should emit login event with socket', function() {
	    var spy = sinon.spy(_SocketService, 'emit');
	    
	    scope.login('zim');
	    should(spy.called).be.true;
	});

	it('should listens on login event with socket', function() {
	    var spy = sinon.spy(_SocketService, 'on');
	    
	    scope.login('zim');
	    should(spy.called).be.true;	    
	});

	it('should log user in', function() {
	    var spy = sinon.spy(_AuthService, 'login');
	    
	    scope.login('zim');
	    should(spy.called).be.true;
	});
    });

    describe('DashboardCtrl', function() {
	var scope, ctrl, _AuthService, _SocketService;

	beforeEach(inject(function($rootScope, $controller, SocketService, AuthService) {
	    scope = $rootScope.$new();
	    ctrl = $controller('LoginCtrl', {$scope: scope});
	    _AuthService = AuthService;
	    _SocketService = SocketService;
	}));

    });

});
