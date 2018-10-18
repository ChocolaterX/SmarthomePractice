/**
 * <copyright file="controlDevice.js" company="Run">
 * Copyright (c) 2018 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>10/17/2018</date>
 * <summary>
 *  。
 * </summary>
 */

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
exports.addDevice =  (data,callback) =>{
    console.log('add device');
    callback('add device success');
    // return 'add device success';
};

