/**
 * <copyright file="index.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>3/26/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var express = require('express');
var router = express.Router();
var config = require('../../../config/config');

var setting = require('./setting');

/**
 * 管理员方法
 */

/**
 * 用户方法
 */
router.post('/setting/security/alarm/all', setting.setAllSecurityAlarm);
router.post('/setting/security/alarm/doorInduction', setting.setDoorInductionAlarm);
router.post('/setting/security/alarm/infraredInduction', setting.setInfraredInductionAlarm);
router.post('/setting/security/alarm/lock', setting.setLockAlarm);

router.post('/setting/security/check', setting.checkSecuritySetting);

module.exports = router;