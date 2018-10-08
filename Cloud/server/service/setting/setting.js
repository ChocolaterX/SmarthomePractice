/**
 * <copyright file="setting.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>3/26/2018</date>
 * <summary>
 *
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var SecurityDevice = mongoose.model('SecurityDevice');
var Setting = mongoose.model('Setting');

var validator = require('validator');
var fs = require('fs');
var request = require('request');
var async = require('async');

//设备开启或关闭所有安防报警
exports.setAllSecurityAlarm = function (req, res) {
    var user = req.user.current;
    var setting;

    if (!user) {
        return res.json({
            errorCode: 2200,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.setting) {
        return res.json({
            errorCode: 2200,
            message: '未选择安防报警设置状态'
        });
    }

    setting = req.body.setting;
    var settingTemp = {};
    settingTemp['user'] = user._id;

    async.waterfall([
        //查询当前用户设置记录，如无，则创建；如有，则更新；
        function (callback) {
            Setting.findOne(settingTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2200,
                            message: '异常错误：查询用户安防设置异常'
                        });
                    }
                    else if (result) {
                        if (setting == 'on') {
                            settingTemp['doorInductionAlarm'] = true;
                            settingTemp['infraredInductionAlarm'] = true;
                            settingTemp['lockAlarm'] = true;
                        }
                        else if (setting == 'off') {
                            settingTemp['doorInductionAlarm'] = false;
                            settingTemp['infraredInductionAlarm'] = false;
                            settingTemp['lockAlarm'] = false;
                        }
                        else {
                            return res.json({
                                errorCode: 2200,
                                message: '错误：用户安防设置参数错误'
                            });
                        }

                        Setting.update({_id: result._id}, {$set: settingTemp}, function (err) {
                            if (err) {
                                return res.json({
                                    errorCode: 2200,
                                    message: '异常错误：更新用户安防设置异常'
                                });
                            }
                            else {
                                callback();
                            }
                        });
                    }
                    else {
                        if (setting == 'on') {
                            settingTemp['doorInductionAlarm'] = true;
                            settingTemp['infraredInductionAlarm'] = true;
                            settingTemp['lockAlarm'] = true;
                        }
                        else if (setting == 'off') {
                            settingTemp['doorInductionAlarm'] = false;
                            settingTemp['infraredInductionAlarm'] = false;
                            settingTemp['lockAlarm'] = false;
                        }
                        else {
                            return res.json({
                                errorCode: 2200,
                                message: '错误：用户安防设置参数错误'
                            });
                        }

                        var settingSave = new Setting(settingTemp);
                        settingSave.save(function (err) {
                            if (err) {
                                return res.json({
                                    errorCode: 2200,
                                    message: '异常错误：存储用户安防设置异常'
                                });
                            }
                            else {
                                callback();
                            }
                        });
                    }
                });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '设置用户安防报警成功'
        });
    });
};

//设置开启或关闭门磁报警推送
exports.setDoorInductionAlarm = function (req, res) {
    var user = req.user.current;
    var setting;

    if (!user) {
        return res.json({
            errorCode: 2200,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.setting) {
        return res.json({
            errorCode: 2200,
            message: '未选择门磁报警设置状态'
        });
    }

    setting = req.body.setting;
    var settingTemp = {};
    settingTemp['user'] = user._id;

    async.waterfall([
        //查询当前用户设置记录，如无，则创建；如有，则更新；
        function (callback) {
            Setting.findOne(settingTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2200,
                            message: '异常错误：查询用户门磁报警设置异常'
                        });
                    }
                    else if (result) {
                        if (setting == 'on') {
                            settingTemp['doorInductionAlarm'] = true;
                        }
                        else if (setting == 'off') {
                            settingTemp['doorInductionAlarm'] = false;
                        }
                        else {
                            return res.json({
                                errorCode: 2200,
                                message: '错误：用户门磁报警设置参数错误'
                            });
                        }

                        Setting.update({_id: result._id}, {$set: settingTemp}, function (err) {
                            if (err) {
                                return res.json({
                                    errorCode: 2200,
                                    message: '异常错误：更新用户门磁报警设置异常'
                                });
                            }
                            else {
                                callback();
                            }
                        });
                    }
                    else {
                        if (setting == 'on') {
                            settingTemp['doorInductionAlarm'] = true;
                        }
                        else if (setting == 'off') {
                            settingTemp['doorInductionAlarm'] = false;
                        }
                        else {
                            return res.json({
                                errorCode: 2200,
                                message: '错误：用户门磁报警设置参数错误'
                            });
                        }

                        var settingSave = new Setting(settingTemp);
                        settingSave.save(function (err) {
                            if (err) {
                                return res.json({
                                    errorCode: 2200,
                                    message: '异常错误：存储用户门磁报警设置异常'
                                });
                            }
                            else {
                                callback();
                            }
                        });
                    }
                });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '设置用户门磁报警成功'
        });
    });
};

//设置开启或关闭红外感应报警推送
exports.setInfraredInductionAlarm = function (req, res) {
    var user = req.user.current;
    var setting;

    if (!user) {
        return res.json({
            errorCode: 2200,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.setting) {
        return res.json({
            errorCode: 2200,
            message: '未选择红外报警设置状态'
        });
    }

    setting = req.body.setting;
    var settingTemp = {};
    settingTemp['user'] = user._id;

    async.waterfall([
        //查询当前用户设置记录，如无，则创建；如有，则更新；
        function (callback) {
            Setting.findOne(settingTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2200,
                            message: '异常错误：查询用户红外报警设置异常'
                        });
                    }
                    else if (result) {
                        if (setting == 'on') {
                            settingTemp['infraredInductionAlarm'] = true;
                        }
                        else if (setting == 'off') {
                            settingTemp['infraredInductionAlarm'] = false;
                        }
                        else {
                            return res.json({
                                errorCode: 2200,
                                message: '错误：用户红外报警设置参数错误'
                            });
                        }

                        Setting.update({_id: result._id}, {$set: settingTemp}, function (err) {
                            if (err) {
                                return res.json({
                                    errorCode: 2200,
                                    message: '异常错误：更新用户红外报警设置异常'
                                });
                            }
                            else {
                                callback();
                            }
                        });
                    }
                    else {
                        if (setting == 'on') {
                            settingTemp['infraredInductionAlarm'] = true;
                        }
                        else if (setting == 'off') {
                            settingTemp['infraredInductionAlarm'] = false;
                        }
                        else {
                            return res.json({
                                errorCode: 2200,
                                message: '错误：用户红外报警设置参数错误'
                            });
                        }

                        var settingSave = new Setting(settingTemp);
                        settingSave.save(function (err) {
                            if (err) {
                                return res.json({
                                    errorCode: 2200,
                                    message: '异常错误：存储用户红外报警设置异常'
                                });
                            }
                            else {
                                callback();
                            }
                        });
                    }
                });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '设置用户红外报警成功'
        });
    });
};

//设置开启或关闭门锁报警推送
exports.setLockAlarm = function (req, res) {
    var user = req.user.current;
    var setting;

    if (!user) {
        return res.json({
            errorCode: 2200,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.setting) {
        return res.json({
            errorCode: 2200,
            message: '未选择门锁报警设置状态'
        });
    }

    setting = req.body.setting;
    var settingTemp = {};
    settingTemp['user'] = user._id;

    async.waterfall([
        //查询当前用户设置记录，如无，则创建；如有，则更新；
        function (callback) {
            Setting.findOne(settingTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2200,
                            message: '异常错误：查询用户门锁报警设置异常'
                        });
                    }
                    else if (result) {
                        if (setting == 'on') {
                            settingTemp['lockAlarm'] = true;
                        }
                        else if (setting == 'off') {
                            settingTemp['lockAlarm'] = false;
                        }
                        else {
                            return res.json({
                                errorCode: 2200,
                                message: '错误：用户门锁报警设置参数错误'
                            });
                        }

                        Setting.update({_id: result._id}, {$set: settingTemp}, function (err) {
                            if (err) {
                                return res.json({
                                    errorCode: 2200,
                                    message: '异常错误：更新用户门锁报警设置异常'
                                });
                            }
                            else {
                                callback();
                            }
                        });
                    }
                    else {
                        if (setting == 'on') {
                            settingTemp['lockAlarm'] = true;
                        }
                        else if (setting == 'off') {
                            settingTemp['lockAlarm'] = false;
                        }
                        else {
                            return res.json({
                                errorCode: 2200,
                                message: '错误：用户门锁报警设置参数错误'
                            });
                        }

                        var settingSave = new Setting(settingTemp);
                        settingSave.save(function (err) {
                            if (err) {
                                return res.json({
                                    errorCode: 2200,
                                    message: '异常错误：存储用户门锁报警设置异常'
                                });
                            }
                            else {
                                callback();
                            }
                        });
                    }
                });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '设置用户门锁报警报警成功'
        });
    });
};

//查看用户的安防报警推送设置
exports.checkSecuritySetting = function (req, res) {
    var user = req.user.current;

    if (!user) {
        return res.json({
            errorCode: 2200,
            message: '异常错误：无法取得当前用户信息'
        });
    }

    var settingTemp = {};
    settingTemp['user'] = user._id;

    var doorInductionAlarm, infraredInductionAlarm, lockAlarm;

    async.waterfall([
        //查询用户报警推送设置
        function (callback) {
            Setting.findOne(settingTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2200,
                            message: '异常错误：查询当前用户设置异常'
                        });
                    }
                    else if (result) {
                        if (result.doorInductionAlarm) {
                            doorInductionAlarm = result.doorInductionAlarm;
                        }
                        else {
                            doorInductionAlarm = false;
                        }
                        if (result.infraredInductionAlarm) {
                            infraredInductionAlarm = result.infraredInductionAlarm;
                        }
                        else {
                            infraredInductionAlarm = false;
                        }
                        if (result.lockAlarm) {
                            lockAlarm = result.lockAlarm;
                        }
                        else {
                            lockAlarm = false;
                        }
                        callback();
                    }
                    else {
                        //未初始化过的用户，给出默认值
                        doorInductionAlarm = false;
                        infraredInductionAlarm = false;
                        lockAlarm = false;
                        callback();
                    }
                })
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            doorInductionAlarm: doorInductionAlarm,
            infraredInductionAlarm: infraredInductionAlarm,
            lockAlarm: lockAlarm
        });
    });
};


