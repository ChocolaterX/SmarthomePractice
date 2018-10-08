var express = require('express');
var router = express.Router();
var scene = require('./scene');
var run = require('./run');


router.post('/scene/create', scene.createScene);
router.post('/scene/update/', scene.updateScene);
router.post('/scene/list/get', scene.getSceneList);
router.post('/scene/detail/get', scene.getSceneDetail);
router.post('/scene/delete/', scene.deleteScene);

//手动执行与自动执行
router.post('/scene/run', scene.runScene);
router.post('/scene/autorun/set', scene.setSceneAutorun);

//router. get('/scene/info/:sceneId', Log.useLog,scene.current);
//router. post('/scene/list', Log.useLog,scene.getSceneList);
//router. post('/scene/auto/cancel/:sceneId', Log.useLog,scene.cancelAuto);
//router. post('/scene/auto/recover/:sceneId', Log.useLog,scene.recoverAuto);
//router. get('/scene/run/:sceneId', Log.useLog,scene.run);
//router. post('/scene/get', Log.useLog,scene.getScene);
//router. get('/scene/default',Log.useLog,scene.default);

module.exports = router;