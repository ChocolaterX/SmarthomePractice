/**
 * <copyright file="index.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>2/22/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var express = require('express');
var router = express.Router();

//var deviceAdmin = require('./deviceAdmin');
//var userLog = require('../log/userLog');
//var adminLog = require('../log/adminLog');
//var command = require('./command');
var securityDeviceAdmin = require('./securityDeviceAdmin');
var securityDevice = require('./securityDevice');
//var doorInduction = require('./doorInduction');

var config = require('../../../config/config');

/**
 * 管理员方法
 */
router.post('/admin/security/device/create', securityDeviceAdmin.createSecurityDevice);
router.post('/admin/security/device/list/get', securityDeviceAdmin.getSecurityDeviceList);

/**
 * 用户方法
 */
router.post('/security/device/add', securityDevice.addSecurityDevice);
router.post('/security/device/update', securityDevice.updateSecurityDevice);
router.post('/security/device/list/get', securityDevice.getSecurityDeviceList);
//router.post('/security/device/detail/get', securityDevice.getSecurityDeviceDetail);
router.post('/security/device/delete', securityDevice.deleteSecurityDevice);

router.post('/security/log/list/get',securityDevice.getSecurityLogList);

router.post('/security/device/lock/command',securityDevice.lockCommand);


module.exports = router;