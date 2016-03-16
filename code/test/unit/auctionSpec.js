var should = require('should');
var sinon = require('sinon');

var Auction = require('../../auction');

describe('Auction', function() {
    describe('Constructor', function() {
	var mock = {
	    timer: '',
	    auction: '',
	    listener: ''
	};

	var end = function() {
	    
	}
	
	before(function() {
	    mock.timer = function(cb, time) {
		cb();
	    };
	    
	    mock.auction = {time_remaining: 10};

	    mock.listener = sinon.spy();
	});
	
	it('should call listener when timer elapses', function() {
	    var auction_object = new Auction(mock.auction, mock.timer, mock.listener);
	    var stub = sinon.stub(mock, 'timer');
	    console.log(stub.callCount);
	    should(stub).be.calledOnce;
	    should(mock.listener).be.calledOnce;
	});
    });
});
