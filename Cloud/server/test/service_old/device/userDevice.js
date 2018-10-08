/**
 * Created by liyang on 2015-5-27.
 */
var mongoose = require('../../cloud_db_connect');
var UserDevice = mongoose.model('UserDevice');
var Device = mongoose.model('Device');
var User = mongoose.model('User');
var Scene = mongoose.model('Scene');
var log4j = require('log4js').getLogger();
var UserLog = mongoose.model('UserLog');
var AdminLog = mongoose.model('AdminLog');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var config = require('../../../config/config');
var request = require('request');
var async = require('async');
