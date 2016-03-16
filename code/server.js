var express = require('express');
app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');

var compression = require('compression');
var body_parser = require('body-parser');


var conn = mysql.createConnection({
    host: 'localhost' ,
    user: 'auction',
    password: 'halloween31',
    database: 'auction'
});

conn.connect(function(err) {
    if (err) {
	return console.log('Error connecting to db');
    }
    console.log('Db connection established');



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
		    conn.query('INSERT INTO Inventory SET ?', {bread: 30, carrot: 18, diamond: 1}, function(err, row) {
			if (err || !row) {
			    return next(err);
			}
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
	    res.json(null);
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

	conn.query('SELECT * FROM Player WHERE id = ? ', [id], function(err, prows) {
	    if (err || !prows[0]) {
		return next(err);
	    }
	    conn.query('SELECT * FROM Inventory WHERE id = ? ', [prows[0]['inventory_id']], function(err, irows) {
		if (err || !irows[0]) {
		    return next(err);
		}
		var items = [
		    {
			id: irows[0]['id'],
			name: 'bread',
			quantity: irows[0]['bread'],
		    },
		    {
			id: irows[0]['id'],
			name: 'carrot',
			quantity: irows[0]['carrot'],
		    },
		    {
			id: irows[0]['id'],
			name: 'diamond',
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
		return next(err);
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
    app.get('/api/v1/auction/:id', function(req, res, next) {
	conn.query('SELECT * FROM Auction WHERE cur_state = ?', ['running'], function(err, rows) {
	    if (err || !rows[0]) {
		return next(err);
	    }
	    res.json({
		id: 1,
		bread: rows[0]['bread'],
		carrot: rows[0]['carrot'],
		diamond: rows[0]['diamond'],
		cur_bid_player_id: rows[0]['cur_bid_player_id'],
		cur_bid_amount: rows[0]['cur_bid_amount']
	    });
	});
    });

    // TODO. Handle error
    app.use(function(err, req, res, next) {
	// TODO. More elaborate error handling
	return res.json(err);
    });



    var port = 9000;
    app.listen(port, function() {
	console.log('Http server listening on :' + port + '...');
    });
});
