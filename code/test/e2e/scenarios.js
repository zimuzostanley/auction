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
	var _name = 'zimye';
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
	// Already logged in from earlier suite
	var _quantity = 5;
	var _min_bid = 2;

	/**
	 * N.B. This test could fail if there are queued items in the database the auction is
	 * in a pause cycle at the moment. It just tests 'bread' inventory
	 */
	it('should create auction when the "auction" button is clicked', function() {
	    // Get bread (inventory) inputs to create auction
	    var inventory = element.all(by.repeater('item in inventory'));
	    var bread = inventory.get(0);

	    // Enter fields and click
	    bread.element(by.model('item.input')).sendKeys(_quantity);
	    bread.element(by.model('item.cur_bid_amount')).sendKeys(_min_bid);
	    element(by.css('[ng-click="place_auction(item.id, item.name, item.input, item.cur_bid_amount)"]')).click().then(function(alert_text) {
		browser.switchTo().alert().accept();
		// Expect
		expect(element(by.css('[ng-show="auction.item"]')).isDisplayed()).toBeTruthy();
	    });
	    	    
	});

	it('should place a bid when the "place bid" button is clicked', function() {
	    // Get auction inputs to place bid. Enter bid and click
	    element(by.model('amount')).sendKeys(_min_bid + 1);
	    element(by.css('[ng-click="bid(amount, auction)"]')).click().then(function(alert_text) {
		browser.switchTo().alert().accept();

		// Expect
		element(by.binding('auction.cur_bid_amount')).getText().then(function(bid) {
		    expect(parseInt(bid)).toBe(_min_bid + 1);
		});
	    });;

	});
    });
});
