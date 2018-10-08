/**
 * <copyright file="telecontroller.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>4/2/2018</date>
 * <summary>
 *  包含了用户的遥控器的CRUD
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var Telecontroller = mongoose.model('Telecontroller');
var InfraredCommand = mongoose.model('InfraredCommand');

var validator = require('validator');
var fs = require('fs');
var request = require('request');
var async = require('async');
var path = require('path');

//添加一个新的遥控器
exports.createTelecontroller = function (req, res) {
    var user;
    var name;

    if (!req.user.current) {
        return res.json({
            errorCode: 2300,
            message: '无法获取当前用户'
        });
    }
    else {
        user = req.user.current;
    }
    if (!req.body.name) {
        return res.json({
            errorCode: 2300,
            message: '未命名当前遥控器'
        });
    }
    else {
        name = req.body.name;
    }

    var telecontrollerTemp = {};
    telecontrollerTemp['user'] = user;
    telecontrollerTemp['name'] = name;

    async.waterfall([
        //查询该遥控器是否已存在
        function (callback) {
            Telecontroller.findOne(telecontrollerTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2300,
                            message: '异常错误：查询遥控器失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2300,
                            message: '待添加的遥控器已存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        //添加遥控器
        function (callback) {
            telecontrollerTemp['showComponent'] = false;
            var telecontrollerSave = new Telecontroller(telecontrollerTemp);
            telecontrollerSave.save(function (err) {
                if (err) {
                    return res.json({
                        errorCode: 2300,
                        message: '异常错误：添加遥控器失败'
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
            message: '添加遥控器成功'
        })
    });
};

//更新遥控器信息
exports.updateTelecontroller = function (req, res) {
    var user;
    var name;
    var telecontrollerId;

    if (!req.user.current) {
        return res.json({
            errorCode: 2300,
            message: '无法获取当前用户'
        });
    }
    else {
        user = req.user.current;
    }
    if (!req.body.telecontrollerId) {
        return res.json({
            errorCode: 2300,
            message: '未选择要更新的遥控器'
        });
    }
    else {
        telecontrollerId = req.body.telecontrollerId;
    }
    if (!req.body.name) {
        return res.json({
            errorCode: 2300,
            message: '未命名当前遥控器'
        });
    }
    else {
        name = req.body.name;
    }

    var telecontrollerTemp = {};
    telecontrollerTemp['user'] = user;
    telecontrollerTemp['name'] = name;

    async.waterfall([
        //查询遥控器的名称是否已存在
        function (callback) {
            Telecontroller.findOne(telecontrollerTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2300,
                            message: '异常错误：查询遥控器失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2300,
                            message: '待添加的遥控器已存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        //查询待修改的遥控器是否存在
        function (callback) {
            delete telecontrollerTemp.name;
            telecontrollerTemp['_id'] = telecontrollerId;
            Telecontroller.findOne(telecontrollerTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2300,
                            message: '异常错误：查询遥控器失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2300,
                            message: '待修改的遥控器不存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        //更新遥控器
        function (callback) {
            telecontrollerTemp['name'] = name;
            telecontrollerTemp['showComponent'] = false;
            Telecontroller.update({_id: telecontrollerId}, {$set: telecontrollerTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 2300,
                        message: '异常错误：更新遥控器失败'
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
            message: '更新遥控器成功'
        })
    });

};

//查看遥控器列表
exports.getTelecontrollerList = function (req, res) {
    var user;

    if (!req.user.current) {
        return res.json({
            errorCode: 2300,
            message: '无法获取当前用户'
        });
    }
    else {
        user = req.user.current;
    }

    var telecontrollerTemp = {};
    telecontrollerTemp['user'] = user;
    var telecontrollers = [];

    async.waterfall([
        function (callback) {
            Telecontroller.find(telecontrollerTemp)
                .sort({createdTime: -1})
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2300,
                            message: '异常错误：查询遥控器失败'
                        });
                    }
                    else {
                        telecontrollers = result;
                        callback();
                    }
                })
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '查询遥控器成功',
            telecontrollers: telecontrollers
        })
    });
};

//删除遥控器     (附带删除所有红外指令)
exports.deleteTelecontroller = function (req, res) {
    var user;
    var telecontrollerId;

    if (!req.user.current) {
        return res.json({
            errorCode: 2300,
            message: '无法获取当前用户'
        });
    }
    else {
        user = req.user.current;
    }
    if (!req.body.telecontrollerId) {
        return res.json({
            errorCode: 2300,
            message: '未选择要更新的遥控器'
        });
    }
    else {
        telecontrollerId = req.body.telecontrollerId;
    }

    var telecontrollerTemp = {};
    var infraredCommandTemp = {};
    telecontrollerTemp['user'] = user._id;
    infraredCommandTemp['user'] = user._id;
    infraredCommandTemp['telecontroller'] = telecontrollerId;

    async.waterfall([
        //查询待删除的遥控器是否存在
        function (callback) {
            telecontrollerTemp['_id'] = telecontrollerId;
            Telecontroller.findOne(telecontrollerTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2300,
                            message: '异常错误：查询遥控器失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2300,
                            message: '待删除的遥控器不存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        //删除所有的红外指令
        function (callback) {
            //infraredCommmand
            InfraredCommand.remove({telecontroller: telecontrollerId}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 2300,
                        message: '异常错误：删除遥控器包含的红外指令失败'
                    });
                }
                else {
                    callback();
                }
            });
        },
        function (callback) {
            Telecontroller.remove({_id: telecontrollerId}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 2300,
                        message: '异常错误：删除遥控器失败'
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
            message: '删除遥控器成功'
        })
    });
};
