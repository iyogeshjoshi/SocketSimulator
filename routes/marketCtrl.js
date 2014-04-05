/**
 * Created with JetBrains WebStorm.
 * User: Yogesh Joshi
 * Date: 30/3/14
 * Time: 8:52 PM
 * To change this template use File | Settings | File Templates.
 */

var _ = require('underscore');

var companies, changePriceInterval, io;

// set sample data
//companies = [
//    {
//        name: "Google Inc.",
//        ticker: "GOOG",
//        price: 1000.00,
//        high: 1000.00,
//        low: 1000.00,
//        closed: 1000.0,
//        change: 0.00,
//        changeper: 0.00,
//        buy: 5000,
//        sell: 5000,
//        time: new Date().valueOf()
//    }
//];
companies = [
    {
        name: "Google Inc.",
        ticker: "GOOG",
        data: [
            {
                price: 1000.00,
                high: 1000.00,
                low: 1000.00,
                closed: 1000.0,
                open: 1000.0,
                change: 0.00,
                changeper: 0.00,
                buy: 5000,
                sell: 5000,
                time: new Date().valueOf()
            }
        ]
    },
    {
        name: "Apple Inc.",
        ticker: "APPL",
        data: [
            {
                price: 500.00,
                high: 500.00,
                low: 500.00,
                closed: 500.0,
                open: 500.0,
                change: 0.00,
                changeper: 0.00,
                buy: 5000,
                sell: 15000,
                time: new Date().valueOf()
            }
        ]
    }
];

module.exports = {
    getCompanies: function () {
        // assign all companies
        return companies;
    },
    open: function () {
        // open Market Logic
        companies.forEach(function (company, index) {
            var len = company.data.length - 1;
            calculatePrice(company, function (dataIndex, data) {
                company.data[dataIndex] = data;
            });
        });
        // after 5 sec start changing price every 5 sec
        changePriceInterval = setInterval(function () {
            changePrice();
        }, 5000);
    },
    close: function () {
        // close Market Logic
        companies.forEach(function (company) {
            company.closed = company.price;
        });
    },
    io: function (IO) {
        io = IO;
    }
    // generates next price
//    nextPrice: nextPrice()
}


// generates next price
nextPrice = function (price, buy, sell) {
    // get intensity
    var intensity = _.random(-5, 5) * Math.random();
    // generates rand number
    var rand = _.random(-1 * intensity, 1 * intensity) + Math.random();
//    console.log('intensity: ' + intensity);
//    console.log('rand: ' + rand);
    // get ratio for company
    var ratio = (1.0 * (buy - sell)) / (buy + sell);
    // generate next price
//    price += rand * 0.001 * price + ratio * 0.005 * price;
    price += (rand * ratio);
//    price = price * (((intensity - (Math.pow(ratio, 2) / 2)) * rand) + (ratio * intensity));

    return parseFloat(price.toFixed(3));
}

// change price logic
changePrice = function () {
    companies.forEach(function (company) {
        var len = company.data.length - 1;

        calculatePrice(company, function (dataIndex, data) {
            company.data[dataIndex] = data;
            console.log('new price for ' + company.ticker + ' : $' + company.data[dataIndex].price + ' change: ' + company.data[dataIndex].changeper + ' high: ' + company.data[dataIndex].high + ' low: ' + company.data[dataIndex].low + ' closed: ' + company.data[dataIndex].closed);
            io.sockets.emit(company.ticker, data);
        })
    })
}

calculatePrice = function (company, callback) {
    var len = company.data.length - 1;
    // initialize
    var data = {};
    // get next price
    data.price = nextPrice(company.data[len].price, company.data[len].buy, company.data[len].sell);
    // set initial price as high and low
    data.high = company.data[len].high;
    data.low = company.data[len].low;
    if (data.price > company.data[len].high)
        data.high = data.price;
    else if (data.price < company.data[len].low)
        data.low = data.price;
    data.closed = company.data[len].closed;
    data.open = company.data[len].open;
    data.change = data.price - data.closed;
    data.changeper = parseFloat(((data.change / data.closed) * 100).toFixed(2));
    var volume = company.data[len].buy + company.data[len].sell;
    data.buy = _.random(0, volume);
    data.sell = volume - company.data[len].buy;
    data.time = new Date().valueOf();
    // callback
    callback(len + 1, data);

}