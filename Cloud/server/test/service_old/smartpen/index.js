/**
 * Created by Jiang Suyang on 2016-11-18.
 */

var express = require('express');
var router = express.Router();

var ap = require('./ap');
var sta = require('./sta');
var action = require('./action');
var sound = require('./sound');

//
///**
// * AP模式
// */
//router.post('/smartpen/AP/login', Log.useLog, ap.login);
//router.post('/smartpen/AP/password/change', Log.useLog, ap.changePassword);
//router.post('/smartpen/AP/config', Log.useLog, ap.setConfig);
//
///**
// * STA模式
// */
////智能笔设备相关代码（查，增，改，删）
//router.post('/smartpen/STA/device/list', Log.useLog, sta.getList);
//router.post('/smartpen/STA/device/create', Log.useLog, sta.create);
//router.post('/smartpen/STA/device/update', Log.useLog, sta.update);
//router.post('/smartpen/STA/device/delete', Log.useLog, sta.delete);
//
////默认动作相关代码（查，增，改，删）
//router.post('/smartpen/STA/action/list', Log.useLog, action.getActionList);
//router.post('/smartpen/STA/action/notbinding/list', Log.useLog, action.getNotBindingActionList);
//router.post('/smartpen/STA/action/create', Log.useLog, action.actionCreate);
//router.post('/smartpen/STA/action/update', Log.useLog, action.actionUpdate);
//router.post('/smartpen/STA/action/delete', Log.useLog, action.actionDelete);
////动作识别相关代码（查，增，改，删）
//router.post('/smartpen/STA/action/binding/list', Log.useLog, action.getList);
//router.post('/smartpen/STA/action/binding/create', Log.useLog, action.create);
//router.post('/smartpen/STA/action/binding/update', Log.useLog, action.update);
//router.post('/smartpen/STA/action/binding/delete', Log.useLog, action.delete);
//
////语音操作关键字识别相关代码（查，增，改，删）
//router.post('/smartpen/STA/sound/keyword/command/list',Log.useLog, sound.getCommandKeywordList);
//router.post('/smartpen/STA/sound/keyword/command/create',Log.useLog, sound.createCommandKeyword);
//router.post('/smartpen/STA/sound/keyword/command/update',Log.useLog, sound.updateCommandKeyword);
//router.post('/smartpen/STA/sound/keyword/command/delete',Log.useLog, sound.deleteCommandKeyword);
//
////语音设备关键字识别相关代码（查，增，改，删）
//router.post('/smartpen/STA/sound/keyword/device/list',Log.useLog, sound.getDeviceKeywordList);
//router.post('/smartpen/STA/sound/keyword/device/create',Log.useLog, sound.createDeviceKeyword);
//router.post('/smartpen/STA/sound/keyword/device/update',Log.useLog, sound.updateDeviceKeyword);
//router.post('/smartpen/STA/sound/keyword/device/delete',Log.useLog, sound.deleteDeviceKeyword);
//
////语音情景模式关键字识别相关代码（查，增，改，删）
//router.post('/smartpen/STA/sound/keyword/scene/list',Log.useLog, sound.getSceneKeywordList);
//router.post('/smartpen/STA/sound/keyword/scene/create',Log.useLog, sound.createSceneKeyword);
//router.post('/smartpen/STA/sound/keyword/scene/update',Log.useLog, sound.updateSceneKeyword);
//router.post('/smartpen/STA/sound/keyword/scene/delete',Log.useLog, sound.deleteSceneKeyword);

module.exports = router;