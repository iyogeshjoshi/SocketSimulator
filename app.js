/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var MarketController = require('./routes/marketCtrl');

var app = express();
var serverIp = '107.21.216.112';

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// collection variables for stock market
var companies = [],
    openTime = 60 * 60,    // 1 min
    closeTime = 5 * 60 * 60;    // 5 min

// set companies in market controller
companies = MarketController.getCompanies();

// set open time
openMarket = function () {
    // things to do when a market opens goes here

    // set open market timeout
    setTimeout(MarketController.open, openTime);
}

// set close time
closeMarket = function () {
    // things to do when a market closes goes here

    // set close market timeout
    setTimeout(MarketController.close, closeTime);
}
// open market
MarketController.open();
/*app.get('/', function (req, res) {
 MarketController.open();
 });*/
app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);
io = io.listen(server);
MarketController.io(io);
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
// on connection send list of all companies
io.sockets.on('connection', function (socket) {
    console.log('successfully connected!');
    socket.emit('companyList', companies);
});
