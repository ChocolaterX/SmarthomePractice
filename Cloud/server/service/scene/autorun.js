/**
 * <copyright file="run.js" company="Run">
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
var Device = mongoose.model('Device');
var Scene = mongoose.model('Scene');
var User = mongoose.model('User');
var CommandModule = require('../device/command');

var validator = require('validator');
var request = require('request');
var schedule = require("node-schedule");
var async = require('async');
//var needle = require('needle');
//var log4j = require('log4js').getLogger();
//var jwt = require('jsonwebtoken');


var autorunSceneList = [];

//getAutorunScene();
//每一次更新情景模式都需要

//获取自动执行的情景模式
function getAutorunScene() {
    console.log('\n\nautorun scene\n\n');

    var sceneTemp = {};
    var deviceTemp = {};
    sceneTemp['type'] = 2;

    var sceneList = [];
    var userList = [];
    var gateways = [];          //用户（们）的网关
    var devices = [];           //待执行的设备
    var i, j, k, l, m;

    async.waterfall([
        //查找所有自动执行情景模式
        function (callback) {
            Scene.find(sceneTemp)
                .exec(function (err, result) {
                    if (err) {
                        console.log('\n查找自动执行情景模式出错\n');
                    }
                    else {
                        sceneList = result;
                        callback();
                    }
                });
        },
        //根据用户取得网关
        function (callback) {
            console.log();
            var userExists = false;
            for (i = 0; i < sceneList.length; i++) {
                userExists = false;
                for (j = 0; j < userList.length; j++) {
                    if (userList[j] == (sceneList[i].user + '')) {
                        //已存在
                        userExists = true;
                        break;
                    }
                }
                if (!userExists) {
                    userList.push(sceneList[i].user);
                }
            }
            //[ 58de05b91cfc5d304b6809c3, 5ad6dba4de7b531e2cfa84db ]

            deviceTemp['type'] = 0;
            //Device.find({_id: {$in: sceneDeviceIds}}, function (err, result) {
            Device.find({user: {$in: userList}, type: 0}, function (err, result) {
                if (err) {
                    console.log('异常错误：查询用户网关失败');
                    return;
                }
                else if (!result) {
                    console.log('未查询到网关，无法执行');
                    return;
                }
                else {
                    gateways = result;
                    callback();
                }
            });
        },
        //取得控制设备详细信息
        function (callback) {
            var deviceIds = [];
            for (i = 0; i < sceneList.length; i++) {
                for (j = 0; j < sceneList[i].commands.length; j++) {
                    deviceIds.push(sceneList[i].commands[j].device + '');
                }
            }
            Device.find({_id: {$in: deviceIds}}, function (err, result) {
                if (err) {
                    console.log('异常错误：查询用户设备失败');
                    return;
                }
                else if (!result) {
                    console.log('未查询到设备，无法执行');
                    return;
                }
                else {
                    devices = result;
                    callback();
                }
            });
        },
        //执行
        function (callback) {
            var count = 0;
            var rule;
            var job;
            //console.log('abc');
            //console.log(userList);
            //console.log(gateways);
            //console.log(sceneList);
            //console.log(devices);
            //console.log('12345');
            var gatewaysTemp = [];
            for (i = 0; i < userList.length; i++) {        //用户
                //console.log('i:' + i);
                gatewaysTemp = [];
                for (j = 0; j < sceneList.length; j++) {
                    //console.log('j:' + j);
                    if (userList[i] == (sceneList[j].user + '')) {
                        //console.log('用户匹配成功');
                        for (k = 0; k < gateways.length; k++) {
                            if ((gateways[k].user + '') == userList[i]) {
                                gatewaysTemp.push(gateways[k]);
                            }
                        }
                        for (k = 0; k < sceneList[j].commands.length; k++) {
                            for (l = 0; l < devices.length; l++) {
                                if ((sceneList[j].commands[k].device + '') == (devices[l]._id + '')) {      //执行
                                    if (devices[l].type == 3) {
                                        switch (sceneList[j].commands[k].command) {
                                            case 'Turn00':
                                                CommandModule.executeDeviceCommand(devices[l], gatewaysTemp, 'TurnOffLeft');
                                                CommandModule.executeDeviceCommand(devices[l], gatewaysTemp, 'TurnOffRight');
                                                break;
                                            case 'Turn01':
                                                CommandModule.executeDeviceCommand(devices[l], gatewaysTemp, 'TurnOffLeft');
                                                CommandModule.executeDeviceCommand(devices[l], gatewaysTemp, 'TurnOnRight');
                                                break;
                                            case 'Turn10':
                                                CommandModule.executeDeviceCommand(devices[l], gatewaysTemp, 'TurnOnLeft');
                                                CommandModule.executeDeviceCommand(devices[l], gatewaysTemp, 'TurnOffRight');
                                                break;
                                            case 'Turn11':
                                                CommandModule.executeDeviceCommand(devices[l], gatewaysTemp, 'TurnOnLeft');
                                                CommandModule.executeDeviceCommand(devices[l], gatewaysTemp, 'TurnOnRight');
                                                break;
                                        }
                                        count++;
                                    }
                                    else {
                                        CommandModule.executeDeviceCommand(devices[l], gatewaysTemp, sceneList[j].commands[k].command);
                                        count++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            console.log(count);
            callback();
        }
    ], function (callback) {

        //for(i=0;i<sceneList.length)

    });


}

//取得自动情景模式列表
//根据用户ID取得网关和详细设备
//取得设备
//解析命令
//执行


//执行情景模式（自动模式）
function executeAutorunScene() {
    var i = 0;      //iterator
    var j = 0;      //iterator
    var k = 0;      //iterator
    var dateTemp = new Date();
    var job;        //定时任务
    var sceneTemp = {};
    for (i = 0; i < autorunSceneList.length; i++) {
        dateTemp = new Date(autorunSceneList[i].executeTime);

        console.log(autorunSceneList[i]);

        if (( !autorunSceneList[i].repeat) || (autorunSceneList[i].repeat.length != 7)) {
            console.log('重复日期出错');
            return;
        }

        var rule = new schedule.RecurrenceRule();
        //取得执行的日期（周一到周日）
        rule.dayOfWeek = [];
        for (j = 0; j < autorunSceneList[i].repeat.length; j++) {
            if (autorunSceneList[i].repeat[j]) {
                rule.dayOfWeek.push(j);
            }
        }

        rule.hour = 16;
        //rule.hour=dateTemp.getHours();
        rule.minute = 27;
        //rule.minute=dateTemp.getMinutes();

        sceneTemp = autorunSceneList[i];
        job = schedule.scheduleJob(rule, function () {
            console.log("执行设备控制");
            //console.log(sceneTemp);
            for (k = 0; k < sceneTemp.commands.length; k++) {
                autoBackCommand(sceneTemp.commands[k].device, sceneTemp.commands[k].command)
            }
        });
    }
}

//供自动情景模式分条调用执行设备控制命令
function autoBackCommand(deviceId, command) {
    console.log(deviceId);
    console.log(command);
}

//供情景模式分条调用执行设备控制命令
exports.backCommand = function (deviceId, command) {
    console.log(deviceId);
    console.log(command);
};

//执行情景模式（手动模式）
exports.runScene = function (scene) {

};

//每秒执行一次 start
//var rule = new schedule.RecurrenceRule();
//var times = [];
//for (var i = 1; i < 60; i++) {
//    times.push(i);
//}
//rule.second = times;
//var c = 0;
//var j = schedule.scheduleJob(rule, function () {
//    c++;
//    console.log(c);
//
//    var userDeviceTemp = {};
//    userDeviceTemp['user'] = '58de05b91cfc5d304b6809c3';
//    UserDevice.find(userDeviceTemp)
//        .sort({createdTime: -1})
//        .populate('device')
//        .exec(function (err, result) {
//            if (err) {
//                return res.json({
//                    errorCode: 1700,
//                    message: '异常错误：查询用户家庭设备失败'
//                });
//            }
//            else if (!result) {
//                return res.json({
//                    errorCode: 1700,
//                    message: '当前家庭无设备'
//                });
//            }
//            else {
//                console.log(result);
//            }
//        });
//});
//每秒执行一次 end

//根据时间执行 start
//var rule = new schedule.RecurrenceRule();
//rule.dayOfWeek = [0, new schedule.Range(1, 6)];
//rule.hour = 14;
//rule.minute = 52;
//var j = schedule.scheduleJob(rule, function(){
//    console.log("执行任务");
//});
//根据时间执行 end


