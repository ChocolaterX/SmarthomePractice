var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var Device = mongoose.model('Device');
var Gateway = mongoose.model('Gateway');
var UserDevice = mongoose.model('UserDevice');
var User = mongoose.model('User');
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

//为家庭添加网关
exports.addGateway = function (req, res) {
    var user = req.user.current;
    var gatewayId = req.body.gatewayId;
    var name = validator.trim(req.body.name);

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!gatewayId) {
        return res.json({
            errorCode: 1700,
            message: '未选择待添加的网关'
        });
    }
    if (!name) {
        return res.json({
            errorCode: 1700,
            message: '未输入设备名称'
        });
    }

    var gatewayTemp = {};
    gatewayTemp['_id'] = gatewayId;

    async.waterfall([
        //查询网关是否存在，并且是否已被占用
        function (callback) {
            Gateway.findOne(gatewayTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询待添加网关失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '找不到待添加的网关'
                        });
                    }
                    else if (result.user) {
                        return res.json({
                            errorCode: 1700,
                            message: '待添加的网关已被使用'
                        });
                    }
                    else {
                        gatewayTemp['mac'] = result.mac;
                        callback();
                    }
                });
        },
        //添加
        function (callback) {
            gatewayTemp['user'] = user._id;
            gatewayTemp['name'] = name;
            Gateway.update({_id: gatewayId}, {$set: gatewayTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：添加网关失败'
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
            message: '添加网关成功'
        })
    });
};

//更改家庭网关信息（名称等）
exports.updateGateway = function (req, res) {
    var user = req.user.current;
    var gatewayId = req.body.gatewayId;
    var name = validator.trim(req.body.name);

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!gatewayId) {
        return res.json({
            errorCode: 1700,
            message: '未选择待添加的网关'
        });
    }
    if (!name) {
        return res.json({
            errorCode: 1700,
            message: '未输入设备名称'
        });
    }

    var gatewayTemp = {};
    gatewayTemp['_id'] = gatewayId;
    gatewayTemp['user'] = user._id;

    async.waterfall([
        //查询网关是否存在，并且是否已被占用
        function (callback) {
            Gateway.findOne(gatewayTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询待添加网关失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '找不到待添加的网关'
                        });
                    }
                    else {
                        gatewayTemp['mac'] = result.mac;
                        callback();
                    }
                });
        },
        //更新
        function (callback) {
            gatewayTemp['name'] = name;
            Gateway.update({_id: gatewayId}, {$set: gatewayTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：添加网关失败'
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
            message: '更新网关成功'
        })
    });
};

//查看家庭所有网关
exports.getGatewayList = function (req, res) {
    var user = req.user.current;

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }

    var gatewayTemp = {};
    gatewayTemp['user'] = user._id;

    Gateway.find(gatewayTemp)
        .exec(function (err, result) {
            if (err) {

            }
            else {
                return res.json({
                    errorCode: 0,
                    gatewayList: result
                })
            }
        });
};

//删除网关（从家庭中删除）
//删除网关需要先删除绑定网关的设备，尚未编写该部分代码
exports.deleteGateway = function (req, res) {
    var user = req.user.current;
    var gatewayId = req.body.gatewayId;

    if (!user) {
        return res.json({
            errorCode: 1700,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!gatewayId) {
        return res.json({
            errorCode: 1700,
            message: '未选择待删除的网关'
        });
    }

    var gatewayTemp = {};
    gatewayTemp['_id'] = gatewayId;
    gatewayTemp['user'] = user._id;

    async.waterfall([
        //查询网关是否存在，并且是否已被占用
        function (callback) {
            Gateway.findOne(gatewayTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询待删除网关失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '找不到待添加的网关'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
        //删除网关
        function (callback) {
            gatewayTemp['name'] = null;
            gatewayTemp['user'] = null;
            Gateway.update({_id: gatewayId}, {$set: gatewayTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：删除网关失败'
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
            message: '删除网关成功'
        })
    });


};