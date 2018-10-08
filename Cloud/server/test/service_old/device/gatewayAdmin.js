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


//添加一个新网关到数据库
exports.createGateway = function (req, res) {
    var mac = validator.trim(req.body.mac);
    var password = validator.trim(req.body.password);

    if (!mac) {
        return res.json({
            errorCode: 1700,
            message: '未输入网关MAC地址'
        });
    }
    if (!password) {
        password = '12345678';        //默认密码
    }

    var gatewayTemp = {};
    gatewayTemp['mac'] = mac;

    async.waterfall([
        //查询是否已存在（MAC地址必须唯一）
        function (callback) {
            Gateway.findOne(gatewayTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询网关失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 1700,
                            message: '待添加的网关已存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        //添加
        function (callback) {
            var gatewaySave = new Gateway(gatewayTemp);
            gatewaySave.save(function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：添加网关失败'
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
            message: '添加网关成功'
        })
    });

};

//更新网关
//更新网关信息方法暂时不需要写
exports.updateGateway = function (req, res) {
    //var gatewayId = req.body.gatewayId;
    //var mac = req.body.mac;
    //var password = req.body.password;
    //
    //if (!gatewayId) {
    //    return res.json({
    //        errorCode: 1700,
    //        message: '未选择网关ID'
    //    });
    //}
    //if (!mac) {
    //    return res.json({
    //        errorCode: 1700,
    //        message: '未输入网关MAC地址'
    //    });
    //}
    //if (!password) {
    //    password = '12345678';        //默认密码
    //}
    //
    //var gatewayTemp = {};
    //gatewayTemp['_id'] = gatewayId;
    //
    //async.waterfall([
    //    function(callback){},
    //    function(callback){}
    //],function(callback){
    //
    //});

};

//取得数据库中所有网关列表
exports.getGatewayList = function (req, res) {
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

    var gatewayTemp = {};
    var amount = 0;     //总数
    var gateways = [];

    async.waterfall([
        //统计共有多少个网关
        function (callback) {
            Gateway.count(gatewayTemp, function (err, result) {
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
        //查询网关
        function (callback) {
            Gateway.find(gatewayTemp)
                .sort({createdTime: -1})
                .skip(pageIndex * pageSize)
                .limit(pageSize)
                .populate('user')
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询网关列表失败'
                        })
                    }
                    else {
                        gateways = result;
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
            gateways: gateways
        });
    });
};

//删除网关
exports.deleteGateway = function (req, res) {
    var gatewayId = req.body.gatewayId;

    if (!gatewayId) {
        return res.json({
            errorCode: 1700,
            message: '未选择网关ID'
        });
    }

    var gatewayTemp = {};
    gatewayTemp['_id'] = gatewayId;

    async.waterfall([
        //查询待删除区域是否存在
        function (callback) {
            Gateway.findOne(gatewayTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1600,
                            message: '异常错误：查询待删除网关是否存在失败'
                        })
                    }
                    else if (result) {
                        callback();
                    } else {
                        return res.json({
                            errorCode: 1600,
                            message: '未找到待删除的网关'
                        })
                    }
                });
        },
        //删除
        function (callback) {
            Gateway.remove({_id: gatewayId}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1600,
                        message: '异常错误：删除网关失败'
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
            message: '删除网关成功'
        })
    })
};



