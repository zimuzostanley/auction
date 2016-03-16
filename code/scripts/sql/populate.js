/**
 * Populates the database, 'auction' with dummy data
 * Usage: 'node populate.js'
 */

var mysql = require('../../node_modules/mysql');

var conn = mysql.createConnection({
    host: 'localhost' ,
    user: 'auction',
    password: 'halloween31',
    database: 'auction'
});

/**
 * @param{int} num - number of inventory items to create
 */
var create_inventory = function(num) {
    for (var i = 1; i <= num; i++) {
	var inventory = {bread: 30, carrot: 18, diamond: 1};
	conn.query('INSERT INTO Inventory SET ?', inventory, function(err, res) {
	    if (err) {
		return console.log(err);
	    }
	});
    }
};

/**
 * The players are paired one to one with inventory, it is also assumed that the...
 * 'id' PRIMARY KEY is auto incremented
 * @param{int} num - number of players to create
 */

var create_players = function(num) {
    console.log(i);
    for (var i = 1; i <= num; i++) {
	var player = {name: 'zim' + i, inventory_id: i, coins: 1000};
	conn.query('INSERT INTO Player SET ?', player, function(err, res) {
	    if (err) {
		return console.log(err);
	    }
	});
    }
}

/**
 * A few auctions will be created in the queued and done states. Just one will be in the running state
 * @param{int} numq - number of queued auctions
 * @param{int} numd - number of done auctions
 */
var create_auctions = function(numq, numd) {
    for (var i = 1; i <= numq; i++) {
	var auctionq = {item: 'bread', quantity: i + 5, player_id: i};
	conn.query('INSERT INTO Auction SET ?', auctionq, function(err, res) {
	    if (err) {
		return console.log(err);
	    }
	});
    }

    for (var i = 1; i < numd; i++) {
	var auctiond = {item: 'diamond', quantity: i, player_id: numq + i, cur_state: "done"};
	conn.query('INSERT INTO Auction SET ?', auctiond, function(err, res) {
	    if (err) {
		return console.log(err);
	    }
	});
    }


    var auctionr = {item: 'carrot', quantity: 37, player_id: numq + numd, cur_state: "running", cur_bid_player_id: 1};
    conn.query('INSERT INTO Auction SET ?', auctionr, function(err, res) {
	if (err) {
	    return console.log(err);
	}
    });
}

var populate_db = function(num) {
    create_inventory(num);
    create_players(num);
    create_auctions(Math.floor(num/2), Math.floor((num - 1)/2));
}

conn.connect(function(err) {
    if (err) {
	return console.log('Error connecting to db');
    }
    console.log('Db connection established');

    populate_db(10);

});
