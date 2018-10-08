/**
 * Created by Administrator on 2017-3-30.
 */
var mongoose = require('../../cloud_db_connect');

var User = mongoose.model('User');
var Sensor = mongoose.model('Sensor');
var SenseSetting = mongoose.model('SenseSetting');
var Temperature = mongoose.model('Temperature');
var Humidity = mongoose.model('Humidity');
var Illumination = mongoose.model('Illumination');
var Air = mongoose.model('Air');
var Smoke = mongoose.model('Smoke');

var schedule = require('node-schedule');
var agenda = require('../../../lib/schedule');
var log4j = require('log4js').getLogger();
var validator = require('validator');
var async = require('async');

//设定感知数据监测报警

exports.send = function (req, res) {
    agenda.start()
    var userId = req.user.current._id;
    var sensorId = req.body.sensorId;                  //传感器ID
    var type = req.body.type;                       //传感器类型
    var value = req.body.value;                     //报警值
    var condition = req.body.condition;         //true代表大于，false代表小于
    var sendStartTime = req.body.sendStartTime;              //允许推送时间段--开始时间
    var sendEndTime = req.body.sendEndTime;               //允许推送时间段--结束时间
    var send = req.body.send;     //是否推送


    if (!userId) {
        return res.json({
            errorCode: 1305,
            message: '无法取得当前登录用户，请重新登录'
        });
    }

    if (!sensorId) {
        return res.json({
            errorCode: 1300,
            message: '对应感应器ID为空'
        });
    }

    if (!type) {
        return res.json({
            errorCode: 1300,
            message: '传感器类型为空'
        });
    }

    if (!value) {
        return res.json({
            errorCode: 1300,
            message: '报警值为空'
        });
    }

    if (condition == null) {
        return res.json({
            errorCode: 1300,
            message: '未选择运算符'
        });
    }
    if (send == null) {
        return res.json({
            errorCode: 1300,
            message: '未选择是否推送'
        });
    }

    if (!sendStartTime || !sendEndTime) {
        return res.json({
            errorCode: 1300,
            message: '未设置开始或结束时间'
        });
    }
    if (sendStartTime >= sendEndTime) {
        return res.json({
            errorCode: 1300,
            message: '开始时间不得大于等于结束时间'
        });

    }

    var criteriaFind = {               //同一用户同一个感应器报警设置一个高于，一个低于。。不能出现两个高于/低于的情况

        user: userId,
        sensor: sensorId,
        condition: condition
    }


    var criteria = {
        user: userId,
        type: type,
        sensor: sensorId,
        value: value,
        condition: condition,  //true代表大于，false代表小于
        send: send,
        sendStartTime: sendStartTime,
        sendEndTime: sendEndTime

    };

    async.waterfall([
        //验证type
        function (callback) {
            Sensor.findOne({_id: sensorId})
                .exec(function (err, sensor) {
                    if (err) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else if (sensor) {
                        if (sensor.type = type) {
                            callback()
                        } else {
                            return res.json({
                                errorCode: 1700,
                                message: '设备类型与数据库记录不符'
                            });
                        }

                    }
                    else {
                        return res.json({
                            errorCode: 1700,
                            message: '该设备不存在'
                        });
                    }
                })
        },
        //同一用户同一个感应器报警设置一个高于，一个低于。。不能出现两个高于/低于的情况
        function (callback) {
            SenseSetting.findOne(criteriaFind)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 1700,
                            message: '该设备已设置对应报警'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        //添加
        function (callback) {


            SenseSetting.create(criteria, function (err, result_in) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                else if (result_in) {
                    callback();

                } else {
                    return res.json({
                        errorCode: 1500,
                        message: '添加感应器报警设置失败'
                    })
                }
            })
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '添加感应器报警设置成功'
        })
    });


}


exports.update = function (req, res) {
    var userId = req.user.current._id;
    var senseSettingId = req.body.senseSettingId;         //报警关联ID
    var value = req.body.value;                           //报警值
    //var sendStartTime = req.body.sendStartTime;           //允许推送时间段--开始时间
    //var sendEndTime = req.body.sendEndTime;               //允许推送时间段--结束时间
    var send = req.body.send;                             //是否推送
    var criteria = {};


    if (!userId) {
        return res.json({
            errorCode: 1305,
            message: '无法取得当前登录用户，请重新登录'
        });
    }

    if (!senseSettingId) {
        return res.json({
            errorCode: 1300,
            message: '感应器报警设置ID为空'
        });
    }


    if (value) {
        criteria['value'] = value
    }
    if (send != undefined || send != null) {
        criteria['send'] = send
    }
    //if (sendStartTime || sendEndTime) {
    //    if (sendStartTime >= sendEndTime) {
    //        return res.json({
    //            errorCode: 1300,
    //            message: '开始时间不得大于等于结束时间'
    //        });
    //
    //    } else {
    //        criteria['sendStartTime'] = sendStartTime
    //        criteria['sendEndTime'] = sendEndTime
    //    }
    //
    //}


    async.waterfall([


        //更新
        function (callback) {

            SenseSetting.findOneAndUpdate({_id: senseSettingId}, criteria, function (err, result_in) {
                if (err) {
                    return res.json({
                        errorCode: 1300,
                        message: '该报警设置不存在'
                    });
                } else if(result_in){
                    callback()

                }else{
                    return res.json({
                        errorCode: 1500,
                        message: '更新感应器报警设置失败'
                    })
                }

            })
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            senseSettingId: senseSettingId,
            message: '更新感应器报警设置成功'
        })
    });


}

exports.list = function (req, res) {
    var userId = req.user.current._id;
    var sensorId = req.body.sensorId;                  //传感器ID
    var type = req.body.type;                       //传感器类型

    if (!userId) {
        return res.json({
            errorCode: 1305,
            message: '无法取得当前登录用户，请重新登录'
        });
    }

    var criteria = {
        user: userId
    }

    if (type) {
        criteria['type'] = type
    }

    if (sensorId) {
        criteria['sensor'] = sensorId
    }

    SenseSetting.find(criteria)
        .sort({updatedTime: -1})
        .populate('sensor')
        .exec(function (err, result) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            } else if (!result) {
                return res.json({
                    errorCode: 1300,
                    message: "未找到对应的推送设置"
                });
            } else {
                return res.json({
                    errorCode: 0,
                    list: result
                });
            }
        })
}