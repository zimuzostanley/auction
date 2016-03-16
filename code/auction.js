/**
 * Promotes an auction from 'queued' to 'running'. Ensures, there's ONLY one running
 * @params{object} conn - database connection
 * @params{Function} cb - callback with signature cb(err, auction), where auction is the promoted auction, null if none in queue
 */
var get_next_auction = function(conn, cb) {
    conn.query('SELECT * FROM Auction WHERE cur_state = ? ORDER BY date ASC LIMIT 1 ', ['queued'], function(err, rows) {
	if (err) {
	    return cb(err);
	}
	return cb(null, rows[0]);
    });
};


var Auction = function(auction, timer, listener, conn) {
    this.time = auction.time_remaining;
    this.auction = auction;
    this.extra_time = 10; // 10 seconds extra time
    this.listener = listener; // listen for when auction ends

    var count_down = function(time) {
	console.log(time);
	var self = this;

	timer(function() {
	    if (self.extra_time) {
		var tmp = self.extra_time;
		self.extra_time = 0;
		count_down.call(self, tmp);
	    }
	    else {
		self.end_auction(conn, self.auction.id, function() {
		    return self.listener(); // Auction has ended		    
		});
	    }
	}, time*100);
    };

    count_down.call(this, this.time);
};
Auction.get_next_auction = get_next_auction;


/**
 * @params{Function} update_auction - does the actual update on the database
 * @params{object} conn - Database connection object
 * @params{int} id - auction row id
 * @params{int} player_id - player id of new bid
 * @params{int} amount - new value of bid
 */
Auction.prototype.receive_bid = function(conn, player_id, amount, id, cb) {
    if (this.time < 10 && !this.extra_time) {
	this.extra_time = 10;
    }

    if (amount > this.auction.amount) {
	conn.query('UPDATE Auction SET cur_bid_player_id = ? , cur_bid_amount = ? WHERE id = ?', [player_id, amount, id], function(err, rows) {
	    if (err || !rows[0] && cb) {
		return cb(err);
	    }
	    if (cb) {
		return cb();   
	    }
	});
    }
};

Auction.prototype.end_auction = function(conn, id, cb) {
    // TODO. After auction ends, balance, accounts
    conn.query('UPDATE Auction SET cur_state = ? WHERE id = ?', ['done', id], function(err, rows) {
	if (err || !rows[0] && cb) {
	    return cb(err);
	}
	this.reconcile(id, bidder_id, owner_id);
	if (cb) {
	    return cb();   
	}
    });
}



module.exports = Auction;
