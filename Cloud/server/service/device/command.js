/**
 * <copyright file="device.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>12/19/2017</date>
 * <summary>
 * 整理所有控制设备的命令
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var Device = mongoose.model('Device');
var User = mongoose.model('User');
var validator = require('validator');
var gatewayModule = require('../gateway/gateway');
var fs = require('fs');
var async = require('async');

//控制设备
exports.command = function (req, res) {
    var user = req.user.current;
    var deviceId;
    var deviceMac;
    var command;

    if (!user) {
        return res.json({
            errorCode: 1800,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.deviceId) {
        return res.json({
            errorCode: 1700,
            message: '未传入设备ID'
        });
    }
    else {
        deviceId = validator.trim(req.body.deviceId);
    }
    if (!req.body.mac) {
        return res.json({
            errorCode: 1700,
            message: '未传入设备mac地址'
        });
    }
    else {
        deviceMac = validator.trim(req.body.mac);
    }
    if (!req.body.command) {
        return res.json({
            errorCode: 1700,
            message: '未传入设备命令'
        });
    }
    else {
        command = validator.trim(req.body.command);
    }

    var deviceTemp = {};
    deviceTemp['_id'] = deviceId;
    deviceTemp['mac'] = deviceMac;
    deviceTemp['user'] = user._id;

    var gateways = [];      //该用户的所有网关
    var device = {};        //待控制的设备

    async.waterfall([
        //查询待控制设备是否存在
        function (callback) {
            Device.findOne(deviceTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询设备失败'
                        });
                    }
                    else if (result) {
                        device = result;
                        callback();
                    }
                    else {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：未找到待控制的设备'
                        });
                    }
                })
        },
        //查询该用户一共有多少个网关，就需要发送多少条命令
        function (callback) {
            //deviceTemp._id = null;
            //deviceTemp.mac = null;
            delete deviceTemp._id;
            delete deviceTemp.mac;
            deviceTemp['type'] = 0;
            Device.find(deviceTemp)
                .sort({createdTime: -1})
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询网关失败'
                        });
                    }
                    else if (result) {
                        gateways = result;
                        callback();
                    }
                    else {
                        return res.json({
                            errorCode: 1700,
                            message: '当前用户未添加网关，无法控制'
                        });
                    }
                });
        },
        //更新数据库中设备的状态信息
        function (callback) {
            delete deviceTemp.type;
            deviceTemp['_id'] = deviceId;
            deviceTemp['mac'] = deviceMac;

            switch (device.type) {
                case 0:
                    break;
                case 1:
                    if (command == 'Open') {
                        deviceTemp['state'] = 'Curtain0';
                    }
                    else if (command == 'Close') {
                        deviceTemp['state'] = 'Curtain100';
                    }
                    else {

                    }
                    break;
                case 2:
                    if (command == 'PowerOn') {
                        deviceTemp['state'] = 'SocketOn';
                    }
                    else if (command == 'PowerOff') {
                        deviceTemp['state'] = 'SocketOff';
                    }
                    else {

                    }
                    break;
                case 3:
                    if (command == 'TurnOnLeft') {
                        if ((device.state == "Switch00") || (device.state == "Switch10")) {
                            deviceTemp['state'] = 'Switch10';
                        }
                        if ((device.state == "Switch01") || (device.state == "Switch11")) {
                            deviceTemp['state'] = 'Switch11';
                        }
                    }
                    else if (command == 'TurnOffLeft') {
                        if ((device.state == "Switch00") || (device.state == "Switch10")) {
                            deviceTemp['state'] = 'Switch00';
                        }
                        if ((device.state == "Switch01") || (device.state == "Switch11")) {
                            deviceTemp['state'] = 'Switch01';
                        }
                    }
                    else if (command == 'TurnOnRight') {
                        if ((device.state == "Switch00") || (device.state == "Switch01")) {
                            deviceTemp['state'] = 'Switch01';
                        }
                        if ((device.state == "Switch10") || (device.state == "Switch11")) {
                            deviceTemp['state'] = 'Switch11';
                        }
                    }
                    else if (command == 'TurnOffRight') {
                        if ((device.state == "Switch00") || (device.state == "Switch01")) {
                            deviceTemp['state'] = 'Switch00';
                        }
                        if ((device.state == "Switch10") || (device.state == "Switch11")) {
                            deviceTemp['state'] = 'Switch10';
                        }
                    }
                    else {

                    }
                    break;
            }

            Device.update({_id: deviceId}, {$set: deviceTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1700,
                        message: '异常错误：更新设备状态信息异常'
                    });
                }
                else {
                    callback();
                }
            });
        }
    ], function (callback) {
        executeDeviceCommand(device, gateways, command);
        return res.json({
            errorCode: 0,
            message: '控制成功'
        });
    });
};

/**
 * 执行设备控制
 * 先进行格式转化，再进行控制
 * @param device    待控制设备
 * @param gateways  网关数组
 * @param command   设备命令
 */
exports.executeDeviceCommand = function (device, gateways, command) {
    var i;
    var instructionsForExecute = [];
    var formattedInstruction;
    for (i = 0; i < gateways.length; i++) {
        formattedInstruction = '';
        formattedInstruction = formatDeviceCommand(gateways[i].mac, device.mac, device.type, command);
        instructionsForExecute.push(formattedInstruction);
    }
    for (i = 0; i < instructionsForExecute.length; i++) {
        gatewayModule.writeCommand(instructionsForExecute[i]);
    }
};

function executeDeviceCommand(device, gateways, command) {
    var i;
    var instructionsForExecute = [];
    var formattedInstruction;
    for (i = 0; i < gateways.length; i++) {
        formattedInstruction = '';
        formattedInstruction = formatDeviceCommand(gateways[i].mac, device.mac, device.type, command);
        instructionsForExecute.push(formattedInstruction);
    }
    //console.log(instructionsForExecute.length);
    for (i = 0; i < instructionsForExecute.length; i++) {
        gatewayModule.writeCommand(instructionsForExecute[i]);
    }
}

/**
 * 控制命令格式转化
 * params:
 */
exports.formatDeviceCommand = function (gatewayMac, deviceMac, deviceType, deviceCommand) {
    var instruction = '';
    var cmd0;           //开关10，窗帘11
    var cmd1;
    var d11;

    //根据deviceType和deviceCommand来判断cmd0、cmd1、d11位

    //test 打开开关
    cmd0 = '10';
    cmd1 = '01';
    d11 = '01';

    instruction = '00150001' + gatewayMac + '01' + cmd0 + cmd1 + deviceMac + '08' + d11;
    var parityByte = checkParity(instruction);
    instruction = 'FC' + instruction + parityByte;

    console.log('formatDeviceCommand:');
    console.log('instruction:' + instruction);
    return instruction;
};

function formatDeviceCommand(gatewayMac, deviceMac, deviceType, deviceCommand) {
    var instruction = '';
    var cmd0;           //开关10，窗帘11
    var cmd1;
    var d10;
    var d11;

    //根据deviceType和deviceCommand来判断cmd0、cmd1、d10、d11位

    //test 打开开关
    //cmd0 = '10';
    cmd1 = '01';

    switch (deviceCommand) {
        case 'TurnOffLeft':
            cmd0 = '10';
            d10 = '08';
            d11 = '01';
            break;
        case 'TurnOnLeft':
            cmd0 = '10';
            d10 = '08';
            d11 = '00';
            break;
        case 'TurnOffRight':
            cmd0 = '10';
            d10 = '09';
            d11 = '01';
            break;
        case 'TurnOnRight':
            cmd0 = '10';
            d10 = '09';
            d11 = '00';
            break;
        case 'Open':
            cmd0 = '11';
            d10 = '08';
            d11 = '04';
            break;
        case 'Close':
            cmd0 = '11';
            d10 = '08';
            d11 = '05';
            break;
        case 'PowerOn':
            cmd0 = '10';
            d10 = '01';
            d11 = '01';
            break;
        case 'PowerOff':
            cmd0 = '10';
            d10 = '01';
            d11 = '00';
            break;
        case 'Lock':
            cmd0 = '40';
            d10 = '08';
            d11 = '00';
            break;
        case 'Unlock':
            cmd0 = '40';
            d10 = '08';
            d11 = '01';
            break;

    }

    instruction = '00150001' + gatewayMac + '01' + cmd0 + cmd1 + deviceMac + d10 + d11;
    var parityByte = checkParity(instruction);
    instruction = 'FC' + instruction + parityByte;

    //console.log('formatDeviceCommand:');
    console.log('instruction:' + instruction);
    return instruction;
}

//BCC奇偶校验位
function checkParity(instruction) {
    //00 15 00 01 30 EB 1F 03 D0 DD 01 10 01 00 12 4B 00 0F F6 AA 36 08 01
    //FB
    var length = instruction.length;
    var checkResult = hexStrToDec(instruction.substr(0, 2));
    for (var i = 2; i < length; i = i + 2) {
        checkResult = checkResult ^ hexStrToDec(instruction.substr(i, 2));
    }

    return decToHexStr(checkResult);
}

//16进制（字符串）转成10进制数字
function hexStrToDec(str) {
    var num = 0;
    switch (str.charAt(0)) {
        case '0':
            num += 0;
            break;
        case '1':
            num += 16;
            break;
        case '2':
            num += 32;
            break;
        case '3':
            num += 48;
            break;
        case '4':
            num += 64;
            break;
        case '5':
            num += 80;
            break;
        case '6':
            num += 96;
            break;
        case '7':
            num += 112;
            break;
        case '8':
            num += 128;
            break;
        case '9':
            num += 144;
            break;
        case 'A':
            num += 160;
            break;
        case 'B':
            num += 176;
            break;
        case 'C':
            num += 192;
            break;
        case 'D':
            num += 208;
            break;
        case 'E':
            num += 224;
            break;
        case 'F':
            num += 240;
            break;
        case 'a':
            num += 160;
            break;
        case 'b':
            num += 176;
            break;
        case 'c':
            num += 192;
            break;
        case 'd':
            num += 208;
            break;
        case 'e':
            num += 224;
            break;
        case 'f':
            num += 240;
            break;
        default:
            break;
    }
    switch (str.charAt(1)) {
        case '0':
            num += 0;
            break;
        case '1':
            num += 1;
            break;
        case '2':
            num += 2;
            break;
        case '3':
            num += 3;
            break;
        case '4':
            num += 4;
            break;
        case '5':
            num += 5;
            break;
        case '6':
            num += 6;
            break;
        case '7':
            num += 7;
            break;
        case '8':
            num += 8;
            break;
        case '9':
            num += 9;
            break;
        case 'A':
            num += 10;
            break;
        case 'B':
            num += 11;
            break;
        case 'C':
            num += 12;
            break;
        case 'D':
            num += 13;
            break;
        case 'E':
            num += 14;
            break;
        case 'F':
            num += 15;
            break;
        case 'a':
            num += 10;
            break;
        case 'b':
            num += 11;
            break;
        case 'c':
            num += 12;
            break;
        case 'd':
            num += 13;
            break;
        case 'e':
            num += 14;
            break;
        case 'f':
            num += 15;
            break;
        default:
            break;
    }
    return num;
}

//10进制数字转成16进制（字符串）
function decToHexStr(dec) {
    var str = '';
    var firstBit = Math.floor(dec / 16);
    var secondBit = dec % 16;
    switch (firstBit) {
        case 0:
            str = str + '0';
            break;
        case 1:
            str = str + '1';
            break;
        case 2:
            str = str + '2';
            break;
        case 3:
            str = str + '3';
            break;
        case 4:
            str = str + '4';
            break;
        case 5:
            str = str + '5';
            break;
        case 6:
            str = str + '6';
            break;
        case 7:
            str = str + '7';
            break;
        case 8:
            str = str + '8';
            break;
        case 9:
            str = str + '9';
            break;
        case 10:
            str = str + 'A';
            break;
        case 11:
            str = str + 'B';
            break;
        case 12:
            str = str + 'C';
            break;
        case 13:
            str = str + 'D';
            break;
        case 14:
            str = str + 'E';
            break;
        case 15:
            str = str + 'F';
            break;
        default:
            break;
    }
    switch (secondBit) {
        case 0:
            str = str + '0';
            break;
        case 1:
            str = str + '1';
            break;
        case 2:
            str = str + '2';
            break;
        case 3:
            str = str + '3';
            break;
        case 4:
            str = str + '4';
            break;
        case 5:
            str = str + '5';
            break;
        case 6:
            str = str + '6';
            break;
        case 7:
            str = str + '7';
            break;
        case 8:
            str = str + '8';
            break;
        case 9:
            str = str + '9';
            break;
        case 10:
            str = str + 'A';
            break;
        case 11:
            str = str + 'B';
            break;
        case 12:
            str = str + 'C';
            break;
        case 13:
            str = str + 'D';
            break;
        case 14:
            str = str + 'E';
            break;
        case 15:
            str = str + 'F';
            break;
        default:
            break;
    }

    return str;
}


//FC00150001 gateway_mac 0110 type device_mac 08 device_command CRC;

//instruction:FC0015000130EB 1F03 D0DD 01 1001 00124B000FF6AA36 0801FB
//参考指令 打开开关
//FC 00 15 00 01  30 EB 1F 03 D0 DD   01  10  01   00 12 4B 00 0F F6 AA 36  08 01 FB
//FC 00 15 00 01  30 eb 1f 03 d0 dd   01  11  01   00 12 4b 00 11 e7 84 b7  08 04 5f        //窗帘电机打开
//fc：固定字节
//00 15：数据包长度
//00 01：固定TP指令
//20 20 20 20 20 08：网关MAC地址，6个字节
//01：数据传输方向，服务器到产品
//10：通用开关量节点
//01：开关
//00 12 4b 00 0f f6 aa 36:开关的MAC地址
//08:固定端口号
//01：打开开关
//19：奇偶校验

//参考指令 电机
//电机窗帘：
//电机打开：FC 00 15 00 01 30 eb 1f 03 d0 dd 01 11 01 00 12 4b 00 11 e7 84 b7 08 04 5f
//电机关闭：FC 00 15 00 01 30 eb 1f 03 d0 dd 01 11 01 00 12 4b 00 11 e7 84 b7 08 05 5e
