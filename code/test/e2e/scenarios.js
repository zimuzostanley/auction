'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('AuctionApp', function() {
//    var name = 'zim';
    describe('Routing', function() {

	beforeEach(function() {
	    browser.get('/');
	});


	it('should jump to valid login page when / is visited', function() {
	    expect(browser.getLocationAbsUrl()).toBe('/login');
	});

	it('should log in when any name is entered', function() {
	    var query = element(by.model('email'));
	    query.sendKeys('zim');
	    element(by.css('button[type="submit"]')).click();
	    expect(browser.getLocationAbsUrl()).toBe('/dashboard');
	});

	it('should log out on logout button click', function() {
	    expect(browser.getLocationAbsUrl()).toBe('/dashboard');
	    element(by.css('[ng-click="logout()"]')).click();
	    expect(browser.getLocationAbsUrl()).toBe('/login');
	});
    });

    describe('Initial content', function() {
	var _name = 'zim';
	var _coins = '1000'

	var _bread = '30';
	var _carrot = '18';
	var _diamond = '1';
	
	beforeAll(function() {
	    browser.get('/');
	    var query = element(by.model('email'));
	    query.sendKeys(_name);
	    element(by.css('button[type="submit"]')).click();
	});

	it('should have 30 breads 18 carrots and 1 diamond for new user', function() {
	    var inventory = element.all(by.repeater('item in inventory'));

	    var bread = inventory.get(0);
	    var carrot = inventory.get(1);
	    var diamond = inventory.get(2);

	    bread.element(by.binding('item.quantity')).getText().then(function(bread) {
		expect(bread).toBe(_bread);
	    });
	    carrot.element(by.binding('item.quantity')).getText().then(function(carrot) {
		expect(carrot).toBe(_carrot);
	    });
	    diamond.element(by.binding('item.quantity')).getText().then(function(diamond) {
		expect(diamond).toBe(_diamond);
	    });
	});
	
	it('should have correct name and 1000 coins for new user', function() {
	    element(by.binding('player.name')).getText().then(function(name) {
		expect(name).toBe(_name);
	    });
	    element(by.binding('player.coins')).getText().then(function(coins) {
		expect(coins).toBe(_coins);
	    });
	});
    });

    describe('Auction', function() {

	it('should create an auction when inventory button is clicked', function() {
	    
	});

	it('should create')
    });
});
