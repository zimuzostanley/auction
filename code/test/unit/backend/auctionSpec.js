
//var Auction = require('../../auction');

describe('Auction', function() {
    var mock = {
	timer: '', // Function Will be mocked before use
	auction: {
	    id: 1,
	    item: 'bread',
	    quantity: 4,
	    cur_bid_player_id: 2,
	    cur_bid_player_name: '',
	    cur_bid_amount: 5
	},
	listener: '' // Function will be mocked before use
    };

    describe('Constructor', function() {
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

    describe('Instance methods', function() {
	var auction_object;
	
	beforeEach(function() {
	    auction_object = new Auction(mock.auction, mock.timer, mock.listener);
	});
	
	it('should reconcile after auction ends', function() {
	    
	});
    });
});
