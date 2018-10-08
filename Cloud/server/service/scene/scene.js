/**
 * <copyright file="scene.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>12/06/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var Scene = mongoose.model('Scene');
var User = mongoose.model('User');
var Device = mongoose.model('Device');
var CommandModule = require('../device/command');

//var log4j = require('log4js').getLogger();
//var agenda = require('../../../lib/schedule');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var config = require('../../../config/config');
var request = require('request');
var async = require('async');

/**
 * 创建、更新情景模式时，需对其中的device和command进行审核
 */

//创建情景模式
//前台传入的时间戳为string格式
exports.createScene = function (req, res) {
    var user = req.user.current;

    var name;
    var type = req.body.type;
    var commands;

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.name) {
        return res.json({
            errorCode: 1800,
            message: '未输入情景模式名称'
        });
    }
    else {
        name = validator.trim(req.body.name);
    }
    if (!req.body.commands) {
        return res.json({
            errorCode: 1800,
            message: '未输入情景模式命令集'
        });
    }
    else {
        commands = req.body.commands;
    }
    //if ((!type) || ( type != 1 && type != 2)) {
    //    return res.json({
    //        errorCode: 1800,
    //        message: '情景模式类型出错'
    //    });
    //}
    type = 1;

    var sceneTemp = {};
    sceneTemp['user'] = user._id;
    sceneTemp['name'] = name;

    async.waterfall([
            //查询用户已有的情景模式，保证名称不重复
            function (callback) {
                Scene.findOne(sceneTemp)
                    .exec(function (err, result) {
                        if (err) {
                            return res.json({
                                errorCode: 1800,
                                message: '异常错误：查询用户情景模式失败'
                            });
                        }
                        else if (result) {
                            return res.json({
                                errorCode: 1800,
                                message: '您输入的情景模式名称已被占用'
                            })
                        }
                        else {
                            callback();
                        }
                    });
            },
            //将情景模式添加至数据库中
            function (callback) {
                sceneTemp['type'] = type;
                sceneTemp['commands'] = commands;
                sceneTemp['showComponent'] = false;
                if (type == 2) {
                    var executeTime = parseInt(req.body.executeTime);
                    var repeat = req.body.repeat;
                    //var autorun = req.body.autorun;
                    if (!executeTime) {
                        return res.json({
                            errorCode: 1800,
                            message: '未输入情景模式自动执行时间'
                        });
                    }
                    if (!repeat) {
                        return res.json({
                            errorCode: 1800,
                            message: '未输入情景模式自动执行重复日期'
                        });
                    }
                    //if (!autorun) {
                    //    autorun = true;
                    //}
                    //for (var i = 0; i < repeat.length; i++) {
                    //    if (repeat[i] == 'true') {
                    //        repeat[i] = true;
                    //    }
                    //    else if (repeat[i] == 'false') {
                    //        repeat[i] = false;
                    //    }
                    //    else {
                    //        return res.json({
                    //            errorCode: 1800,
                    //            message: '情景模式自动执行重复日期有误'
                    //        });
                    //    }
                    //}
                    sceneTemp['executeTime'] = executeTime;
                    sceneTemp['repeat'] = repeat;
                    //sceneTemp['autorun'] = autorun;
                }

                var sceneSave = new Scene(sceneTemp);
                sceneSave.save(function (err) {
                    if (err) {
                        return res.json({
                            errorCode: 1800,
                            message: '异常错误：创建情景模式失败'
                        });
                    }
                    else {
                        callback();
                    }
                });
            }
        ],
        function (callback) {
            return res.json({
                errorCode: 0,
                message: '创建情景模式成功'
            });
        }
    );
};

//修改情景模式
exports.updateScene = function (req, res) {
    var user = req.user.current;
    var sceneId;
    var type = req.body.type;
    var name;
    var commands;

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.sceneId) {
        return res.json({
            errorCode: 1800,
            message: '未选择要修改的情景模式'
        });
    }
    else {
        sceneId = req.body.sceneId;
    }
    if (!req.body.name) {
        return res.json({
            errorCode: 1800,
            message: '未输入情景模式名称'
        });
    }
    else {
        name = validator.trim(req.body.name);
    }
    if (!req.body.commands) {
        return res.json({
            errorCode: 1800,
            message: '未输入情景模式命令集'
        });
    }
    else {
        commands = req.body.commands;
    }
    //if ((!type) || ( type != 1 && type != 2)) {
    //    return res.json({
    //        errorCode: 1800,
    //        message: '情景模式类型出错'
    //    });
    //}
    type = 1;

    var sceneTemp = {};
    sceneTemp['user'] = user._id;
    sceneTemp['_id'] = sceneId;

    async.waterfall([
        //查询用户已有的情景模式，保证名称不重复
        function (callback) {
            Scene.findOne(sceneTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1800,
                            message: '异常错误：查询用户情景模式是否存在失败'
                        });
                    }
                    else if (result) {
                        callback();
                    }
                    else {
                        return res.json({
                            errorCode: 1800,
                            message: '未找到要修改的情景模式'
                        })
                    }
                });
        },
        //查看要修改的情景模式名称有没有重名
        function (callback) {
            delete sceneTemp._id;
            sceneTemp['name'] = name;
            Scene.findOne(sceneTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1800,
                            message: '异常错误：查询用户情景模式是否重名失败'
                        });
                    }
                    else if (!result) {
                        callback();
                    }
                    else {
                        return res.json({
                            errorCode: 1800,
                            message: '要修改的情景模式存在重名'
                        })
                    }
                });
        },
        //更新情景模式
        function (callback) {
            sceneTemp['name'] = name;
            sceneTemp['type'] = type;
            sceneTemp['commands'] = commands;
            if (type == 2) {
                var executeTime = parseInt(req.body.executeTime);
                var repeat = req.body.repeat;
                //var autorun = req.body.autorun;
                if (!executeTime) {
                    return res.json({
                        errorCode: 1800,
                        message: '未输入情景模式自动执行时间'
                    });
                }
                if (!repeat) {
                    return res.json({
                        errorCode: 1800,
                        message: '未输入情景模式自动执行重复日期'
                    });
                }
                //if (!autorun) {
                //    autorun = true;
                //}
                //for (var i = 0; i < repeat.length; i++) {
                //    if (repeat[i] == 'true') {
                //        repeat[i] = true;
                //    }
                //    else if (repeat[i] == 'false') {
                //        repeat[i] = false;
                //    }
                //    else {
                //        return res.json({
                //            errorCode: 1800,
                //            message: '情景模式自动执行重复日期有误'
                //        });
                //    }
                //}
                sceneTemp['executeTime'] = executeTime;
                sceneTemp['repeat'] = repeat;
                //sceneTemp['autorun'] = autorun;
            }
            if (type == 1) {
                sceneTemp['executeTime'] = null;
                sceneTemp['repeat'] = null;
                //sceneTemp['autorun'] = null;
            }

            Scene.update({_id: sceneId}, {$set: sceneTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1800,
                        message: '异常错误：查询用户情景模式失败'
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
            message: '更新情景模式成功'
        });
    });
};

//获取家庭情景模式列表
exports.getSceneList = function (req, res) {
    var user = req.user.current;

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }

    var sceneTemp = {};
    sceneTemp['user'] = user._id;

    var scenes = [];        //返回结果

    async.waterfall([
        //查询
        function (callback) {
            Scene.find(sceneTemp)
                .sort({updatedTime: -1})
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1800,
                            message: '异常错误：查询用户情景模式失败'
                        });
                    }
                    else if ((!result) || (result.length == 0)) {
                        return res.json({
                            errorCode: 1800,
                            message: '当前用户未创建情景模式'
                        });
                    }
                    else {
                        scenes = result;
                        callback();
                    }
                });
        },
        //设备信息
        function (callback) {
            callback();
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            scenes: scenes
        });
    });
};

//取得单个情景模式详情
exports.getSceneDetail = function (req, res) {
    var user = req.user.current;
    var sceneId;

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.sceneId) {
        return res.json({
            errorCode: 1800,
            message: '未选择待查看的情景模式'
        });
    }
    else {
        sceneId = req.body.sceneId;
    }

    var sceneTemp = {};
    var deviceTemp = {};
    sceneTemp['user'] = user._id;
    sceneTemp['_id'] = sceneId;
    deviceTemp['user'] = user._id;

    var scene = {};        //返回结果,情景模式总集
    var sceneDeviceList = [];       //单个情景模式中的所有已选择设备
    var restOfDeviceList = [];      //情景模式所有未选择的设备
    var sceneDeviceIds = [];

    async.waterfall([
            //查询当前
            function (callback) {
                Scene.findOne(sceneTemp)
                    .exec(function (err, result) {
                        if (err) {
                            return res.json({
                                errorCode: 1800,
                                message: '异常错误：查询用户情景模式失败'
                            });
                        }
                        else if (!result) {
                            return res.json({
                                errorCode: 1800,
                                message: '未查到该情景模式'
                            });
                        }
                        else {
                            scene = result;
                            callback();
                        }
                    });
            },
            //情景模式中已选择的设备的详细信息
            function (callback) {
                var i = 0;
                var j = 0;
                var deviceCommandTemp = {};
                for (i = 0; i < scene.commands.length; i++) {
                    sceneDeviceIds.push(scene.commands[i].device);
                }
                Device.find({_id: {$in: sceneDeviceIds}}, function (err, result) {
                        if (err) {
                            return res.json({
                                errorCode: 1800,
                                message: '异常错误：查询用户设备失败'
                            });
                        }
                        else if (!result) {
                            callback();
                        }
                        else {
                            for (i = 0; i < scene.commands.length; i++) {
                                for (j = 0; j < result.length; j++) {
                                    //if (validator.trim(scene.commands[i].device) == validator.trim(result[j]._id)) {
                                    if ((scene.commands[i].device).equals(result[j]._id)) {
                                        //先做一个完整的json，用此json替代原先scene.commands这个json数组里的数据
                                        //如不使用这种方式，将无法为scene.commands[i]这个json添加新的属性
                                        deviceCommandTemp = {};
                                        deviceCommandTemp['_id'] = result[j]._id;
                                        deviceCommandTemp['mac'] = result[j].mac;
                                        deviceCommandTemp['type'] = result[j].type;
                                        deviceCommandTemp['name'] = result[j].name;
                                        deviceCommandTemp['updatedTime'] = result[j].updatedTime;
                                        deviceCommandTemp['createdTime'] = result[j].createdTime;
                                        deviceCommandTemp['command'] = scene.commands[i].command;
                                        scene.commands[i] = deviceCommandTemp;
                                        break;
                                    }
                                }
                            }
                            //console.log(scene.commands);
                            callback();
                        }
                    }
                );
            },
            //查询情景模式中未选择的设备信息
            function (callback) {
                Device.find(deviceTemp)
                    .sort({createdTime: -1})
                    .exec(function (err, result) {
                        if (err) {
                            return res.json({
                                errorCode: 1800,
                                message: '异常错误：查询用户设备失败'
                            });
                        }
                        else if (!result) {
                            return res.json({
                                errorCode: 1800,
                                message: '用户当前未添加任何设备'
                            });
                        }
                        else {
                            var deviceExists = false;           //临时变量，代表设备是否已存在于该情景模式的设备列表中
                            for (i = 0; i < result.length; i++) {
                                for (j = 0; j < scene.commands.length; j++) {
                                    if ((result[i]._id).equals(scene.commands[j]._id)) {
                                        deviceExists = true;
                                        break;
                                    }
                                }
                                if ((!deviceExists) && (result[i].type != 0)) {
                                    restOfDeviceList.push(result[i]);
                                }
                                deviceExists = false;
                            }
                            callback();
                        }
                    });
            }
        ],
        function (callback) {
            return res.json({
                errorCode: 0,
                scene: scene,
                restOfDeviceList: restOfDeviceList
            });
        }
    );
};

//删除情景模式
exports.deleteScene = function (req, res) {
    var user = req.user.current;
    var sceneId;

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.sceneId) {
        return res.json({
            errorCode: 1800,
            message: '未选择待删除的情景模式'
        });
    }
    else {
        sceneId = req.body.sceneId;
    }

    var sceneTemp = {};
    sceneTemp['user'] = user._id;
    sceneTemp['_id'] = sceneId;

    async.waterfall([
        //查询
        function (callback) {
            Scene.findOne(sceneTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1800,
                            message: '异常错误：查询用户情景模式失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1800,
                            message: '未找到待删除的情景模式'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
        //删除
        function (callback) {
            Scene.remove({_id: sceneId}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1800,
                        message: '异常错误：删除用户情景模式失败'
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
            message: '删除情景模式成功'
        });
    });
};

//执行情景模式（用户主动执行）
exports.runScene = function (req, res) {
    var user = req.user.current;
    var sceneId;

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.sceneId) {
        return res.json({
            errorCode: 1800,
            message: '未选择待执行的情景模式'
        });
    }
    else {
        sceneId = req.body.sceneId;
    }

    var sceneTemp = {};
    var deviceTemp = {};
    sceneTemp['user'] = user._id;
    sceneTemp['_id'] = sceneId;
    deviceTemp['user'] = user._id;
    var sceneCommands = [];
    var sceneDevices = [];
    var gateways = [];      //用户的所有网关

    var i, j;


    async.waterfall([
        //查询情景模式是否存在，是否属于当前用户
        function (callback) {
            Scene.findOne(sceneTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1800,
                            message: '异常错误：查询用户情景模式失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1800,
                            message: '未找到待执行的情景模式'
                        });
                    }
                    else {
                        sceneCommands = result.commands;
                        callback();
                    }
                });
        },
        //查询用户网关数
        function (callback) {
            deviceTemp['type'] = 0;
            Device.find(deviceTemp)
                .sort({createdTime: -1})
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1800,
                            message: '异常错误：查询网关失败'
                        });
                    }
                    else if (result) {
                        gateways = result;
                        callback();
                    }
                    else {
                        return res.json({
                            errorCode: 1800,
                            message: '当前用户未添加网关，无法控制'
                        });
                    }
                });
        },
        //通过复杂查询，populate进device的详细信息
        function (callback) {
            for (i = 0; i < sceneCommands.length; i++) {
                sceneDevices.push(sceneCommands[i].device);
            }
            delete deviceTemp.type;
            Device.find(deviceTemp)
                .where('_id').in(sceneDevices)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1800,
                            message: '异常错误：查询设备失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1800,
                            message: '错误：查询不到待控制的设备'
                        });
                    }
                    else {
                        sceneDevices = result;
                        callback();
                    }
                });
        },
        //分设备，执行命令
        function (callback) {
            for (i = 0; i < sceneCommands.length; i++) {
                for (j = 0; j < sceneDevices.length; j++) {
                    if ((sceneDevices[j]._id).equals(sceneCommands[i].device)) {
                        if (sceneDevices[j].type == 3) {
                            switch (sceneCommands[i].command) {
                                case 'Turn00':
                                    CommandModule.executeDeviceCommand(sceneDevices[j], gateways, 'TurnOffLeft');
                                    CommandModule.executeDeviceCommand(sceneDevices[j], gateways, 'TurnOffRight');
                                    break;
                                case 'Turn01':
                                    CommandModule.executeDeviceCommand(sceneDevices[j], gateways, 'TurnOffLeft');
                                    CommandModule.executeDeviceCommand(sceneDevices[j], gateways, 'TurnOnRight');
                                    break;
                                case 'Turn10':
                                    CommandModule.executeDeviceCommand(sceneDevices[j], gateways, 'TurnOnLeft');
                                    CommandModule.executeDeviceCommand(sceneDevices[j], gateways, 'TurnOffRight');
                                    break;
                                case 'Turn11':
                                    CommandModule.executeDeviceCommand(sceneDevices[j], gateways, 'TurnOnLeft');
                                    CommandModule.executeDeviceCommand(sceneDevices[j], gateways, 'TurnOnRight');
                                    break;
                            }
                        }
                        else {
                            CommandModule.executeDeviceCommand(sceneDevices[j], gateways, sceneCommands[i].command);
                        }
                    }
                }
            }
            callback();
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '情景模式执行成功'
        });
    });
};

//后台调用执行情景模式
exports.runSceneBackground = function (userId, sceneId) {

    console.log('后台调用执行情景模式');
    var user;
    var scene;

    if (!userId) {
        return {
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        };
    }
    else {
        user = userId;
    }
    if (!sceneId) {
        return {
            errorCode: 1800,
            message: '未选择待执行的情景模式'
        };
    }
    else {
        scene = sceneId;
    }

    var sceneTemp = {};
    var deviceTemp = {};
    sceneTemp['user'] = user;
    sceneTemp['_id'] = scene;
    deviceTemp['user'] = user;
    var sceneCommands = [];
    var sceneDevices = [];
    var gateways = [];      //用户的所有网关

    var i, j;

    async.waterfall([
        //查询情景模式是否存在，是否属于当前用户
        function (callback) {
            Scene.findOne(sceneTemp)
                .exec(function (err, result) {
                    if (err) {
                        return {
                            errorCode: 1800,
                            message: '异常错误：查询用户情景模式失败'
                        };
                    }
                    else if (!result) {
                        return {
                            errorCode: 1800,
                            message: '未找到待执行的情景模式'
                        };
                    }
                    else {
                        sceneCommands = result.commands;
                        callback();
                    }
                });
        },
        //查询用户网关数
        function (callback) {
            deviceTemp['type'] = 0;
            Device.find(deviceTemp)
                .sort({createdTime: -1})
                .exec(function (err, result) {
                    if (err) {
                        return {
                            errorCode: 1800,
                            message: '异常错误：查询网关失败'
                        };
                    }
                    else if (result) {
                        gateways = result;
                        callback();
                    }
                    else {
                        return {
                            errorCode: 1800,
                            message: '当前用户未添加网关，无法控制'
                        };
                    }
                });
        },
        //通过复杂查询，populate进device的详细信息
        function (callback) {
            for (i = 0; i < sceneCommands.length; i++) {
                sceneDevices.push(sceneCommands[i].device);
            }
            delete deviceTemp.type;
            Device.find(deviceTemp)
                .where('_id').in(sceneDevices)
                .exec(function (err, result) {
                    if (err) {
                        return {
                            errorCode: 1800,
                            message: '异常错误：查询设备失败'
                        };
                    }
                    else if (!result) {
                        return {
                            errorCode: 1800,
                            message: '错误：查询不到待控制的设备'
                        };
                    }
                    else {
                        sceneDevices = result;
                        callback();
                    }
                });
        },
        //分设备，执行命令
        function (callback) {
            console.log('分设备执行命令');
            for (i = 0; i < sceneCommands.length; i++) {
                for (j = 0; j < sceneDevices.length; j++) {
                    if ((sceneDevices[j]._id).equals(sceneCommands[i].device)) {
                        CommandModule.executeDeviceCommand(sceneDevices[j], gateways, sceneCommands[i].command);
                    }
                }
            }
            callback();
        }
    ], function (callback) {
        return {
            errorCode: 0,
            message: '情景模式执行成功'
        };
    });
};

//设定情景模式自动执行
exports.setSceneAutorun = function (req, res) {
    var user = req.user.current;
    var sceneId;
    var autorun;

    if (req.body.autorun == 'true') {
        autorun = true;
    }
    else if (req.body.autorun == 'false') {
        autorun = false;
    }
    else {
        return res.json({
            errorCode: 1800,
            message: '未设定情景模式是否自动执行'
        });
    }

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.sceneId) {
        return res.json({
            errorCode: 1800,
            message: '未选择待设定的情景模式'
        });
    }
    else {
        sceneId = req.body.sceneId;
    }

    var sceneTemp = {};
    sceneTemp['user'] = user._id;
    sceneTemp['_id'] = sceneId;

    async.waterfall([
        //查询情景模式是否存在，是否属于当前用户
        function (callback) {
            Scene.findOne(sceneTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1800,
                            message: '异常错误：查询用户情景模式失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1800,
                            message: '未找到待设定的情景模式'
                        });
                    }
                    else {
                        sceneTemp = result;
                        callback();
                    }
                });
        },
        //更新设定
        function (callback) {
            sceneTemp['autorun'] = autorun;
            Scene.update({_id: sceneId}, {$set: sceneTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1800,
                        message: '异常错误：设定失败'
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
            message: '设定成功'
        });
    });
};

