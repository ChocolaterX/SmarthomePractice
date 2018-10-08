/**
 * <copyright file="device.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>11/22/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var Device = mongoose.model('Device');
var User = mongoose.model('User');
var Region = mongoose.model('Region');
//var EntranceSetting = mongoose.model('EntranceSetting');
//var log4j = require('log4js').getLogger();

var validator = require('validator');
var fs = require('fs');
var request = require('request');
//var EasyZip = require('easy-zip').EasyZip;
var async = require('async');
//var path = require('path');

var CommandModule = require('./command.js');      //command自定义模块

//为家庭添加设备
exports.addDevice = function (req, res) {
    var user = req.user.current;
    var mac;
    var name;
    //var regionId;

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.mac) {
        return res.json({
            errorCode: 1700,
            message: '未输入设备MAC地址'
        })
    }
    else {
        mac = validator.trim(req.body.mac);
    }
    if (!req.body.name) {
        return res.json({
            errorCode: 1700,
            message: '未输入设备名称'
        });
    }
    else {
        name = validator.trim(req.body.name)
    }
    //if (!req.body.regionId) {
    //    return res.json({
    //        errorCode: 1700,
    //        message: '区域选择异常'
    //    })
    //}
    //else {
    //    regionId = req.body.regionId
    //}

    var deviceTemp = {};
    deviceTemp['mac'] = mac.toUpperCase();
    //var regionTemp = {};
    //regionTemp['_id'] = regionId;
    var deviceId = '';


    async.waterfall([
        //查询设备是否存在，并查询该设备是否已被占用
        function (callback) {
            Device.findOne(deviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询设备失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '找不到待添加的设备'
                        });
                    }
                    else {
                        //console.log(result);
                        if (result.user == null) {
                            deviceId = result._id;
                            callback();
                        }
                        else if (result.user == user._id) {
                            return res.json({
                                errorCode: 1700,
                                message: '该设备已属于当前用户'
                            });
                        }
                        else {
                            return res.json({
                                errorCode: 1700,
                                message: '该设备已属于其他用户'
                            });
                        }
                    }
                });
        },
        //查看待添加的区域是否存在
        //function (callback) {
        //    Region.findOne(regionTemp)
        //        .exec(function (err, result) {
        //            if (err) {
        //                return res.json({
        //                    errorCode: 1700,
        //                    message: '异常错误：查询区域失败'
        //                });
        //            }
        //            else if (!result) {
        //                return res.json({
        //                    errorCode: 1700,
        //                    message: '找不到待添加的区域'
        //                });
        //            }
        //            else {
        //                callback();
        //            }
        //        });
        //},
        //添加设备
        function (callback) {
            deviceTemp['user'] = user._id;
            deviceTemp['name'] = name;
            //deviceTemp['region'] = regionId;
            deviceTemp['showComponent'] = false;        //此变量用于显示前端组件，值常为false
            Device.update({_id: deviceId}, {$set: deviceTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：用户添加设备失败'
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
            message: '添加设备成功'
        })
    });
};

//更新用户设备的信息
exports.updateDevice = function (req, res) {

    var user = req.user.current;
    var deviceId;
    var name;
    //var regionId;

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.deviceId) {
        return res.json({
            errorCode: 1700,
            message: '未选择待添加的设备'
        });
    }
    else {
        deviceId = req.body.deviceId;
    }
    if (!req.body.name) {
        return res.json({
            errorCode: 1700,
            message: '未输入设备名称'
        });
    }
    else {
        name = validator.trim(req.body.name)
    }
    //if (!req.body.regionId) {
    //    return res.json({
    //        errorCode: 1700,
    //        message: '区域选择异常'
    //    })
    //}
    //else {
    //    regionId = req.body.regionId
    //}

    //if (!name) {
    //    return res.json({
    //        errorCode: 1700,
    //        message: '未输入设备名称'
    //    });
    //}
    //if (!regionId) {
    //    return res.json({
    //        errorCode: 1700,
    //        message: '区域选择异常'
    //    })
    //}

    var deviceTemp = {};
    deviceTemp['_id'] = deviceId;
    deviceTemp['user'] = user;

    async.waterfall([
        //查询设备是否存在
        function (callback) {
            Device.findOne(deviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询设备失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '找不到待更新的设备'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
        //更新设备
        function (callback) {
            deviceTemp['name'] = name;
            //deviceTemp['region'] = regionId;
            Device.update({_id: deviceId}, {$set: deviceTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：更新设备失败'
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
            message: '更新设备成功'
        })
    });
};

//取得家庭设备列表
exports.getDeviceList = function (req, res) {
    var user = req.user.current;

    //var condition = req.body.condition;     //查询条件,1为根据区域查询，2为根据类型查询，默认为2

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    //if (!condition) {
    //    condition = 2;
    //}

    var deviceTemp = {};
    deviceTemp['user'] = user._id;
    var devices = [];       //用户的所有设备

    //if (condition == 1) {
    //    var regions = [];           //用户的区域
    //    var regionDevices = [];     //各区域的设备结果集，与regions索引相同，即regionDevices[0]代表regions[0]区域下的设备集
    //    //var deviceWithNoRegion = [];    //无区域设备
    //
    //    var regionTemp = {};
    //    regionTemp['user'] = user._id;
    //
    //    async.waterfall([
    //        //查询用户家庭设备
    //        function (callback) {
    //            Device.find(deviceTemp)
    //                .sort({createdTime: -1})
    //                .exec(function (err, result) {
    //                    if (err) {
    //                        return res.json({
    //                            errorCode: 1700,
    //                            message: '异常错误：查询用户家庭设备失败'
    //                        });
    //                    }
    //                    else if (!result) {
    //                        return res.json({
    //                            errorCode: 1700,
    //                            message: '当前家庭无设备'
    //                        });
    //                    }
    //                    else {
    //                        devices = result;
    //                        //console.log(devices);
    //                        callback();
    //                    }
    //                });
    //        },
    //        //查询用户的区域
    //        function (callback) {
    //            Region.find(regionTemp)
    //                .sort({createdTime: -1})
    //                .exec(function (err, result) {
    //                    if (err) {
    //                        return res.json({
    //                            errorCode: 1700,
    //                            message: '异常错误：查询用户区域失败'
    //                        });
    //                    }
    //                    else {
    //                        regions = result;
    //                        //console.log('\n\n');
    //                        //console.log(regions);
    //                        callback();
    //                    }
    //                });
    //        },
    //        //将设备置于指定区域中
    //        function (callback) {
    //            var regionDevicesTemp = [];     //临时存储一个区域中的所有设备
    //            var i = 0;
    //            var j = 0;
    //
    //            //找出有区域的设备
    //            for (i = 0; i < regions.length; i++) {
    //                regionDevicesTemp = [];
    //                for (j = 0; j < devices.length; j++) {
    //                    if ((devices[j].region).equals(regions[i]._id)) {
    //                        regionDevicesTemp.push(devices[j]);
    //                    }
    //                    if (j == devices.length - 1) {
    //                        regionDevices.push(regionDevicesTemp);
    //                    }
    //                }
    //            }
    //            callback();
    //        }
    //    ], function (callback) {
    //        return res.json({
    //            errorCode: 0,
    //            regions: regions,
    //            regionDevices: regionDevices
    //        });
    //    });
    //}
    //else if (condition == 2) {
    //var lights = [];
    var gateways = [];
    var curtains = [];
    var sockets = [];
    var switches = [];
    var infrared = [];
    //var airConditioners = [];

    async.waterfall([
        function (callback) {
            Device.find(deviceTemp)
                .sort({createdTime: -1})
                .populate('region')
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询用户设备失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '当前家庭无设备'
                        });
                    }
                    else {
                        devices = result;
                        callback();
                    }
                });
        },
        function (callback) {
            for (var i = 0; i < devices.length; i++) {
                //console.log(devices[i]);
                if (devices[i].type == 0) {
                    gateways.push(devices[i]);
                }
                else if (devices[i].type == 1) {
                    curtains.push(devices[i]);
                }
                else if (devices[i].type == 2) {
                    sockets.push(devices[i]);
                }
                else if (devices[i].type == 3) {
                    switches.push(devices[i]);
                }
                else if (devices[i].type == 5) {
                    infrared.push(devices[i]);
                }
                //else if (devices[i].type == 4) {
                //    airConditioners.push(devices[i]);
                //}
            }
            callback();
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            gateways: gateways,
            curtains: curtains,
            sockets: sockets,
            switches: switches,
            infrareds: infrared
        });
    });
};

//取得设备详情
exports.getDeviceDetail = function (req, res) {
    var user = req.user.current;
    var deviceId;

    if (!req.body.deviceId) {
        return res.json({
            errorCode: 1700,
            message: '未选择待删除的设备'
        });
    }
    else {
        deviceId = validator.trim(req.body.deviceId);
    }

    var deviceTemp = {};
    deviceTemp['_id'] = deviceId;
    deviceTemp['user'] = user._id;

    var device = {};

    async.waterfall([
        //查询设备是否存在
        function (callback) {
            Device.findOne(deviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询设备异常'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '找不到待查看的设备'
                        });

                    }
                    else {
                        device = result;
                        callback();
                    }
                });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '查看设备成功',
            device: device
        });
    });


};

//删除家庭中的设备
exports.deleteDevice = function (req, res) {
    var user = req.user.current;
    var deviceId;

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.deviceId) {
        return res.json({
            errorCode: 1700,
            message: '未选择待删除的设备'
        });
    }
    else {
        deviceId = validator.trim(req.body.deviceId);
    }

    var deviceTemp = {};
    deviceTemp['_id'] = deviceId;
    deviceTemp['user'] = user._id;

    async.waterfall([
        //查询设备是否存在
        function (callback) {
            Device.findOne(deviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询设备异常'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '找不到待删除的设备'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
        //删除设备表中的设备名称（置为空）
        function (callback) {
            deviceTemp['region'] = null;
            deviceTemp['name'] = null;
            deviceTemp['user'] = null;
            Device.update({_id: deviceId}, {$set: deviceTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：删除设备名称失败'
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
            message: '删除设备成功'
        });
    });
};

