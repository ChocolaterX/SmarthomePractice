/**
 * Created by leizhang on 2015/5/21.
 */

var express = require('express');
var router = express.Router();
var temperature = require('./temperature');
var air = require('./air');
var humidity = require('./humidity');
var illumination = require('./illumination');
var smoke = require('./smoke');
var sensor = require('./sensor');
var sense = require('./sense');
var senseSetting = require('./senseSetting');
//自动插温度数据
var test = require('./test');

//sensor
/*** 管理员方法*/

router.post('/sensor/admin/create',sensor.createSensor);
router.post('/sensor/admin/update',sensor.updateSensor);
router.post('/sensor/admin/list',sensor.getSensorList);
router.post('/sensor/admin/delete',sensor.deleteSensor);

/*** 用户方法*/
router.post('/sensor/user/create',sensor.create);
router.post('/sensor/user/update',sensor.update);
router.post('/sensor/user/list',sensor.getList);
router.post('/sensor/user/delete',sensor.delete);

//sense
//router.post('/sense/localCreate',sense.localCreate);

//senseSetting
router.post('/senseSetting/send',senseSetting.send);
router.post('/senseSetting/update',senseSetting.update);
router.post('/senseSetting/list',senseSetting.list);

//temperature
router.post('/sense/create/temperature',temperature.create);
router.post('/sense/query/now/temperature',temperature.queryByNow);
router.post('/sense/query/history/temperature',temperature.queryByHistory);
//
//air
router.post('/sense/create/air',air.create);
router.post('/sense/query/now/air',air.queryByNow);
router.post('/sense/query/history/air',air.queryByHistory);
//
////humidity
router.post('/sense/create/humidity',humidity.create);
router.post('/sense/query/now/humidity',humidity.queryByNow);
router.post('/sense/query/history/humidity',humidity.queryByHistory);
//
////illumination
router.post('/sense/create/illumination',illumination.create);
router.post('/sense/query/now/illumination',illumination.queryByNow);
router.post('/sense/query/history/illumination',illumination.queryByHistory);
//
////smoke
router.post('/sense/create/smoke',smoke.create);
router.post('/sense/query/now/smoke',smoke.queryByNow);
router.post('/sense/query/history/smoke',smoke.queryByHistory);



module.exports = router;