/**
 * <copyright file="securityDeviceAdmin.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>2/22/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var User = mongoose.model('User');
var SecurityDevice = mongoose.model('SecurityDevice');

var validator = require('validator');
var fs = require('fs');
var request = require('request');
var async = require('async');
var path = require('path');

//添加一个新的安防安防设备到数据库
exports.createSecurityDevice = function (req, res) {
    var mac = validator.trim(req.body.mac);
    var type = req.body.type;

    if (!mac) {
        return res.json({
            errorCode: 1900,
            message: '未输入安防设备MAC地址'
        });
    }
    if ((type != 0) && (!type)) {
        return res.json({
            errorCode: 1900,
            message: '未选择安防设备类型'
        });
    }
    if (!((typeof type == 'number') && (type > 0) && (type < 5))) {
        return res.json({
            errorCode: 1900,
            message: '安防设备类型有误'
        });
    }

    var securityDeviceTemp = {};
    securityDeviceTemp['mac'] = mac.toLowerCase();

    async.waterfall([
        //查询是否已存在（MAC地址必须唯一）
        function (callback) {
            SecurityDevice.findOne(securityDeviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1900,
                            message: '异常错误：查询安防设备失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 1900,
                            message: '待添加的安防设备已存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        //添加
        function (callback) {
            securityDeviceTemp['type'] = type;
            var deviceSave = new SecurityDevice(securityDeviceTemp);
            deviceSave.save(function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1900,
                        message: '添加安防设备失败'
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
            message: '添加安防设备成功'
        })
    });
};

//查看数据库中的安防设备列表
exports.getSecurityDeviceList = function (req, res) {
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
            errorCode: 1900,
            message: '查询分页信息有误'
        });
    }

    var securityDeviceTemp = {};
    var amount = 0;     //总数
    var securityDevices = [];

    async.waterfall([
        //统计共有多少个安防设备
        function (callback) {
            SecurityDevice.count(securityDeviceTemp, function (err, result) {
                if (err) {
                    return res.json({
                        errorCode: 1900,
                        message: '异常错误：查询安防设备列表失败'
                    })
                }
                else {
                    amount = result;
                    callback();
                }
            });
        },
        //查询安防设备
        function (callback) {
            SecurityDevice.find(securityDeviceTemp)
                .sort({createdTime: -1})
                .skip(pageIndex * pageSize)
                .limit(pageSize)
                //.populate('user')
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1900,
                            message: '异常错误：查询安防设备列表失败'
                        })
                    }
                    else {
                        securityDevices = result;
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
            securityDevices: securityDevices
        });
    });

};

//删除安防设备
exports.deleteDevice = function (req, res) {
    var deviceId = req.body.deviceId;

    if (!deviceId) {
        return res.json({
            errorCode: 1900,
            message: '未选择安防设备ID'
        });
    }

    var securityDeviceTemp = {};
    securityDeviceTemp['_id'] = deviceId;

    async.waterfall([
        //查询待删除安防设备是否存在
        function (callback) {
            SecurityDevice.findOne(securityDeviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1600,
                            message: '异常错误：查询待删除安防设备是否存在失败'
                        })
                    }
                    else if (result) {
                        callback();
                    } else {
                        return res.json({
                            errorCode: 1600,
                            message: '未找到待删除的安防设备'
                        })
                    }
                });
        },
        //删除
        function (callback) {
            SecurityDevice.remove({_id: deviceId}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1600,
                        message: '异常错误：删除安防设备失败'
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
            message: '删除安防设备成功'
        })
    })
};

