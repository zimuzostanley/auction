/**
 * Promotes an auction from 'queued' to 'running'. Ensures, there's ONLY one running
 * @params{object} conn - database connection
 * @params{Function} cb - callback with signature cb(err, auction), where auction is the promoted auction, null if none in queue
 */
var get_next_auction = function(conn, cb) {
    conn.query('SELECT * FROM Auction WHERE cur_state = ? ORDER BY date ASC LIMIT 1 ', ['queued'], function(err, rows) {
	if (err || !rows[0]) {
	    return cb(err || 'empty');
	}
	return cb(null, rows[0]);
    });
};


var Auction = function(auction, timer, listener, conn) {
    this.time = auction.time_remaining - 1; // Subtract 1 for network latency
    this.auction = auction;
    this.listener = listener; // listen for when auction ends
    var self = this;

    this.timer = timer(function() {
	console.log(self.time);
	if (--self.time <= 0) {
	    self.end_auction(conn, function() {
		return self.listener(); // Auction has ended
	    });
	}
    }, 1000);

};
Auction.get_next_auction = get_next_auction;


/**
 * @params{Function} update_auction - does the actual update on the database
 * @params{object} conn - Database connection object
 * @params{int} id - auction row id
 * @params{int} player_id - player id of new bid
 * @params{int} amount - new value of bid
 */
Auction.prototype.receive_auction = function(conn, player_id, amount, cb) {
    if (this.time < 10) {
	this.time = 10;
    }

    if (amount > this.auction.cur_bid_amount) {
	this.auction.cur_bid_amount = amount;
	this.auction.cur_bid_player_id = player_id;
	var id = this.auction.id;
	conn.query('SELECT * FROM Player WHERE id = ? ', [player_id], function(err, rows) {
	    if ((err || !rows[0]) && cb) {
		return cb(err);
	    }
	    if (rows[0]['coins'] < amount) {
		return cb(new Error('Insufficient funds'));
	    }
	    conn.query('UPDATE Auction SET cur_bid_player_id = ? , cur_bid_amount = ? WHERE id = ?', [player_id, amount, id], function(err, rows) {
		if ((err || !rows[0]) && cb) {
		    return cb(err);
		}
		if (cb) {
		    return cb();
		}
	    });
	});
    }
};

Auction.prototype.end_auction = function(conn, cb) {
    var self = this;
    // TODO. After auction ends, balance, accounts
    conn.query('UPDATE Auction SET cur_state = ? WHERE id = ?', ['done', this.auction.id], function(err, rows) {
	if (err || !rows) {
	    if (cb) {
		cb(err);
	    }
	    return;
	}
	self.reconcile(conn, function(err) {
	    if (err) {
		// TODO. Let the parties know
		return console.log(err);	
	    }
	});
	if (cb) {
	    return cb();
	}
    });
}

Auction.prototype.reconcile = function(conn, cb) {
    var auction = this.auction;
    var item = auction.item.toLowerCase();

    // For bidder: Subtract coins but add to inventory
    // Update Player
    conn.query('UPDATE Player SET coins = coins - ? WHERE id = ?', [auction.cur_bid_amount, auction.cur_bid_player_id], function(err, rows) {
	if (err || !rows) {
	    cb(err);
	    return;
	}
	// Get inventory_id
	conn.query('SELECT * FROM Player WHERE id = ?', [auction.cur_bid_player_id], function(err, rows) {
	    if (err || !rows[0]) {
		cb(err);
		return;
	    }
	    // Update Inventory
	    conn.query('UPDATE Inventory SET ' + item + ' = ' + item + ' + ? ' + 'WHERE id = ?', [auction.quantity, rows[0]['inventory_id']], function(err, rows) {
		if (err || !rows) {
		    cb(err);
		    return;
		}

		/** -- Terrible nesting -- */

		// For auctioner: Add coins but subtract from inventory
		// Update Player
		conn.query('UPDATE Player SET coins = coins + ? WHERE id = ?', [auction.cur_bid_amount, auction.player_id], function(err, rows) {
		    if (err || !rows) {
			cb(err);
			return;
		    }
		    // Get inventory_id
		    conn.query('SELECT * FROM Player WHERE id = ?', [auction.player_id], function(err, rows) {
			if (err || !rows[0]) {
			    cb(err);
			    return;
			}
			// Update Inventory
			conn.query('UPDATE Inventory SET ' + item + ' = ' + item + ' - ? ' + 'WHERE id = ?', [auction.quantity, rows[0]['inventory_id']], function(err, rows) {
			    if (err || !rows) {
				cb(err);
				return;
			    }
			    return cb();
			});
		    });
		});
		/** -- Terrible nesting -- */
	    });
	});
    });
};
module.exports = Auction;
