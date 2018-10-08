/**
 * Created by dx617 on 2014/8/10.
 */

var config = require('../config/config');
var mongoose = require('mongoose');

var connect = function () {
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    mongoose.connect(config.cloud.db, options);
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

module.exports = exports = mongoose;