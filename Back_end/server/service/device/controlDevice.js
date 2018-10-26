// var mongoose = require('../../cloud_db_connect');
// var config = require('../../../config/config');
// var Device = mongoose.model('Device');
// var User = mongoose.model('User');
// var Region = mongoose.model('Region');

var validator = require('validator');
var fs = require('fs');
// var request = require('request');
// var async = require('async');
//var path = require('path');

// var CommandModule = require('./command.js');      //command自定义模块

//添加设备
exports.addDevice = (data, callback) => {
    console.log('add device');
    callback('add device success');
    // return 'add device success';
};

