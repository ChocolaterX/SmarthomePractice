/**
 * <copyright file="run.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>2/27/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var SoundKeyword = mongoose.model('SoundKeyword');
var Device = mongoose.model('Device');
var InfraredCommand = mongoose.model('InfraredCommand');
var CommandModule = require('../device/command');
var SceneModule = require('../scene/scene');
var gatewayModule = require('../gateway/gateway');

var validator = require('validator');
var fs = require('fs');
var request = require('request');
var async = require('async');

exports.recognizeAndRunSound = function (req, res) {

    var user = req.user.current;
    var content;

    if (!user) {
        return res.json({
            errorCode: 2000,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.content) {
        return res.json({
            errorCode: 2000,
            message: '未传入语音内容'
        });
    }
    else {
        content = validator.trim(req.body.content);
    }

    var soundKeywordTemp = {};
    var soundKeywords = [];
    var soundKeywordMatched = {};
    var deviceTemp = {};
    var infraredCommandTemp = {};
    var gateways = [];                              //该用户的所有网关
    var device = {};                                //待控制的设备

    soundKeywordTemp['user'] = user._id;

    async.waterfall([
        //查看语音识别结果与语音关键词对应关系
        function (callback) {
            SoundKeyword.find(soundKeywordTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询语音关键词异常'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2000,
                            message: '当前用户未设置语音关键词'
                        });
                    }
                    else {
                        for (var i = 0; i < result.length; i++) {
                            //连续说出两个关键词时，会报错; callback was already called.
                            if (content.indexOf(result[i].keyword) >= 0) {
                                soundKeywordMatched = result[i];
                                break;
                            }
                        }
                        callback();
                    }
                });
        },
        //执行相应的操作或情景模式
        function (callback) {
            if (soundKeywordMatched.type == 1) {
                deviceTemp['user'] = user;
                deviceTemp['type'] = 0;
                Device.find(deviceTemp)
                    .sort({createdTime: -1})
                    .exec(function (err, result) {
                        if (err) {
                            return res.json({
                                errorCode: 2000,
                                message: '异常错误：查询网关失败'
                            });
                        }
                        else if (result) {
                            //console.log('gateways:');
                            //console.log(result);
                            gateways = result;
                            //executeDeviceCommand(device, gateways, command);
                            callback();
                        }
                        else {
                            return res.json({
                                errorCode: 2000,
                                message: '当前用户未添加网关'
                            });
                        }
                    });
                //executeDeviceCommand(device, gateways, command);
            }
            else if (soundKeywordMatched.type == 2) {
                SceneModule.runSceneBackground(user, soundKeywordMatched.scene);
                callback();
            }
            else if (soundKeywordMatched.type == 3) {
                infraredCommandTemp['_id'] = soundKeywordMatched.infraredCommand;
                infraredCommandTemp['user'] = user;
                InfraredCommand.findOne(infraredCommandTemp)
                    .exec(function (err, result) {
                        if (err) {
                            return res.json({
                                errorCode: 2000,
                                message: '查询红外指令失败'
                            });
                        }
                        else if (!result) {
                            return res.json({
                                errorCode: 2000,
                                message: '待执行的红外指令不存在'
                            });
                        }
                        else {
                            if (!result.command) {
                                return res.json({
                                    errorCode: 2000,
                                    message: '红外指令有误'
                                });
                            }
                            else {
                                gatewayModule.writeCommand(result.command, 'infraredCommand');
                            }
                        }
                    });
                callback();
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '当前语音数据异常'
                });
            }
        },
        //查询绑定的控制设备
        function (callback) {
            if (soundKeywordMatched.type == 2 || soundKeywordMatched.type == 3) {
                callback();
            }
            else {
                delete deviceTemp.type;
                deviceTemp['_id'] = soundKeywordMatched.device;
                Device.findOne(deviceTemp)
                    .exec(function (err, result) {
                        if (err) {
                            return res.json({
                                errorCode: 2000,
                                message: '异常错误：查询设备失败'
                            });
                        }
                        else if (result) {
                            device = result;
                            CommandModule.executeDeviceCommand(device, gateways, soundKeywordMatched.command);
                            callback();
                        }
                        else {
                            return res.json({
                                errorCode: 2000,
                                message: '异常错误：未找到待控制的设备'
                            });
                        }
                    });
            }
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '执行语音识别控制成功'
        })
    });
};

