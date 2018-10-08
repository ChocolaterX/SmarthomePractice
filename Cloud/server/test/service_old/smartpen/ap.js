/**
 * Created by Jiang Suyang on 2016-11-18.
 */

var mongoose = require('../../cloud_db_connect');

//var Scene = mongoose.model('Scene');

var log4j = require('log4js').getLogger();
var log = mongoose.model('Log');

var agenda = require('../../../lib/schedule');
//var Command = require('../device/command');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var config = require('../../../config/config');
var request = require('request');

exports.login = function (req, res) {

};

exports.changePassword = function (req, res) {

};

exports.setConfig = function (req, res) {

};

