/**
 * <copyright file="index.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>5/25/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var express = require('express');
var router = express.Router();
var run = require('./run.js');
var config = require('../../../config/config');

/**
 * 用户方法
 */
router.post('/sound/run',run.recognizeAndRunSound);

module.exports = router;