/**
 * <copyright file="index.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>12/06/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var express = require('express');
var router = express.Router();
var scene = require('./scene');
var autorum = require('./autorun');

router.post('/scene/create', scene.createScene);
router.post('/scene/update/', scene.updateScene);
router.post('/scene/list/get', scene.getSceneList);
router.post('/scene/detail/get', scene.getSceneDetail);
router.post('/scene/delete/', scene.deleteScene);

//手动执行与自动执行
router.post('/scene/run', scene.runScene);
router.post('/scene/autorun/set', scene.setSceneAutorun);

module.exports = router;