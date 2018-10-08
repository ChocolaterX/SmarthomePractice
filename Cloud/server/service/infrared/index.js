/**
 * <copyright file="index.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>4/02/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var express = require('express');
var router = express.Router();

var telecontroller = require('./telecontroller');
var infraredCommand = require('./infraredCommand');

//遥控器
router.post('/infrared/telecontroller/create', telecontroller.createTelecontroller);
router.post('/infrared/telecontroller/update', telecontroller.updateTelecontroller);
router.post('/infrared/telecontroller/list/get', telecontroller.getTelecontrollerList);
router.post('/infrared/telecontroller/delete', telecontroller.deleteTelecontroller);

//指令
router.post('/infrared/command/create', infraredCommand.createInfraredCommand);
router.post('/infrared/command/update', infraredCommand.updateInfraredCommand);
router.post('/infrared/command/list/get', infraredCommand.getInfraredCommandList);
router.post('/infrared/command/delete', infraredCommand.deleteInfraredCommand);

//学习，与确认学习
router.post('/infrared/command/simulate/start', infraredCommand.startSimulateInfraredCommand);
router.post('/infrared/command/simulate/confirm', infraredCommand.confirmSimulateInfraredCommand);

//执行
router.post('/infrared/command/execute', infraredCommand.executeInfraredCommand);

module.exports = router;