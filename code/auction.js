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
    this.listener = listener; // listen for when auction ends
    var self = this;

    this.timer = timer(function() {
	console.log(self.time);
	if (--self.time <= 0) {
	    self.end_auction(conn, function() {
		console.log('Auction object: ended');
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
Auction.prototype.receive_bid = function(conn, player_id, amount, io, cb) {
    if (this.time < 10) {
	this.time += 10;
    }

    if (amount > this.auction.cur_bid_amount) {
	this.auction.cur_bid_amount = amount;
	this.auction.cur_bid_player_id = player_id;
	conn.query('SELECT * FROM Player WHERE id = ? ', [player_id], function(err, rows) {
	    if ((err || !rows[0]) && cb) {
		return cb(err);
	    }
	    if (rows[0]['coins'] < amount) {
		return cb(new Error('Insufficient funds'));
	    }
	    conn.query('UPDATE Auction SET cur_bid_player_id = ? , cur_bid_amount = ? WHERE id = ?', [player_id, amount, this.auction.id], function(err, rows) {
		if ((err || !rows[0]) && cb) {
		    return cb(err);
		}
		if (cb) {
		    io.emit('auction:reload');
		    return cb();
		}
	    });
	});
    }
};

Auction.prototype.end_auction = function(conn, cb) {
    // TODO. After auction ends, balance, accounts
    conn.query('UPDATE Auction SET cur_state = ? WHERE id = ?', ['done', this.auction.id], function(err, rows) {
	if ((err || !rows[0]) && cb) {
	    return cb(err);
	}
	this.reconcile(conn);
	if (cb) {
	    return cb();
	}
    });
}

Auction.prototype.reconcile = function(conn, cb) {
    var auction = this.auction;
    if (auction.cur_bid_amount > 0) {
	var sql_update = [auction.cur_bid_amount, auction.item, auction.quantity];
	// For bidder: Subtract coins but add to inventory
	conn.query('UPDATE Player SET coins = coins - ? , ? = ? + ? WHERE id = ?',  sql_update.concat(auction.cur_bid_player_id), function(err, rows) {
	    if (err || !rows[0] && cb) {
		return cb(err);
	    }
	    // For Auctioner: Add coins but subtract from inventory
	    conn.query('UPDATE Player SET coins = coins + ? , ? = ? - ? WHERE id = ?', sql_update.concat(auction.player_id), function(err, rows) {
		if ((err || !rows[0]) && cb) {
		    return cb(err);
		}
		if (cb) {
		    return cb();
		}
	    });
	});
    }
}


module.exports = Auction;
