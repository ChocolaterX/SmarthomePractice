/**
 * <copyright file="securitySecurityDevice.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>2/23/2018</date>
 * <summary>
 *  安防设备相关的操作，供用户调用。
 *  其中的方法待重构。
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
//var User = mongoose.model('User');
//var Region = mongoose.model('Region');
var Device = mongoose.model('Device');
var SecurityDevice = mongoose.model('SecurityDevice');
var SecurityLog = mongoose.model('SecurityLog');
var CommandModule = require('../device/command');

var validator = require('validator');
var fs = require('fs');
var request = require('request');
var async = require('async');

//为家庭添加安防设备
exports.addSecurityDevice = function (req, res) {
    var user = req.user.current;
    var mac = validator.trim(req.body.mac);
    var name = validator.trim(req.body.name);
    //var regionId = req.body.regionId;

    if (!user) {
        return res.json({
            errorCode: 1900,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!mac) {
        return res.json({
            errorCode: 1900,
            message: '未输入安防设备MAC地址'
        })
    }
    if (!name) {
        return res.json({
            errorCode: 1900,
            message: '未输入安防设备名称'
        });
    }

    var securityDeviceTemp = {};
    securityDeviceTemp['mac'] = mac.toLowerCase();
    var securityDeviceId = '';

    async.waterfall([
        //查询安防设备是否存在，并查询该安防设备是否已被占用
        function (callback) {
            SecurityDevice.findOne(securityDeviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1900,
                            message: '异常错误：查询安防设备失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1900,
                            message: '找不到待添加的安防设备'
                        });
                    }
                    else {
                        if (result.user == null) {
                            securityDeviceId = result._id;
                            callback();
                        }
                        else if (result.user == user._id) {
                            return res.json({
                                errorCode: 1900,
                                message: '该安防设备已属于当前用户'
                            });
                        }
                        else {
                            return res.json({
                                errorCode: 1900,
                                message: '该安防设备已属于其他用户'
                            });
                        }
                    }
                });
        },
        //添加安防设备
        function (callback) {
            securityDeviceTemp['user'] = user._id;
            securityDeviceTemp['name'] = name;
            SecurityDevice.update({_id: securityDeviceId}, {$set: securityDeviceTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1900,
                        message: '异常错误：用户添加安防设备失败'
                    });
                }
                else {
                    callback();
                }
            });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '添加安防设备成功'
        })
    });
};

//更新用户安防设备的信息
exports.updateSecurityDevice = function (req, res) {

    var user = req.user.current;
    var securityDeviceId = req.body.securityDeviceId;
    var name = validator.trim(req.body.name);
    //var regionId = req.body.regionId;

    if (!user) {
        return res.json({
            errorCode: 1900,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!securityDeviceId) {
        return res.json({
            errorCode: 1900,
            message: '未选择待更新的安防设备'
        });
    }
    if (!name) {
        return res.json({
            errorCode: 1900,
            message: '未输入安防设备名称'
        });
    }

    var securityDeviceTemp = {};
    securityDeviceTemp['_id'] = securityDeviceId;
    securityDeviceTemp['user'] = user;

    async.waterfall([
        //查询安防设备是否存在
        function (callback) {
            SecurityDevice.findOne(securityDeviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1900,
                            message: '异常错误：查询安防设备失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1900,
                            message: '找不到待更新的安防设备'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
        //更新安防设备
        function (callback) {
            securityDeviceTemp['name'] = name;
            SecurityDevice.update({_id: securityDeviceId}, {$set: securityDeviceTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1900,
                        message: '异常错误：更新安防设备失败'
                    });
                }
                else {
                    callback();
                }
            });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '更新安防设备成功'
        })
    });
};

//取得家庭安防设备列表
exports.getSecurityDeviceList = function (req, res) {
    var user = req.user.current;

    if (!user) {
        return res.json({
            errorCode: 1900,
            message: '异常错误：无法取得当前用户信息'
        });
    }

    var securityDeviceTemp = {};
    securityDeviceTemp['user'] = user._id;

    var securityDevices = [];
    var doorInductions = [];
    var infraredInductions = [];
    var locks = [];
    var cameras = [];

    async.waterfall([
        function (callback) {
            SecurityDevice.find(securityDeviceTemp)
                .sort({createdTime: -1})
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1900,
                            message: '异常错误：查询用户安防设备失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1900,
                            message: '当前家庭无安防设备'
                        });
                    }
                    else {
                        securityDevices = result;
                        callback();
                    }
                });
        },
        function (callback) {
            for (var i = 0; i < securityDevices.length; i++) {
                if (securityDevices[i].type == 1) {
                    doorInductions.push(securityDevices[i]);
                }
                else if (securityDevices[i].type == 2) {
                    infraredInductions.push(securityDevices[i]);
                }
                else if (securityDevices[i].type == 3) {
                    locks.push(securityDevices[i]);
                }
                else if (securityDevices[i].type == 4) {
                    cameras.push(securityDevices[i]);
                }
            }
            callback();
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            doorInductions: doorInductions,
            infraredInductions: infraredInductions,
            locks: locks,
            cameras: cameras
        });
    });
};

//删除家庭中的安防设备
exports.deleteSecurityDevice = function (req, res) {
    var user = req.user.current;
    var securityDeviceId = req.body.securityDeviceId;

    if (!user) {
        return res.json({
            errorCode: 1900,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!securityDeviceId) {
        return res.json({
            errorCode: 1900,
            message: '未选择待删除的安防设备'
        });
    }

    var securityDeviceTemp = {};
    securityDeviceTemp['_id'] = securityDeviceId;
    securityDeviceTemp['user'] = user._id;

    async.waterfall([
        //查询安防设备是否存在
        function (callback) {
            SecurityDevice.findOne(securityDeviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1900,
                            message: '异常错误：查询安防设备异常'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1900,
                            message: '找不到待删除的安防设备'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
        //删除安防设备表中的安防设备名称（置为空）
        function (callback) {
            securityDeviceTemp['name'] = null;
            securityDeviceTemp['user'] = null;
            SecurityDevice.update({_id: securityDeviceId}, {$set: securityDeviceTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1900,
                        message: '异常错误：删除安防设备名称失败'
                    });
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
        });
    });
};

//取得安防记录列表
exports.getSecurityLogList = function (req, res) {
    var user = req.user.current;
    //var securityDeviceMac;
    var securityDeviceId;
    var pageIndex;
    var pageSize;

    if (!user) {
        return res.json({
            errorCode: 1900,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.pageSize) {
        pageSize = 10;
    }
    else {
        pageSize = req.body.pageSize;
    }
    if (!req.body.pageIndex) {
        pageIndex = 0;
    }
    else {
        pageIndex = req.body.pageIndex;
    }

    var securityLogTemp = {};
    var securityLogs = [];

    securityLogTemp['user'] = user._id;
    if (req.body.securityDeviceId) {
        securityLogTemp['securityDevice'] = req.body.securityDeviceId;
    }

    async.waterfall([
        function (callback) {
            SecurityLog.find(securityLogTemp)
                .populate('securityDevice')
                .limit(pageSize)
                .skip(pageSize * pageIndex)
                .sort({createdTime: -1})
                .exec(function (err, result) {      //倒序
                    if (err) {
                        return res.json({
                            errorCode: 1900,
                            message: '查询安防记录异常'
                        });
                    }
                    else {
                        securityLogs = result;
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
            message: '查询安防记录成功',
            securityLogs: securityLogs
        });
    });
};

//门锁控制
exports.lockCommand = function (req, res) {
    var user = req.user.current;
    var securityDeviceId;
    var command;

    if (!user) {
        return res.json({
            errorCode: 1900,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.securityDeviceId) {
        return res.json({
            errorCode: 1900,
            message: '未选择待控制的安防设备'
        });
    }
    else {
        securityDeviceId = req.body.securityDeviceId;
    }
    if (!req.body.command) {
        return res.json({
            errorCode: 1900,
            message: '未选择操作'
        });
    }
    else {
        command = req.body.command;
    }

    var securityDeviceTemp = {};
    var deviceTemp = {};
    securityDeviceTemp['_id'] = securityDeviceId;
    securityDeviceTemp['user'] = user._id;

    console.log(securityDeviceTemp._id);
    console.log(securityDeviceTemp.user);
    deviceTemp['user'] = user._id;
    deviceTemp['type'] = 0;

    var securityDevice;
    var gateways = [];

    async.waterfall([
        //查找MAC地址
        function (callback) {
            SecurityDevice.findOne(securityDeviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1900,
                            message: '异常错误：查询安防设备异常'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1900,
                            message: '未找到待控制的门锁'
                        });
                    }
                    else {
                        securityDevice = result;
                        callback();
                    }
                });
        },
        //查找网关
        function (callback) {
            Device.find(deviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1900,
                            message: '异常错误：查询网关异常'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1900,
                            message: '未找到用户的网关'
                        });
                    }
                    else {
                        gateways = result;
                        callback();
                    }
                });
        },
        //分解指令
        function (callback) {
            //executeDeviceCommand(device, gateways, command)
            CommandModule.executeDeviceCommand(securityDevice, gateways, command);
            callback();
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '控制门锁成功',
        });
    });


};

