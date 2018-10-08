/**
 * Created by pjf on 2017-4-17.
 */
var mongoose = require('../../cloud_db_connect');

var User = mongoose.model('User');
var UserDevice = mongoose.model('UserDevice');
var Entrance = mongoose.model('Entrance');


var log4j = require('log4js').getLogger();
var validator = require('validator');
var async = require('async');


exports.createTest = function (req,res) {
    var type = req.body.type;
    var deviceId = req.body.deviceId;
    var state = req.body.state;


    //if (!type) {
    //    return res.json({
    //        errorCode: 1300,
    //        message:'对应类型为空'
    //    });
    //
    //}
    if (!deviceId) {
        return res.json({
            errorCode: 1300,
            message:'对应设备ID为空'
        });
    }
    if (!state) {
        return res.json({
            errorCode: 1300,
            message:'对应数据为空'
        });

    }

    UserDevice.findOne({device:deviceId}, function (err, result) {
        if (err) {
            return res.json({
                errorCode: 500,
                message:err.message
            });
        }
        else if (!result) {
            return res.json({
                errorCode: 1500,
                message:'设备关联不存在'
            });

        }
        else {
            var user = result.user;

            var criteria = {
                type:type,
                device: deviceId,
                user: user,
                createdTime: new Date(),

                state: state
            }


            console.log(criteria)
            Entrance.create(criteria, function (err, doc) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message:err.message
                    });

                }
                else if (doc) {
                    return res.json({
                        errorCode: 0,
                        message:'创建门磁数据成功'
                    });


                }
            })
        }
    });


}




exports.localCreate = function (para,cb) {

        var type = para.type;
        var deviceId = para.deviceId;
        var value = para.value;
        var timestamp = Date.now();
        if (!timestamp) {
            return res.json({
                errorCode: 1303,
                message: '时间标示为空'
            });
        }
        var gatewayTime = new Date(Number(timestamp));
        //if (!type) {
        //    return cb(null, '对应类型为空')
        //}
        if (!deviceId) {
            return cb(null, '对应上传设备为空')
        }
        if (!value) {
            return cb(null, '对应数据为空')
        }

    UserDevice.findOne({device:deviceId}, function (err, result) {
            if (err) {
                return cb(err);
            }
            else if (!result) {
                return cb(null, '设备关联不存在')
            }
            else {
                var user = result.user;
                var _value = {
                    state: value
                }
                var criteria = {
                    type:type,
                    device: deviceId,
                    user: user,
                    serverTime: new Date(),
                    gatewayTime: gatewayTime,
                    value: _value
                }
                Entrance.create(criteria, function (err, doc) {
                    if (err) {
                        return cb(null, '创建门磁数据失败')
                    }
                    else if (doc) {


                        return cb(null, '创建门磁数据成功')


                    }
                })
            }
        });
    };


exports.queryDoor = function (req, res) {
    var userId  = req.user.current._id;
    var deviceId = req.body.deviceId;
    var type = req.body.type;
    var startTime = parseInt(req.body.startTime, 10);
    var endTime = parseInt(req.body.endTime, 10);

    var pageIndex = validator.toInt(req.body.pageIndex) >= 0 ? validator.toInt(req.body.pageIndex) : 0;
    var pageSize = validator.toInt(req.body.pageSize) >= 0 ? validator.toInt(req.body.pageSize) : 10;

    if (!deviceId) {
        return res.json({
            errorCode: 1300,
            message:'对应设备ID为空'
        });
    }

    if (type==null) {
        return res.json({
            errorCode: 1300,
            message:'对应设备状态为空'
        });
    }

    if (!startTime||!endTime) {
        return res.json({
            errorCode: 1300,
            message:'未选择开始或结束时间'
        });
    }

    if (startTime>=endTime) {
        return res.json({
            errorCode: 1300,
            message:'开始时间不得大于等于结束时间'
        });
    }


    var criteria = {
        type:type,
        device: deviceId,
        createdTime: {
            '$gte': new Date(startTime),//   >=
            '$lt': new Date(endTime)    //   <
        }
    };




    Entrance.find(criteria)
        .sort({serverTime: -1})
        .skip(pageIndex * pageSize)
       // .limit(pageSize)
        .populate('device')
        .exec(function (err, doors) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            }
            //else if (doors.length==0) {
            //    return res.json({
            //        errorCode: 0,
            //        count: doors.length,
            //        doors: []
            //    });
            //}
            else{
                return res.json({
                    errorCode: 0,
                    count: doors.length,
                    entrances: doors
                });
            }

    })




}