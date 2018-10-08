var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var Gateway = mongoose.model('Gateway');
var Device = mongoose.model('Device');
var UserDevice = mongoose.model('UserDevice');
var User = mongoose.model('User');
var Region = mongoose.model('Region');
var EntranceSetting = mongoose.model('EntranceSetting');
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

//为家庭添加设备
//假如保存的步骤分为两步，执行到第二步时出错，如何处理。即数据库操作中的事务
exports.addDevice = function (req, res) {
    var user = req.user.current;
    var gatewayId = req.body.gatewayId;
    var deviceId = req.body.deviceId;
    var name = validator.trim(req.body.name);
    var regionId = req.body.regionId;

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!gatewayId) {
        return res.json({
            errorCode: 1700,
            message: '未选择待绑定的网关'
        });
    }
    if (!deviceId) {
        return res.json({
            errorCode: 1700,
            message: '未选择待添加的设备'
        });
    }
    if (!name) {
        return res.json({
            errorCode: 1700,
            message: '未输入设备名称'
        });
    }

    var gatewayTemp = {};
    var deviceTemp = {};
    var userDeviceTemp = {};
    //var entranceSettingTemp = {};
    gatewayTemp['_id'] = gatewayId;
    deviceTemp['_id'] = deviceId;
    userDeviceTemp['device'] = deviceId;

    var deviceType = 0;         //当前待添加的设备是什么类型

    async.waterfall([
        //查询网关是否存在
        function (callback) {
            Gateway.findOne(gatewayTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询网关失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '找不到待绑定的网关'
                        });
                    }
                    else if (result.user != user._id) {
                        return res.json({
                            errorCode: 1700,
                            message: '待添加的网关不属于当前用户'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
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
                            message: '找不到待添加的设备'
                        });
                    }
                    else {
                        deviceType = result.type;
                        callback();
                    }
                });
        },
        //查询待添加的设备是否已经被占用
        function (callback) {
            UserDevice.findOne(userDeviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询用户设备表失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 1700,
                            message: '该设备已被占用'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
        //添加到用户设备关联表中(此操作与下一个操作应组合为一个数据库事务)
        function (callback) {
            if (regionId) {
                userDeviceTemp['region'] = regionId;
            }
            userDeviceTemp['gateway'] = gatewayId;
            userDeviceTemp['user'] = user._id;
            var userDeviceSave = new UserDevice(userDeviceTemp);
            userDeviceSave.save(function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：添加到用户设备表失败'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //将原表中设备的名称进行修改
        function (callback) {
            deviceTemp['name'] = name;
            Device.update({_id: deviceId}, {$set: deviceTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：更新设备表设备名称失败'
                    });
                }
                else {
                    callback();
                }
            });
        }
        //如当前设备是门磁，则进行初始化
        //function (callback) {
        //    if (deviceType == 6) {
        //        entranceSettingTemp['user'] = user._id;
        //        entranceSettingTemp['device'] = deviceId;
        //        entranceSettingTemp['send'] = false;
        //        var entranceSettingSave = new EntranceSetting(entranceSettingTemp);
        //        entranceSettingSave.save(function (err) {
        //            if (err) {
        //                return res.json({
        //                    errorCode: 1700,
        //                    message: '初始化用户门磁设置失败'
        //                });
        //            }
        //            else {
        //                callback();
        //            }
        //        });
        //    }
        //    else {
        //        callback();
        //    }
        //}
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '添加设备成功'
        })
    });
};

//为家庭更新设备（目前只支持更改设备名称）
exports.updateDevice = function (req, res) {
    console.log('1234123123124');

    var user = req.user.current;
    var deviceId = req.body.deviceId;
    var name = validator.trim(req.body.name);
    var regionId = req.body.regionId;

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!deviceId) {
        return res.json({
            errorCode: 1700,
            message: '未选择待添加的设备'
        });
    }
    if (!name) {
        return res.json({
            errorCode: 1700,
            message: '未输入设备名称'
        });
    }

    var deviceTemp = {};
    var userDeviceTemp = {};
    deviceTemp['_id'] = deviceId;
    userDeviceTemp['device'] = deviceId;
    userDeviceTemp['user'] = user._id;
    var userDeviceId = '';

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
        //查询待添加的设备是否属于当前用户
        function (callback) {
            UserDevice.findOne(userDeviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询用户设备表失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '无法确认当前设备属于当前用户'
                        });
                    }
                    else {

                        userDeviceId = result._id;
                        callback();
                    }
                });
        },
        //添加到用户设备关联表中(此操作与下一个操作应组合为一个数据库事务)
        function (callback) {
            if (regionId) {
                userDeviceTemp['region'] = regionId;
            }
            else {
                userDeviceTemp['region'] = null;
            }
            UserDevice.update({_id: userDeviceId}, {$set: userDeviceTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：更新用户设备表失败'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //将原表中设备的名称进行修改
        function (callback) {
            deviceTemp['name'] = name;
            Device.update({_id: deviceId}, {$set: deviceTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：更新设备表设备名称失败'
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
    var condition = req.body.condition;     //查询条件,1为根据区域查询，2为根据类型查询，默认为2

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!condition) {
        condition = 2;
    }

    var userDeviceTemp = {};
    userDeviceTemp['user'] = user._id;


    if (condition == 1) {
        var userDevices = [];       //用户的所有设备
        var regions = [];           //用户的区域
        var regionDevices = [];     //各区域的设备结果集，与regions索引相同，即regionDevices[0]代表regions[0]区域下的设备集
        var deviceWithNoRegion = [];    //无区域设备

        var regionTemp = {};
        regionTemp['user'] = user._id;


        async.waterfall([
            //查询用户家庭设备
            function (callback) {
                UserDevice.find(userDeviceTemp)
                    .sort({createdTime: -1})
                    .populate('device')
                    .exec(function (err, result) {
                        if (err) {
                            return res.json({
                                errorCode: 1700,
                                message: '异常错误：查询用户家庭设备失败'
                            });
                        }
                        else if (!result) {
                            return res.json({
                                errorCode: 1700,
                                message: '当前家庭无设备'
                            });
                        }
                        else {
                            userDevices = result;
                            //console.log(userDevices);
                            callback();
                        }
                    });
            },
            //查询用户的区域
            //此处的排序尚未完成
            function (callback) {
                Region.find(regionTemp)
                    .sort({createdTime: -1})
                    .exec(function (err, result) {
                        if (err) {
                            return res.json({
                                errorCode: 1700,
                                message: '异常错误：查询用户区域失败'
                            });
                        }
                        else {
                            //console.log(result);
                            regions = result;
                            callback();
                        }
                    });
            },
            //将设备置于指定区域中
            function (callback) {
                var regionDevicesTemp = [];     //临时存储一个区域中的所有设备
                var i = 0;
                var j = 0;

                //找出有区域的设备
                for (i = 0; i < regions.length; i++) {
                    regionDevicesTemp = [];
                    for (j = 0; j < userDevices.length; j++) {
                        if (validator.trim(userDevices[j].region) == validator.trim(regions[i]._id)) {
                            regionDevicesTemp.push(userDevices[j]);
                        }
                        if (j == userDevices.length - 1) {
                            regionDevices.push(regionDevicesTemp);
                        }
                    }
                }
                callback();
            }
        ], function (callback) {
            return res.json({
                errorCode: 0,
                regions: regions,
                regionDevices: regionDevices
            });
        });
    }
    else if (condition == 2) {
        var lights = [];
        var curtains = [];
        var switches = [];
        var devices = [];

        async.waterfall([
            function (callback) {
                UserDevice.find(userDeviceTemp)
                    .sort({createdTime: -1})
                    .populate('device')
                    .exec(function (err, result) {
                        if (err) {
                            return res.json({
                                errorCode: 1700,
                                message: '异常错误：查询用户家庭设备失败'
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
                    if (devices[i].device.type == 1) {
                        lights.push(devices[i]);
                    }
                    else if (devices[i].device.type == 2) {
                        curtains.push(devices[i]);
                    }
                    else if (devices[i].device.type == 3) {
                        switches.push(devices[i]);
                    }
                }
                callback();
            }
        ], function (callback) {
            return res.json({
                errorCode: 0,
                lights: lights,
                curtains: curtains,
                switches: switches
            });
        });
    }
    else {
        return res.json({
            errorCode: 1700,
            message: '查询条件错误'
        });
    }
};

//取得设备详情
exports.getDeviceDetail = function (req, res) {

};

//删除家庭中的设备
exports.deleteDevice = function (req, res) {
    var user = req.user.current;
    var deviceId = req.body.deviceId;

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!deviceId) {
        return res.json({
            errorCode: 1700,
            message: '未选择待删除的设备'
        });
    }

    var deviceTemp = {};
    var userDeviceTemp = {};
    deviceTemp['_id'] = deviceId;
    //deviceTemp['name'] = null;
    userDeviceTemp['device'] = deviceId;
    userDeviceTemp['user'] = user._id;

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
                            message: '找不到待删除的设备'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
        //查询设备是否属于当前用户
        function (callback) {
            UserDevice.findOne(userDeviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询用户设备表失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '该设备不属于当前用户'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
        //删除用户设备表中该设备的绑定信息
        function (callback) {
            UserDevice.remove({device: deviceId}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：删除用户设备表记录失败'
                    });
                }
                else {
                    callback();
                }
            })
        },
        //删除设备表中的设备名称（置为空）
        function (callback) {
            deviceTemp['name'] = null;
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

//控制命令
exports.command = function (req, res) {
    var user = req.user.current;
    var command = req.body.command;
    var deviceId = req.body.deviceId;

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!deviceId) {
        return res.json({
            errorCode: 1700,
            message: '未选择控制设备'
        });
    }
    if (!command) {
        return res.json({
            errorCode: 1700,
            message: '未设备控制命令'
        });
    }

    var deviceTemp = {};
    var userDeviceTemp = {};
    deviceTemp['_id'] = deviceId;
    userDeviceTemp['device'] = deviceId;
    userDeviceTemp['user'] = user._id;
    var type = 0;       //设备的类型

    async.waterfall([
        //查看设备是否存在，获取设备类型
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
                            message: '找不到待控制的设备'
                        });
                    }
                    else {
                        type = result.type;
                        callback();
                    }
                });

        },
        //查看设备是否属于当前用户
        function (callback) {
            UserDevice.findOne(userDeviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询用户设备表失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '该设备不属于当前用户'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
        //发出控制命令
        function (callback) {
            callback();
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '控制命令发送成功'
        });
    });


};



