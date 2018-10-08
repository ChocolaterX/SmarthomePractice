
var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var Device = mongoose.model('Device');
var UserDevice = mongoose.model('UserDevice');
var User = mongoose.model('User');
var log4j = require('log4js').getLogger();
var UserLog = mongoose.model('UserLog');
var validator = require('validator');
var gateway = require('../gateway/gateway');
var fs = require('fs');


