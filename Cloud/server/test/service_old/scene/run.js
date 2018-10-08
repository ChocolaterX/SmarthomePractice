var mongoose = require('../../cloud_db_connect');
var Device = mongoose.model('Device');
var UserDevice = mongoose.model('UserDevice');
var Scene = mongoose.model('Scene');

var validator = require('validator');
var request = require('request');
var schedule = require("node-schedule");
var async = require('async');
var needle = require('needle');
//var log4j = require('log4js').getLogger();
//var jwt = require('jsonwebtoken');

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

var autorunSceneList = [];

getAutorunScene();

//获取自动执行的情景模式，并执行
function getAutorunScene() {
    console.log('autorun scene');

    var sceneTemp = {};
    sceneTemp['type'] = 2;
    Scene.find(sceneTemp)
        .exec(function (err, result) {
            if (err) {
                console.log('\n查找自动执行情景模式出错\n');
            }
            else {
                autorunSceneList = result;
                executeAutorunScene();
            }
        });
}

//执行自动情景模式
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

        rule.hour = 14;
        //rule.hour=dateTemp.getHours();
        rule.minute = 18;
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

