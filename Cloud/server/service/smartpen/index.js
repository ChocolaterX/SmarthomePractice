/**
 * <copyright file="index.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>3/29/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var express = require('express');
var router = express.Router();
var run = require('./run.js');
var actionBinding = require('./actionBinding.js');
var soundKeyword = require('./soundKeyword.js');

var config = require('../../../config/config');

/**
 * 用户方法
 */
router.post('/action/binding/create', actionBinding.createActionBinding);
router.post('/action/binding/update', actionBinding.updateActionBinding);
router.post('/action/binding/list/get', actionBinding.getActionBindingList);
router.post('/action/binding/detail/get', actionBinding.getActionBindingDetail);
router.post('/action/binding/delete', actionBinding.deleteActionBinding);

router.post('/sound/keyword/create', soundKeyword.createSoundKeyword);
router.post('/sound/keyword/update', soundKeyword.updateSoundKeyword);
router.post('/sound/keyword/list/get', soundKeyword.getSoundKeywordList);
router.post('/sound/keyword/detail/get', soundKeyword.getSoundKeywordDetail);
router.post('/sound/keyword/delete', soundKeyword.deleteSoundKeyword);
//router.post('/sound/run',run.analyseAndExecuteKeyword);

module.exports = router;