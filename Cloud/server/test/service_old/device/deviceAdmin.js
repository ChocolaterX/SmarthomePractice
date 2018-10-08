var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var Device = mongoose.model('Device');
var Gateway = mongoose.model('Gateway');
var UserDevice = mongoose.model('UserDevice');
var User = mongoose.model('User');
var Admin = mongoose.model('Admin');
var log4j = require('log4js').getLogger();

var validator = require('validator');
//var qr = require('qr-image');
var fs = require('fs');
var word = require('png-word');
var images = require("images");

var request = require('request');
var EasyZip = require('easy-zip').EasyZip;
var async = require('async');
var path = require('path');

//添加一个新设备到数据库
exports.createDevice = function (req, res) {
    var mac = validator.trim(req.body.mac);
    var type = req.body.type;

    if (!mac) {
        return res.json({
            errorCode: 1700,
            message: '未输入设备MAC地址'
        });
    }
    if (!type) {
        return res.json({
            errorCode: 1700,
            message: '未选择设备类型'
        });
    }
    if (!((typeof type == 'number') && (type > 0) && (type < 10))) {
        return res.json({
            errorCode: 1700,
            message: '设备类型有误'
        });
    }

    var deviceTemp = {};
    deviceTemp['mac'] = mac;
    //deviceTemp['type'] = type;

    async.waterfall([
        //查询是否已存在（MAC地址必须唯一）
        function (callback) {
            Device.findOne(deviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询设备失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 1700,
                            message: '待添加的设备已存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        //添加
        function (callback) {
            deviceTemp['type'] = type;
            var deviceSave = new Device(deviceTemp);
            deviceSave.save(function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '添加设备失败'
                    });
                }
                else {
                    callback();
                }
            })
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '添加设备成功'
        })
    });
};

//更新设备信息
//暂时不需做
exports.updateDevice = function (req, res) {

};

//查看数据库中的设备列表
exports.getDeviceList = function (req, res) {
    var pageIndex = req.body.pageIndex;
    var pageSize = req.body.pageSize;

    if (!pageIndex) {
        pageIndex = 0;
    }
    if (!pageSize) {
        pageSize = 10;
    }
    if (!(pageIndex >= 0 && pageSize > 0)) {
        return res.json({
            errorCode: 1700,
            message: '查询分页信息有误'
        });
    }

    var deviceTemp = {};
    var amount = 0;     //总数
    var devices = [];

    async.waterfall([
        //统计共有多少个设备
        function (callback) {
            Device.count(deviceTemp, function (err, result) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：查询网关列表失败'
                    })
                }
                else {
                    amount = result;
                    callback();
                }
            });
        },
        //查询设备
        function (callback) {
            Device.find(deviceTemp)
                .sort({createdTime: -1})
                .skip(pageIndex * pageSize)
                .limit(pageSize)
                //.populate('user')
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询网关列表失败'
                        })
                    }
                    else {
                        devices = result;
                        callback();
                    }
                });
        },
        function (callback) {
            callback();
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            amount: amount,
            devices: devices
        });
    });

};

//删除设备
exports.deleteDevice = function (req, res) {
    var deviceId = req.body.deviceId;

    if (!deviceId) {
        return res.json({
            errorCode: 1700,
            message: '未选择设备ID'
        });
    }

    var deviceTemp = {};
    deviceTemp['_id'] = deviceId;

    async.waterfall([
        //查询待删除设备是否存在
        function (callback) {
            Device.findOne(deviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1600,
                            message: '异常错误：查询待删除设备是否存在失败'
                        })
                    }
                    else if (result) {
                        callback();
                    } else {
                        return res.json({
                            errorCode: 1600,
                            message: '未找到待删除的设备'
                        })
                    }
                });
        },
        //删除
        function (callback) {
            Device.remove({_id: deviceId}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1600,
                        message: '异常错误：删除设备失败'
                    })
                }
                else {
                    callback();
                }
            });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '删除设备成功'
        })
    })
};

