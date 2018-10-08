/**
 * <copyright file="alarm.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>4/11/2018</date>
 * <summary>
 *
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var SecurityDevice = mongoose.model('SecurityDevice');
var SecurityLog = mongoose.model('SecurityLog');
var Setting = mongoose.model('Setting');

var validator = require('validator');
var fs = require('fs');
var request = require('request');
var async = require('async');

var JPush = require('jpush-sdk');
var JPushClient = JPush.buildClient(config.jpush.appKey, config.jpush.masterSecret);


//判断是安防指令时，解析并处理（从网关传来的门磁、红外感应指令）
exports.formatAndHandleInstruction = function (instruction, callbackAll) {
    //console.log('解析并处理安防设备上传的指令');
    //console.log(instruction);

    var formattedResult = {};
    if (!instruction) {
        formattedResult['message'] = '指令为空';
        formattedResult['errorCode'] = 500;
        callbackAll(formattedResult);
    }

    var gatewayMac;
    var securityDeviceMac;

    gatewayMac = instruction.substring(10, 22);
    securityDeviceMac = instruction.substring(28, 44);

    var securityDeviceTemp = {};
    var securityLogTemp = {};
    var settingTemp = {};
    var securityDevice;
    var setting;
    var user;                               //当前报警设备属于哪个用户
    securityDeviceTemp['mac'] = securityDeviceMac;

    var needToSave = true;            //当前是否需要进行存储
    var needToAlram = false;         //当前是否需要进行推送
    var needToCreateSetting = false;    //当前用户没有设置，所以添加一条新设置
    var alarmContent = '';

    async.waterfall([
        //根据设备mac地址获取设备对应类型和设备ID
        function (callback) {
            SecurityDevice.findOne(securityDeviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        console.log('\n异常信息：查找报警设备出错。\n');
                        formattedResult['errorCode'] = 500;
                        formattedResult['message'] = '异常信息：查找报警设备出错。';
                        callbackAll(formattedResult);
                    }
                    else if (result) {
                        if (result.user) {
                            user = result.user;
                            securityDevice = result;
                            callback()
                        }
                        else {
                            console.log('\n错误信息：当前设备不属于任何用户。\n');
                            formattedResult['errorCode'] = 500;
                            formattedResult['message'] = '错误信息：当前设备不属于任何用户。';
                            callbackAll(formattedResult);
                        }
                    }
                    else {
                        console.log('\n错误信息：找不到当前报警设备。\n');
                        formattedResult['errorCode'] = 500;
                        formattedResult['message'] = '错误信息：找不到当前报警设备。';
                        callbackAll(formattedResult);
                    }
                });
        },
        //对于门磁或红外感应
        function (callback) {
            //securityLogTemp['gatewayMac'] = gatewayMac;
            securityLogTemp['securityDeviceMac'] = securityDeviceMac;
            securityLogTemp['type'] = securityDevice.type;
            securityLogTemp['user'] = securityDevice.user;
            securityLogTemp['securityDevice'] = securityDevice._id;

            SecurityLog.find(securityLogTemp)
                .sort({createdTime: -1})
                .limit(1)
                .exec(function (err, result) {
                    if (err) {
                        console.log('异常信息：获取安防记录异常。');
                        formattedResult['errorCode'] = 500;
                        formattedResult['message'] = '异常信息：获取安防记录异常。';
                        callbackAll(formattedResult);
                    }
                    else if (!result) {           //该设备无最新的安防记录，故直接存储
                        callback();
                    }
                    else {
                        if (instruction.substring(50, 52) == '00') {
                            if (result[0].state == 0) {
                                needToSave = false;
                            }
                            else if (result[0].state == 1) {
                                needToSave = true;
                            }
                            else {
                                console.log('异常信息：门磁记录异常。');
                                formattedResult['errorCode'] = 500;
                                formattedResult['message'] = '异常信息：门磁记录异常。';
                                callbackAll(formattedResult);
                            }
                        }
                        else if (instruction.substring(50, 52) == '00') {
                            if (result[0].state == 1) {
                                needToSave = false;
                            }
                            else if (result[0].state == 0) {
                                needToSave = true;
                            }
                            else {
                                console.log('异常信息：门磁记录异常。');
                                formattedResult['errorCode'] = 500;
                                formattedResult['message'] = '异常信息：门磁记录异常。';
                                callbackAll(formattedResult);
                            }
                        }
                        callback();
                    }
                });
        },
        //对于门磁或红外感应设备，将记录存入对应数据库
        function (callback) {
            securityLogTemp['gatewayMac'] = gatewayMac;
            securityLogTemp['securityDeviceMac'] = securityDeviceMac;
            securityLogTemp['type'] = securityDevice.type;
            securityLogTemp['user'] = securityDevice.user;
            securityLogTemp['securityDevice'] = securityDevice._id;
            var securityLogSave;
            if (instruction.substring(50, 52) == '00') {
                securityLogTemp['state'] = 0;
                if (securityDevice.type == 1) {
                    alarmContent = '消息：门磁 ' + securityDevice.name + '关闭';
                }
                if (securityDevice.type == 2) {
                    alarmContent = '消息：红外感应 ' + securityDevice.name + '无人';
                }
                if (securityDevice.type == 3) {
                    alarmContent = '消息：门锁 ' + securityDevice.name + '关闭';
                }
                if (needToSave) {
                    securityLogSave = new SecurityLog(securityLogTemp);
                    securityLogSave.save(function (err) {
                        if (err) {
                            console.log('异常信息：存储安防记录异常。');
                            formattedResult['errorCode'] = 500;
                            formattedResult['message'] = '异常信息：存储安防记录异常。';
                            callbackAll(formattedResult);
                        }
                        else {
                            callback();
                        }
                    });
                }
                else {
                    formattedResult['errorCode'] = 0;
                    formattedResult['message'] = '未发生状态变化，不需存储安防记录。';
                    callbackAll(formattedResult);
                }
            }
            else if (instruction.substring(50, 52) == '01') {
                securityLogTemp['state'] = 1;
                if (securityDevice.type == 1) {
                    alarmContent = '消息：门磁 ' + securityDevice.name + '打开';
                }
                if (securityDevice.type == 2) {
                    alarmContent = '消息：红外感应 ' + securityDevice.name + '有人';
                }
                if (securityDevice.type == 3) {
                    alarmContent = '消息：门锁 ' + securityDevice.name + '打开';
                }
                if (needToSave) {
                    securityLogSave = new SecurityLog(securityLogTemp);
                    securityLogSave.save(function (err) {
                        if (err) {
                            console.log('异常信息：存储安防记录异常。');
                            formattedResult['errorCode'] = 500;
                            formattedResult['message'] = '异常信息：存储安防记录异常。';
                            callbackAll(formattedResult);
                        }
                        else {
                            callback();
                        }
                    });
                }
                else {
                    formattedResult['errorCode'] = 0;
                    formattedResult['message'] = '未发生状态变化，不需存储安防记录。';
                    callbackAll(formattedResult);
                }
            }
            else {
                console.log('\n错误信息：指令所报状态异常。\n');
                formattedResult['errorCode'] = 500;
                formattedResult['message'] = '错误信息：指令所报状态异常。';
                callbackAll(formattedResult);
            }
        },
        function (callback) {           //获取当前用户对安防的设置，决定是否需要推送报警消息
            settingTemp['user'] = user;
            Setting.findOne(settingTemp)
                .exec(function (err, result) {
                    if (err) {
                        console.log('异常信息：获取安防设置异常。');
                        formattedResult['errorCode'] = 500;
                        formattedResult['message'] = '异常信息：获取安防设置异常。';
                        callbackAll(formattedResult);
                    }
                    else if (result) {
                        setting = result;
                        if (securityDevice.type == 1) {
                            if (result.doorInductionAlarm) {
                                needToAlram = true;
                            }
                            else {
                                needToAlram = false;
                            }
                        }
                        else if (securityDevice.type == 2) {
                            if (result.infraredInductionAlarm) {
                                needToAlram = true;
                            }
                            else {
                                needToAlram = false;
                            }
                        }
                        else if (securityDevice.type == 3) {
                            if (result.lockAlarm) {
                                needToAlram = true;
                            }
                            else {
                                needToAlram = false;
                            }
                        }
                        callback();
                    } else {
                        needToCreateSetting = true;
                        needToAlram = true;
                        callback();
                    }
                });
        },
        //创建一条新的设置（如有必要）
        function (callback) {
            if (needToCreateSetting) {
                settingTemp['doorInductionAlarm'] = true;
                settingTemp['infraredInductionAlarm'] = true;
                settingTemp['lockAlarm'] = true;
                var settingSave = new Setting(settingTemp);
                settingSave.exec(function (err) {
                    if (err) {
                        console.log('异常信息：创建安防设置异常。');
                        formattedResult['errorCode'] = 500;
                        formattedResult['message'] = '异常信息：创建安防设置异常。';
                        callbackAll(formattedResult);
                    }
                    else {
                        callback();
                    }
                });
            }
            else {
                callback();
            }
        },
        //推送报警消息
        function (callback) {
            if (!needToAlram) {          //无须推送
                callback();
            }
            else {
                console.log('进入门磁推送');

                //var user = '58de05b91cfc5d304b6809c3';

                //将alarmContent填入
                JPushClient.push().setPlatform(JPush.ALL)
                    //.setAudience(JPush.ALL)
                    .setAudience(JPush.alias('' + user + ''))
                    // .setNotification('华系签家',JPush.android('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}), JPush.ios('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}))
                    //  .setNotification(JPush.android('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}))
                    .setNotification(JPush.android('' + alarmContent + '', config.jpush.title, 1, {'user': '' + 'test user11' + ''}),
                    JPush.ios('' + 'test content2' + '', 'sound', '+1'))
                    .setMessage('' + alarmContent + '', config.jpush.title, 'system', {'user': '' + 'test user12' + ''})
                    // .setOptions(null,null,null,true,null)
                    .send(function (err, resp) {
                        if (err) {
                            console.log('JPush推送异常');
                            console.log(err);
                            // console.log('push fail ' + JSON.parse(err.response).error.message);
                            // return cb(JSON.parse(err.response).error.message, null);
                            formattedResult['errorCode'] = 500;
                            formattedResult['message'] = '异常错误：JPush推送异常';
                            callbackAll(formattedResult);
                        } else {
                            console.log('JPush推送成功-------');
                            callback();
                        }
                    });
            }
        }
    ], function (callback) {
        formattedResult['errorCode'] = 0;
        formattedResult['message'] = '报警消息处理完成。';
        callbackAll(formattedResult);
    });
};


//测试成功
//
//JPushClient.push().setPlatform(JPush.ALL)
//    //.setAudience(JPush.ALL)
//    .setAudience(JPush.alias('' + user + ''))
//    // .setNotification('华系签家',JPush.android('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}), JPush.ios('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}))
//    //  .setNotification(JPush.android('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}))
//    .setNotification(JPush.android('' + 'test content' + '', config.jpush.title, 1, {'user': '' + 'test user' + ''}),
//    JPush.ios('' + 'test content' + '', 'sound', '+1'))
//    .setMessage('' + 'test content' + '', config.jpush.title, 'system', {'user': '' + 'test user' + ''})
//    // .setOptions(null,null,null,true,null)
//    .send(function (err, resp) {
//        if (err) {
//            console.log('JPush推送异常');
//            console.log(err);
//            // console.log('push fail ' + JSON.parse(err.response).error.message);
//            // return cb(JSON.parse(err.response).error.message, null);
//            result['errorCode'] = 500;
//            result['message'] = '异常错误：JPush推送异常';
//            callbackAll(result);
//        } else {
//            console.log('JPush推送成功-------');
//            callback();
//        }
//    });
