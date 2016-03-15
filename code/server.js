var express = require('express');
app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');

var compression = require('compression');
var body_parser = require('body-parser');
var sessions = require("client-sessions");


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
    app.use(body_parser.json());
    app.use(body_parser.urlencoded({extended: true}));
    app.use(sessions({
	cookieName: 'session',
	secret: 'coiw-cpio iowvii)#u;">?"j oiewj'
    }));

    app.use(function(req, res, next) {
	if (req.url != '/login') {
	    if (req.session.user) {
		next();
	    }
	    else {
		res.redirect('/login');
	    }
	}
	else {
	    next();
	}
    });

    // Login
    app.post('/login', function(req, res) {
	
    });

    // Logout
    app.get('/logout', function (req, res) {
	req.session.reset();
	res.redirect('/login');
    });

    // API
    app.get('/inventory/:id', function(req, res) {
	
    });
    app.get('/player/:id', function(req, res) {
	
    });
    app.get('/auction/:id', function(req, res) {
	
    });

    // Handle error
    app.use(function(err, req, res, next) {
	next(err);
    });



    var port = 9000;
    app.listen(port, function() {
	console.log('Http server listening on :' + port + '...');
    });
});

