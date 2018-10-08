var mongoose = require('../../cloud_db_connect');
var Scene = mongoose.model('Scene');
var User = mongoose.model('User');
var UserDevice = mongoose.model('UserDevice');
var Device = mongoose.model('Device');
var Gateway = mongoose.model('Gateway');
var Command = require('../device/command');
var run = require('./run.js');      //具体执行文件

var log4j = require('log4js').getLogger();
var agenda = require('../../../lib/schedule');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var config = require('../../../config/config');
var request = require('request');
var async = require('async');

//创建情景模式
//未测试对自动情景模式的创建（主要针对时间戳）
exports.createScene = function (req, res) {
    var user = req.user.current;
    var name = validator.trim(req.body.name);
    var type = req.body.type;
    var commands = req.body.commands;

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!name) {
        return res.json({
            errorCode: 1800,
            message: '未输入情景模式名称'
        });
    }
    if (!commands) {
        return res.json({
            errorCode: 1800,
            message: '未输入情景模式命令集'
        });
    }
    if ((!type) || ( type != 1 && type != 2)) {
        return res.json({
            errorCode: 1800,
            message: '情景模式类型出错'
        });
    }

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
                if (type == 2) {
                    var executeTime = req.body.executeTime;
                    var repeat = req.body.repeat;
                    var autorun = req.body.autorun;
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
                    if (!autorun) {
                        autorun = true;
                    }
                    for (var i = 0; i < repeat.length; i++) {
                        if (repeat[i] == 'true') {
                            repeat[i] = true;
                        }
                        else if (repeat[i] == 'false') {
                            repeat[i] = false;
                        }
                        else {
                            return res.json({
                                errorCode: 1800,
                                message: '情景模式自动执行重复日期有误'
                            });
                        }
                    }
                    sceneTemp['executeTime'] = executeTime;
                    sceneTemp['repeat'] = repeat;
                    sceneTemp['autorun'] = autorun;
                }

                var sceneSave = new Scene(sceneTemp);
                sceneSave.save(function (err) {
                    if (err) {
                        return res.json({
                            errorCode: 1800,
                            message: '异常错误：存储情景模式失败'
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
                message: '存储情景模式成功'
            });
        }
    )
    ;
};

//修改情景模式
exports.updateScene = function (req, res) {
    var user = req.user.current;
    var sceneId = req.body.sceneId;
    var name = validator.trim(req.body.name);
    var type = req.body.type;
    var commands = req.body.commands;

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!sceneId) {
        return res.json({
            errorCode: 1800,
            message: '未选择要修改的情景模式'
        });
    }
    if (!name) {
        return res.json({
            errorCode: 1800,
            message: '未输入情景模式名称'
        });
    }
    if (!commands) {
        return res.json({
            errorCode: 1800,
            message: '未输入情景模式命令集'
        });
    }
    if ((!type) || ( type != 1 && type != 2)) {
        return res.json({
            errorCode: 1800,
            message: '情景模式类型出错'
        });
    }

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
                var executeTime = req.body.executeTime;
                var repeat = req.body.repeat;
                var autorun = req.body.autorun;
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
                if (!autorun) {
                    autorun = true;
                }
                for (var i = 0; i < repeat.length; i++) {
                    if (repeat[i] == 'true') {
                        repeat[i] = true;
                    }
                    else if (repeat[i] == 'false') {
                        repeat[i] = false;
                    }
                    else {
                        return res.json({
                            errorCode: 1800,
                            message: '情景模式自动执行重复日期有误'
                        });
                    }
                }
                sceneTemp['executeTime'] = executeTime;
                sceneTemp['repeat'] = repeat;
                sceneTemp['autorun'] = autorun;
            }
            if (type == 1) {
                sceneTemp['executeTime'] = null;
                sceneTemp['repeat'] = null;
                sceneTemp['autorun'] = null;
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
    var sceneId = req.body.sceneId;

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!sceneId) {
        return res.json({
            errorCode: 1800,
            message: '未选择待查看的情景模式'
        });
    }

    var sceneTemp = {};
    sceneTemp['user'] = user._id;
    sceneTemp['_id'] = sceneId;

    var scene = {};        //返回结果,情景模式总集
    var sceneDeviceList = [];       //单个情景模式中的所有设备
    var sceneDeviceIds = [];

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
                                message: '当前用户无情景模式'
                            });
                        }
                        else {
                            scene = result;
                            callback();
                        }
                    });
            },
            //设备信息
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
                                    if (validator.trim(scene.commands[i].device) == validator.trim(result[j]._id)) {
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
            }
        ],
        function (callback) {
            return res.json({
                errorCode: 0,
                scene: scene
            });
        }
    );
};

//删除情景模式
exports.deleteScene = function (req, res) {
    var user = req.user.current;
    var sceneId = req.body.sceneId;

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!sceneId) {
        return res.json({
            errorCode: 1800,
            message: '未选择待删除的情景模式'
        });
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
    var sceneId = req.body.sceneId;

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!sceneId) {
        return res.json({
            errorCode: 1800,
            message: '未选择待执行的情景模式'
        });
    }

    var sceneTemp = {};
    sceneTemp['user'] = user._id;
    sceneTemp['_id'] = sceneId;
    var sceneCommands = {};

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
        //分设备，执行命令
        function (callback) {
            for (var i = 0; i < sceneCommands.length; i++) {
                run.backCommand(sceneCommands[i].device, sceneCommands[i].command);
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

//设定情景模式自动执行
exports.setSceneAutorun = function (req, res) {
    var user = req.user.current;
    var sceneId = req.body.sceneId;
    var autorunStr = req.body.autorun;
    var autorun;

    if (autorunStr == 'true') {
        autorun = true;
    }
    else if (autorunStr == 'false') {
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
    if (!sceneId) {
        return res.json({
            errorCode: 1800,
            message: '未选择待设定的情景模式'
        });
    }
    //if (!((autorun == true) || (autorun == false))) {
    //    return res.json({
    //        errorCode: 1800,
    //        message: '未设定情景模式是否自动执行'
    //    });
    //}

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

