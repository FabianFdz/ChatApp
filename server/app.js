var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');

var chat = require('./routes/chat');
var user = require('./routes/user');

var app = express();

app.use(logger('dev'));

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// connect to our database
mongoose.connect('mongodb://localhost/local');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', console.log.bind(console, 'mongodb connected'));

app.use('/chat', chat);
app.use('/user', user);

module.exports = app;
