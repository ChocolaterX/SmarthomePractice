/**
 * Created by pjf on 2017-4-11.
 */

var temperature = require('./temperature');
var air = require('./air');
var humidity = require('./humidity');
var illumination = require('./illumination');
var smoke = require('./smoke');
var sensor = require('./sensor');

var log4j = require('log4js').getLogger();
var validator = require('validator');
var async = require('async');

//感应器数据的创建



exports.create = function (sensorId, value,type) {
//exports.create = function (req, res) {
//    var sensorId=req.body.sensorId;
//    var value=req.body.value;
//    var type=req.body.type;

    if (!sensorId) {
        return res.json({
            errorCode: 1301,
            message: '对应上传设备为空'
        });
    }
    if (!value) {
        return res.json({
            errorCode: 1302,
            message: '对应数据为空'
        });
    }
    if (!type) {
        return res.json({
            errorCode: 1306,
            message: '对应数据类型为空'
        });
    }





    switch (type){
        case 'air':
            air.create(sensorId,value);
            break;
        case 'temperature':
            temperature.create(sensorId,value);
            break;
        case 'humidity':
            humidity.create(sensorId,value);
            break;
        case 'illumination':
            illumination.create(sensorId,value);
            break;
        case 'smoke':
            smoke.create(sensorId,value);
            break;
        default :

            log4j.error('对应数据类型错误');
            return  '对应数据类型错误';
            break;


    }






}



    exports.localCreate = function (para, cb) {
        var type = para.type;
        var sensorId = para.sensorId;
        var value = para.value;
        //var timestamp = Date.now();
        //var work_type = para.work_type;
        //var work_type_value = para.work_type_value;

    if (!sensorId) {
        return cb(null, '对应上传设备为空')

    }
    if (!value) {
        return cb(null, '对应数据为空')

    }
    if (!type) {
        return cb(null, '对应类型为空')
    }





    switch (type){
        case 'air':
            air.create(sensorId,value);
            break;
        case 'temperature':
            temperature.create(sensorId,value);
            break;
        case 'humidity':
            humidity.create(sensorId,value);
            break;
        case 'illumination':
            illumination.create(sensorId,value);
            break;
        case 'smoke':
            smoke.create(sensorId,value);
            break;
        default :
            return cb(null, '对应数据类型错误');

            break;


    }






}






