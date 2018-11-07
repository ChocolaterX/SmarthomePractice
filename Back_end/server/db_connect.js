let mongoose = require('mongoose');
let config = require('../config/config');
// let DB_URL = 'mongodb://192.168.10.152:27017/SmartHome_Practice';
let DB_URL = config.DB_URL;
let options = {
    useNewUrlParser: true   //Set to true to make all connections set the useNewUrlParser option by default.
};

mongoose.connect(DB_URL, options);

mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open to ' + DB_URL);
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
});

module.exports = mongoose;
