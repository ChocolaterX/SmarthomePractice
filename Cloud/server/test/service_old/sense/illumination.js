/**
 * Created by pjf on 2017-4-11.
 */
var mongoose = require('../../cloud_db_connect');

var User = mongoose.model('User');
var Sensor = mongoose.model('Sensor');
var Air = mongoose.model('Air');
var Temperature = mongoose.model('Temperature');
var Humidity = mongoose.model('Humidity');
var Illumination = mongoose.model('Illumination');
var Smoke = mongoose.model('Smoke');


var log4j = require('log4js').getLogger();
var validator = require('validator');
var async = require('async');
exports.create = function (sensorId,value) {
    //var userId = req.user.current._id;
    //var type = req.body.type
    //var sensorId = req.body.sensorId;
    //var value = req.body.value;



    var timestamp = Date.now();

    var gatewayTime = new Date(Number(timestamp));

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

    Sensor.findOne({_id: sensorId}, function (err, result) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
        else if (!result) {
            return res.json({
                errorCode: 1303,
                message: '设备不存在'
            });
        }
        else {
            var user = result.user;
            //check if sensor.user equal user
            //if (!userId || !(userId == user)) {
            //    return res.json({
            //        errorCode: 1304,
            //        message: '非当前登录用户'
            //    });
            //}


            //create or update if exist
            var minuInMilli = 60 * 1000;
            var serverTime = new Date(minuInMilli * Math.floor(timestamp / minuInMilli));
            var queryCrite = {
                serverTime: serverTime,

                sensor: sensorId               //对应上传设备
            };
            var insertCrite = {

                sensor: sensorId,               //对应上传设备
                user: user,                     //ref user
                serverTime: serverTime,         //in minute
                gatewayTime: gatewayTime,      //in milliseconds
                value: value
            };

            Illumination.findOneAndUpdate(queryCrite, insertCrite, {upsert: true, new: true}, function (err, illumination) {
                if (err) {
                    log4j.error(err.message);

                    return  '创建光照数据失败1'

                }
                else if (illumination) {
                    console.log('创建光照数据成功');
                    return  '创建光照数据成功'
                }else{
                    log4j.error('创建光照数据失败2');
                    return  '创建光照数据失败2'
                }
            });
        }
    });
};

exports.queryByNow = function (req, res) {
    var userId = req.user.current._id;
    var sensorId = req.body.sensorId;

    var senseTemp = {
        sensor: sensorId,
        //user:userId
    };


    if (!userId) {
        return res.json({
            errorCode: 1305,
            message: '无法取得当前登录用户，请重新登录'
        });
    }

    async.waterfall([


        //查询最新即时数据
        function (callback) {
            Illumination.findOne(senseTemp)
                .sort({serverTime: -1})
                .limit(1)
                .exec(function (err2, senseResult) {
                    if (err2) {
                        return res.json({
                            errorCode: 1300,
                            message: '查询数据失败'
                        });
                    } else if (senseResult) {
                        callback(null, senseResult)
                    } else {
                        callback(1300, '查询数据失败')
                    }

                });
        }
    ], function (err, senseResult) {
        return res.json({
            errorCode: 0,
            message: '查询成功',
            illumination: senseResult,

        });
    });
};

exports.queryByHistory = function (req, res) {


    var userId = req.user.current._id
    var sensorId = req.body.sensorId;
    var startTime = parseInt(req.body.startTime, 10);
    var endTime = parseInt(req.body.endTime, 10);


    //console.log(startTime)
    //console.log(endTime)

    if (!sensorId) {
        return res.json({
            errorCode: 1304,
            message: '设备ID为空'
        });
    }
    if (!startTime || !endTime
        || typeof startTime != 'number' || typeof endTime != 'number'
        || startTime > endTime) {
        return res.json({
            errorCode: 1312,
            message: '时间参数格式不对'
        });
    }

    //create and criteria
    var criteria = {
        'sensor': sensorId,
        'serverTime': {
            '$gte': new Date(startTime),//   >=
            '$lt': new Date(endTime)    //   <
        }
    };

    //create or criteria according to step
    var step = parseInt(req.body.step, 10);
    if (!step || typeof step != 'number' || step <= 0) {
        return res.json({
            errorCode: 1312,
            message: '步长参数格式不对'
        });
    }

    var queryTime = startTime;
    var timeSeries = [];
    for (; queryTime < endTime; queryTime = queryTime + step) {
        timeSeries.push({start: new Date(queryTime), end: new Date(queryTime + step)});
    }





    __dbaggregate(criteria, timeSeries, function (err, results) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
        else {

            return res.json({
                errorCode: 0,
                illumination_array: results
            });
        }
    });
};

function __dbaggregate(criteria, timeSeries, cb) {
    var o = {};
    o.map = function () {
        for (var i = 0; i < timeSeries.length; i++) {
            if (this.serverTime >= timeSeries[i].start && this.serverTime < timeSeries[i].end) {
                return emit(timeSeries[i].start, this.value);
            }
        }

        return emit("other", this.value);
    };
    o.reduce = function (k, vals) {
        var numVals = vals.filter((function (a) {
            return typeof a == 'number'
        }))
            .sort(function (a, b) {
                return a - b
            });

        if (numVals.length < 1) {
            return {count: 0};
        }

        var aggres = {
            'count': numVals.length,
            // 'max': numVals[numVals.length - 1],
            // 'min': numVals[0],
            'avg': (Array.sum(numVals) / numVals.length).toFixed(1)
        };

        return aggres;
    };
    o.finalize = function (k, val) {
        if (!val || typeof val === 'object') {
            return val;
        }
        else {
            return {
                count: 1,
                // max: val,
                // min: val,
                avg: val,

            };
        }
    }
    o.scope = {
        timeSeries: timeSeries
    };
    o.query = criteria;


    //console.log(o)
    Illumination.mapReduce(o, function (err, model, stats) {
        if (err || !model) {
            return cb(new Error('Map Reduce error'));
        }

        console.log(model)
        return cb(null, model);
    });
};