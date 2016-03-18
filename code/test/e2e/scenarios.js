'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('AuctionApp', function() {

    describe('Testing routes', function() {

	beforeEach(function() {
	    browser.get('/');
	});


	it('should jump to valid login page when / is visited', function() {
	    expect(browser.getLocationAbsUrl()).toBe('/login');
	});

	it('logs in when any name is entered', function() {
	    var query = element(by.model('email'));
	    query.sendKeys('zim');
	    element(by.css('button[type="submit"]')).click();
	    expect(browser.getLocationAbsUrl()).toBe('/dashboard');
	});


    });
});
