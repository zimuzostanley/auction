var express = require('express');
app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server); // Websocket connection
var mysql = require('mysql');

var compression = require('compression');
var body_parser = require('body-parser');


var Auction = require('./auction'); // Auction class handles auction timing and event handling

// MySQL connection
var conn = mysql.createConnection({
    host: 'localhost' ,
    user: 'auction',
    password: 'halloween31',
    database: 'auction'
});

// MySQL connection handler
conn.connect(function(err) {
    if (err) {
	return console.log('Error connecting to db');
    }
    console.log('Db connection established');


    // Middleware
    app.use(compression());
    app.use(express.static(__dirname + '/app'));
    app.use(body_parser.urlencoded({extended: true}));
    app.use(body_parser.json());

    // Login
    app.post('/api/v1/login', function(req, res, next) {
	var name = req.body.name;
	// Login
	if (name) {
	    // Check if player is in DB and create inventory and player if necessary
	    conn.query('SELECT * FROM Player WHERE name = ?', [name], function(err, rows) {
		if (err) {
		    return next(err);
		}
		// If player exists
		if (rows[0]) {
		    res.json({
			id: rows[0]['id'],
		    });
		}
		// Else create a new player with inventory
		else {
		    // Create inventory
		    conn.query('INSERT INTO Inventory SET ?', {bread: 30, carrot: 18, diamond: 1}, function(err, row) {
			if (err || !row) {
			    return next(err);
			}
			// Create player and add inventory id to player
			conn.query('INSERT INTO Player SET ?', {name: name, inventory_id: row.insertId}, function(err, row) {
			    if (err || !row) {
				return next(err);
			    }
			    res.json({
				id: row.insertId,
			    });
			});
		    });
		}
	    });
	}
	else {
	    return res.json(null);
	}
    });

    // Logout
    app.get('/api/v1/logout', function (req, res) {
	res.json(null);
    });

    /**
     * Inventory API
     */
    app.get('/api/v1/inventory/:id', function(req, res, next) {
	var id = req.params.id;
	// Find inventory_id of player
	conn.query('SELECT * FROM Player WHERE id = ? ', [id], function(err, prows) {
	    if (err || !prows[0]) {
		return next(err || 'err');
	    }
	    // Get inventory
	    conn.query('SELECT * FROM Inventory WHERE id = ? ', [prows[0]['inventory_id']], function(err, irows) {
		if (err || !irows[0]) {
		    return next(err);
		}
		var items = [
		    {
			id: irows[0]['id'],
			name: 'Bread',
			quantity: irows[0]['bread'],
		    },
		    {
			id: irows[0]['id'],
			name: 'Carrot',
			quantity: irows[0]['carrot'],
		    },
		    {
			id: irows[0]['id'],
			name: 'Diamond',
			quantity: irows[0]['diamond'],
		    }
		];
		res.json(items);
	    });
	});
    });

    /**
     * Player API
     */
    app.get('/api/v1/player/:id', function(req, res, next) {
	var id = req.params.id;
	conn.query('SELECT * FROM Player WHERE id = ?', [id], function(err, rows) {
	    if (err || !rows[0]) {
		return next(err || 'err');
	    }
	    res.json({
		id: rows[0]['id'],
		name: rows[0]['name'],
		coins: rows[0]['coins']
	    });
	});
    });

    /**
     * Auction API
     */
    // GET: called when the dashboard view is loaded, it gets the oldest 'queued' auction object
    // or an empty object signifying that there are no available auctions
    app.get('/api/v1/auction', function(req, res, next) {
	conn.query('SELECT * FROM Auction WHERE cur_state = ? ORDER BY date ASC LIMIT 1 ', ['queued'], function(err, arows) {
	    if (err || !arows[0]) {
		return next(err || true);
	    }

	    // Get auction owner's name
	    conn.query('SELECT * FROM Player WHERE id = ?', [arows[0]['player_id']], function(err, pa_rows) {
		if (err || !pa_rows[0]) {
		    return next(err || true);
		}
		// Get bidder owner's name
		var cur_bid_player_id = arows[0]['cur_bid_player_id'];
		conn.query('SELECT * FROM Player WHERE id = ?', [cur_bid_player_id], function(err, pb_rows) {
		    if (err) {
			return next(err);
		    }

		    // Find the item for auction
		    var item;
		    var quantity;
		    if (_auction) {
			return res.json({
			    id: arows[0]['id'],
			    item: arows[0]['item'],
			    quantity: arows[0]['quantity'],
			    time_remaining: _auction.time + 1, // Add 1 for network latency
			    player_id: pa_rows[0]['id'],
			    player_name: pa_rows[0]['name'],
			    cur_bid_player_id: pb_rows[0] ? pb_rows[0]['id'] : undefined,
			    cur_bid_player_name: pb_rows[0] ? pb_rows[0]['name'] : undefined,
			    cur_bid_amount: arows[0]['cur_bid_amount'],
			    minimum_bid: arows[0]['minimum_bid']
			});
		    }
		    else {
			return res.json(null);
		    }
		});
	    });
	});
    });

    // PUT: called when an auction is received for an available auction,
    // req.params.id is the auction id
    app.put('/api/v1/auction/:id', function(req, res, next) {
	var id = req.params.id;

	if (_auction) {
	    _auction.receive_auction(conn, req.body.cur_bid_player_id, req.body.cur_bid_amount, function() {
		io.emit('auction:bid');
	    });
	}
	res.json(null);
    });

    // POST: Called when an auction is created
    app.post('/api/v1/auction', function(req, res, next) {
	conn.query('INSERT INTO Auction SET ?', {item: req.body.item, quantity: req.body.quantity, player_id: req.body.player_id, cur_state: req.body.cur_state, cur_bid_amount: req.body.cur_bid_amount}, function(err, row) {
	    if (err || !row) {
		return next(err);
	    }
	    auction_timing(setInterval, setTimeout, clearInterval, _auction_delay, 0, false);
	    res.json(null);
	});
    });

    // TODO. More elaborate error handling
    app.use(function(err, req, res, next) {

	return res.json(err);
    });

    // Start http server
    var port = 9000;
    server.listen(port, function() {
	console.log('Http server listening on :' + port + '...');
    });


    // Socket connection
    io.on('connection', function(socket) {
	socket.on('login', function(msg, fn) {
	    // Tell everybody asides yourself that you are online
	    // To prevent multiple logins with one account
	    socket.broadcast.emit('user:login', {id: msg.id});
	});

	socket.on('dashboard', function(msg, fn) {
	    // Tell everybody asides yourself that you are online
	    // To prevent multiple logins with one account
	    socket.broadcast.emit('user:login', {id: msg.id});
	    if (_auction) {
		socket.emit('auction:reload');
	    }
	});

	socket.on('disconnect', function() {
	    socket.disconnect();
	});
    });

    // Auction timing global
    var _auction;
    var _auction_delay = 10;
    var _auction_on;

    // TODO. Inject all dependencies and return _auction as an object in a callback
    /**
     * Auction 'event loop'. Is started when the server starts and keeps running as long as...
     * there's a 'queued' auction in the database. It also resumes when a new auction is created
     * @params{Function} timer - timer object, most likely setTimeout
     * @params{int} delay - time in seconds between when an auction ends and a new one starts
     */
    var auction_timing = function(interval, timeout, clear_interval, delay, now, immediate) {
	// A new auction was just created. It's in the db, we'd get to it in the queue later
	if (!immediate && _auction_on) {
	    return;
	}
	// Auction has ended
	if (_auction && immediate) {
	    clear_interval(_auction.timer);
	    _auction = null;
	    io.emit('auction:end'); 
	}
	// Wait for a delay before popping the next auction
	timeout(function() {
	    Auction.get_next_auction(conn, function(err, auction) {
		// TODO. Handle error properly. Serious problem if there is. Maybe, shutdown?
		if (err) {
		    _auction_on = false;
		    return console.log(err);
		}
		else if (auction) {
		    _auction_on = true;
		    _auction = new Auction(auction, interval, auction_timing.bind(this, interval, timeout, clear_interval, delay, delay, true), conn);
		    io.emit('auction:start');
		}
	    });
	}, now * 1000);

    }
    // Start auction counter when server starts. This runs only once
    // Subsequently, it will be run when a new auction is created by a player
    auction_timing(setInterval, setTimeout, clearInterval, _auction_delay, 0, true);
});
