/**
 * <copyright file="index.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>11/22/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var express = require('express');
var router = express.Router();

var device = require('./device');
var deviceAdmin = require('./deviceAdmin');
var command = require('./command');
//var userLog = require('../log/userLog');
//var adminLog = require('../log/adminLog');

//var multer = require('multer');
var config = require('../../../config/config');

/**
 * 管理员方法
 */

router.post('/admin/device/create', deviceAdmin.createDevice);
//router.post('/admin/device/update', deviceAdmin.updateDevice);
router.post('/admin/device/list/get', deviceAdmin.getDeviceList);
//router.post('/admin/device/delete', deviceAdmin.deleteDevice);

/**
 * 公用方法
 */

/**
 * 用户方法
 */
router.post('/device/add', device.addDevice);
router.post('/device/update', device.updateDevice);
router.post('/device/list/get', device.getDeviceList);
router.post('/device/detail/get', device.getDeviceDetail);
router.post('/device/delete', device.deleteDevice);

router.post('/device/command', command.command);
//router.post('/device/command/execute', command.executeCommand);     //测试方法

module.exports = router;