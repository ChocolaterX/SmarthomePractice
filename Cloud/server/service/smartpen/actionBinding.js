/**
 * <copyright file="actionBinding.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>3/29/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var ActionBinding = mongoose.model('ActionBinding');

var validator = require('validator');
var fs = require('fs');
var request = require('request');
var async = require('async');

//为家庭添加动作绑定
exports.createActionBinding = function (req, res) {
    var user = req.user.current;
    var number;
    var type;
    var command;
    var sceneId;
    var deviceId;
    var infraredCommandId;

    if (!user) {
        return res.json({
            errorCode: 2000,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.number) {
        return res.json({
            errorCode: 2000,
            message: '未输入动作编号'
        });
    }
    else if ((req.body.number) < 10 && (req.body.number >= 0)) {
        number = req.body.number;
    }
    else {
        return res.json({
            errorCode: 2000,
            message: '动作编号有误，请输入0-9之间的数字'
        });
    }
    if (!req.body.type) {
        return res.json({
            errorCode: 2000,
            message: '未选择动作绑定绑定类型'
        });
    }
    else {
        type = req.body.type;
        if (type == 1) {
            if (req.body.deviceId) {
                deviceId = validator.trim(req.body.deviceId);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未选择动作绑定绑定的设备'
                });
            }
            if (req.body.command) {
                command = validator.trim(req.body.command);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未指定动作绑定绑定的设备操作'
                });
            }
        }
        else if (type == 2) {
            if (req.body.sceneId) {
                sceneId = validator.trim(req.body.sceneId);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未选择动作绑定绑定的情景模式'
                });
            }
        }
        else if (type == 3) {
            if (req.body.infraredCommandId) {
                infraredCommandId = validator.trim(req.body.infraredCommandId);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未选择动作绑定绑定的红外指令'
                });
            }
        }
        else {
            return res.json({
                errorCode: 2000,
                message: '绑定类型出错'
            });
        }
    }

    var actionBindingTemp = {};
    actionBindingTemp['user'] = user._id;
    actionBindingTemp['number'] = number;

    async.waterfall([
        //查询当前用户是否已经使用了这个动作绑定
        function (callback) {
            ActionBinding.findOne(actionBindingTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询动作绑定失败'
                        });
                    }
                    else if (!result) {
                        callback();
                    }
                    else {
                        return res.json({
                            errorCode: 2000,
                            message: '待添加的动作绑定已存在'
                        });
                    }
                });
        },
        //添加动作绑定
        function (callback) {
            actionBindingTemp['type'] = type;
            actionBindingTemp['device'] = deviceId;
            actionBindingTemp['command'] = command;
            actionBindingTemp['scene'] = sceneId;
            actionBindingTemp['infraredCommand'] = infraredCommandId;

            var actionBindingSave = new ActionBinding(actionBindingTemp);
            actionBindingSave.save(function (err) {
                if (err) {
                    return res.json({
                        errorCode: 2000,
                        message: '异常错误：保存动作绑定失败'
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
            message: '添加动作绑定成功'
        })
    });
};

//更新用户动作绑定的信息
exports.updateActionBinding = function (req, res) {
    var user = req.user.current;
    var actionBindingId;
    var number;
    var type;
    var command;
    var sceneId;
    var deviceId;
    var infraredCommandId;

    if (!user) {
        return res.json({
            errorCode: 2000,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.actionBindingId) {
        return res.json({
            errorCode: 2000,
            message: '未选择待更新的动作绑定'
        });
    }
    else {
        actionBindingId = validator.trim(req.body.actionBindingId);
    }
    if (!req.body.number) {
        return res.json({
            errorCode: 2000,
            message: '未输入动作编号内容'
        });
    }
    else {
        number = req.body.number;
    }
    if (!req.body.type) {
        return res.json({
            errorCode: 2000,
            message: '未选择动作绑定绑定类型'
        });
    }
    else {
        type = req.body.type;
        if (type == 1) {
            if (req.body.deviceId) {
                deviceId = validator.trim(req.body.deviceId);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未选择动作绑定绑定的设备'
                });
            }
            if (req.body.command) {
                command = validator.trim(req.body.command);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未指定动作绑定绑定的设备操作'
                });
            }
        }
        else if (type == 2) {
            if (req.body.sceneId) {
                sceneId = validator.trim(req.body.sceneId);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未选择动作绑定绑定的情景模式'
                });
            }
        }
        else if (type == 3) {
            if (req.body.infraredCommandId) {
                infraredCommandId = validator.trim(req.body.infraredCommandId);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未选择动作绑定绑定的红外指令'
                });
            }
        }
        else {
            return res.json({
                errorCode: 2000,
                message: '绑定类型出错'
            });
        }
    }

    var actionBindingTemp = {};
    actionBindingTemp['_id'] = actionBindingId;
    actionBindingTemp['user'] = user._id;
    var actionBindingExists = true;         //判断要更改的绑定数字，是不是当前ID对应的绑定数字，如果是，则不代表数字被占用

    async.waterfall([
        //查询动作绑定是否存在
        function (callback) {
            ActionBinding.findOne(actionBindingTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询动作绑定失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2000,
                            message: '找不到待更新的动作绑定'
                        });
                    }
                    else {
                        if (result.number == number) {
                            actionBindingExists = false;
                        }
                        callback();
                    }
                });
        },
        //查询要更新的动作编号是否被占用
        function (callback) {
            delete actionBindingTemp._id;
            actionBindingTemp['number'] = number;
            ActionBinding.findOne(actionBindingTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询动作绑定失败'
                        });
                    }
                    else if (result) {
                        if (!actionBindingExists) {
                            callback();
                        }
                        else {
                            return res.json({
                                errorCode: 2000,
                                message: '动作绑定已被占用'
                            });
                        }
                    }
                    else {
                        callback();
                    }
                });
        },
        //更新动作绑定
        function (callback) {
            actionBindingTemp['type'] = type;
            actionBindingTemp['device'] = deviceId;
            actionBindingTemp['command'] = command;
            actionBindingTemp['scene'] = sceneId;
            actionBindingTemp['infraredCommand'] = infraredCommandId;
            ActionBinding.update({_id: actionBindingId}, {$set: actionBindingTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 2000,
                        message: '异常错误：更新动作绑定失败'
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
            message: '更新动作绑定成功'
        })
    });
};

//取得家庭动作绑定列表
exports.getActionBindingList = function (req, res) {
    var user = req.user.current;

    if (!user) {
        return res.json({
            errorCode: 2000,
            message: '异常错误：无法取得当前用户信息'
        });
    }

    var actionBindingTemp = {};
    actionBindingTemp['user'] = user._id;
    var actionBindings;
    var i, j;

    async.waterfall([
        //查询
        function (callback) {
            ActionBinding.find(actionBindingTemp)
                .sort({createdTime: -1})
                .populate('device')
                .populate('scene')
                .populate('infraredCommand')
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询用户动作绑定失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2000,
                            message: '当前家庭无动作绑定'
                        });
                    }
                    else {
                        actionBindings = result;
                        callback();
                    }
                });
        },
        //排序
        function (callback) {
            var temp;
            for (i = 0; i < actionBindings.length - 1; i++) {
                for (j = 0; j < actionBindings.length - i - 1; j++) {
                    if (actionBindings[j].number > actionBindings[j + 1].number) {
                        temp = actionBindings[j + 1];
                        actionBindings[j + 1] = actionBindings[j];
                        actionBindings[j] = temp;
                    }
                }
            }
            callback();
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            actionBindings: actionBindings
        });
    });
};

//取得动作绑定详情
exports.getActionBindingDetail = function (req, res) {
    var actionBindingId;
    var user = req.user.current;

    if (!user) {
        return res.json({
            errorCode: 2000,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.actionBindingId) {
        return res.json({
            errorCode: 2000,
            message: '未选择待查看的动作绑定'
        });
    }
    else {
        actionBindingId = req.body.actionBindingId;
    }

    var actionBindingTemp = {};
    actionBindingTemp['_id'] = actionBindingId;
    actionBindingTemp['user'] = user._id;
    var actionBinding = {};

    async.waterfall([

        function (callback) {
            ActionBinding.findOne(actionBindingTemp)
                .populate('device')
                .populate('scene')
                .populate('infraredCommand')
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询动作绑定异常'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2000,
                            message: '找不到待查看的动作绑定'
                        });
                    }
                    else {
                        actionBinding = result;
                        callback();
                    }
                });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            actionBinding: actionBinding
        });
    });
};

//删除家庭中的动作绑定
exports.deleteActionBinding = function (req, res) {
    var user = req.user.current;
    var actionBindingId;

    if (!user) {
        return res.json({
            errorCode: 2000,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.actionBindingId) {
        return res.json({
            errorCode: 2000,
            message: '未选择待删除的动作绑定'
        });
    }
    else {
        actionBindingId = req.body.actionBindingId;
    }

    var actionBindingTemp = {};
    actionBindingTemp['_id'] = actionBindingId;
    actionBindingTemp['user'] = user._id;

    async.waterfall([
        //查询动作绑定是否存在
        function (callback) {
            ActionBinding.findOne(actionBindingTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询动作绑定异常'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2000,
                            message: '找不到待删除的动作绑定'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
        //删除动作绑定表中的动作绑定名称（置为空）
        function (callback) {
            ActionBinding.remove({_id: actionBindingId}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1600,
                        message: '异常错误：删除动作绑定失败'
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
            message: '删除动作绑定成功'
        });
    });
};

