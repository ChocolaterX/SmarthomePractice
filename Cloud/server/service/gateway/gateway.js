/**
 * <copyright file="gateway.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>1/11/2018</date>
 * <summary>
 *  服务器与网关通信代码，双向。
 * </summary>
 */

var net = require('net');
var fs = require('fs');
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var async = require('async');
//var needle = require('needle');
//var jwt = require('jsonwebtoken');
//var request = require('request');

var SecurityAlarmModule = require('../security/securityAlarm');
var SmartpenModule = require('../smartpen/smartpen');

//全局变量
var Clients = [];           //已连接的客户端
var infraredCommand = '';       //考虑一下什么时候清零

//var unAuthClient = {};      //unauth
//var commandBuffer = [];

/**
 * 向网关发送写指令
 * @param instruction   String形式的指令
 * @param type   指令格式，包括device, infrared
 * 控制命令的长度为25
 */
exports.writeCommand = function (instruction, type) {
    console.log('\nwrite command\n');
    console.log('instruction:' + instruction);
    //console.log('instruction length:' + instruction.length);

    //对全局变量进行初始化
    if (type == 'infrared') {
        infraredCommand = '';
    }

    //var buf = new Buffer(25);
    var length = Math.floor(instruction.length / 2);
    //console.log(Math.floor(instruction.length/2));
    var buf = new Buffer(Math.floor(instruction.length / 2));
    //buf.write('FC0015000120202020200801100100124B000FF6AA36080018', 0, 25, 'hex');
    //buf.write('FC0015000120202020200801100100124B000FF6AA36080119', 0, 25, 'hex');
    buf.write(instruction, 0, length, 'hex');
    //client.write(buf);
    //console.log(Clients[0]);
    //console.log('\n\n');
    //console.log(Clients);
    //console.log('\n\n');
    //if (Clients[0]) {
    //    Clients[0].write(buf);
    //}
    //else {
    //    console.log('当前未连接网关');
    //}
    for (var i = 0; i < Clients.length; i++) {
        Clients[i].write(buf);
    }
    if (Clients.length == 0) {
        console.log('当前未连接网关');
    }
};

/**
 * 获取红外指令
 */
exports.getInfraredCommand = function () {
    var temp = infraredCommand;
    infraredCommand = '';
    return temp;
};


var getSoundDataNotEnd = false;
var soundInstructions = '';

/**
 * 建立Socket连接，处理网关传过来的数据、发送控制指令等
 * 数据类型包括：智能笔数据（语音+动作），网关心跳包，网关状态指令，传感器数据
 */
var socketServer = net.createServer();
socketServer.on('connection', function (client) {
    console.log('\non connection\n');
    //console.log(client);

    //测试client.write
    client.setEncoding("hex");
    //console.log(client);
    //Clients.push(client);

    //Clients = [client];

    var clientTemp;

    if (Clients.length < 3) {
        Clients.push(client);
    }
    if (Clients.length == 3) {
        clientTemp = client;
        Clients[0] = Clients[1];
        Clients[1] = Clients[2];
        Clients[2] = clientTemp;
    }
    //if (Clients.length == 3) {
    //for (var j = 0; j < Clients.length; j++) {
    //    console.log('\n\n');
    //    console.log(Clients[j]);
    //    console.log('\n\n');
    //}
    //}

    //console.log(client);
    //fs.appendFile('clients.txt', client, function (err) {
    //    if (err) {
    //        console.log(err);
    //    }
    //    else {
    //        console.log('\n\n输出新网关\n\n');
    //    }
    //});
    //console.log('\n当前网关数量：' + Clients.length);


    //var exists = false;
    //for (var i = 0; i < Clients.length; i++) {
    //    if (Clients[i] == client) {
    //        console.log('当前客户端已存在');
    //        exists = true;
    //        break;
    //    }
    //}
    //if (!exists) {
    //    Clients.push(client);
    //    fs.appendFile('clients.txt', Clients, function (err) {
    //        if (err) {
    //            console.log(err);
    //        }
    //        else {
    //            console.log('\n\n输出新网关\n\n');
    //        }
    //    });
    //}

    client.on('data', function (data) {
        console.log('server got data from client: ', data.toString());
        //console.log(Clients);
        var instruction = data.toString();

        /**
         * 判断从网关传来的数据类型
         * 1.来自云隐设备的数据
         * 长度0C：网关连接确认
         * 长度15：
         * 长度17：门磁状态，红外感应状态
         * 2.来自智能笔的数据
         *  动作数据：7e开头连续的标准帧
         *  语音数据：开始帧，杂乱帧，结束帧，其中，只取中间的语音数据
         * 3.来自传感器的数据
         */
        /*if (getSoundDataNotEnd) {
            soundInstructions = soundInstructions + instruction;
        }*/

        //云隐设备数据
        if (instruction.substring(0, 6) == 'fc000c') {
            console.log('网关连接:  ' + Date());
        }
        if (instruction.substring(0, 6) == 'fc0015') {

        }
        if (instruction.substring(0, 6) == 'fc0018') {          //门磁和红外感应指令，本来是fc0017经测试无误，现在变成fc0018
            if (instruction.substring(24, 26) == '30') {            //报警设备
                if (instruction.substring(46, 50) == '0402') {           //门磁
                    //fc0018 000130eb1f03d0dd03 30 02 005043c903246e27 01 0402 0102 52

                    console.log('报警设备指令');
                    SecurityAlarmModule.formatAndHandleInstruction(instruction, function (result) {
                        console.log(result);
                    });
                }
                else {
                    console.log('fc0018 未知指令');
                }
            }
        }
        //学习到的红外指令
        if (instruction.substring(0, 6) == 'fc00fc') {
            infraredCommand = instruction;
        }

        //智能笔数据
        /*if (instruction.substring(0, 2) == '7e') {
            console.log('智能笔数据');
            /!**
             * 语音数据的形式是：语音起始帧，很长的多个断帧，语音结束帧
             * 首先判断是不是语音帧
             *!/
            if (instruction.substr(10, 4) == '030a') {
                console.log('语音开始帧');
                soundInstructions = '';
                getSoundDataNotEnd = true;
            }
            else if (instruction.substr(10, 4) == '040a') {
                console.log('语音结束帧');
                getSoundDataNotEnd = false;
                //调用语音识别代码
                SmartpenModule.analyseSmartpenSoundInstruction(soundInstructions, function (result) {

                });
                soundInstructions = '';
            }
            else {
                SmartpenModule.analyseSmartpenActionInstruction(instruction, function (result) {
                    //console.log()
                });
            }
        }*/

        //传感器数据


    });

    //add set client keep alive
    client.setKeepAlive(true);

    client.setTimeout(2 * 60 * 1000, function () {
        client.end("Connection: close\r\n\r\n");
        client.destroy();
        //Clients = [];
    });
    client.on('timeout', function () {
        client.end();
        client.destroy();
        //Clients=[];
    });

    client.on('end', function (data) {
        //delete clients[gate];     //清理client
        console.log('client end.');
        //Clients=[];
    });

    client.on('error', function (exc) {
        client.end();
        client.destroy();
        //Clients=[];
    });
});

socketServer.on('listening', function () {
    console.log('Socket server opened on %j', socketServer.address().port);
});

socketServer.on('close', function () {
        console.log('socket server down, restarting...');
        setTimeout(function () {
            socketServer.listen(config.cloud.socketPort);
        }, 1000);
    }
);

socketServer.listen(config.cloud.socketPort);


/*var socketServer = net.createServer(function (socket) {
 console.log('client connected');

 socket.setEncoding("hex");
 // 监听客户端的数据
 socket.on('data', function (data) {
 console.log('server got data from client: ', data.toString());
 });

 // 监听客户端断开连接事件
 socket.on('end', function (data) {
 console.log('connection closed');
 });

 //被command.js调用
 var buf = new Buffer(25);
 buf.write('FC0015000120202020200801100100124B000FF6AA36080018', 0, 25, 'hex');
 socket.write(buf);

 //setInterval(function () {
 //    for (var i = 0; i < commandBuffer.length; i++) {
 //        var buf = new Buffer(25);
 //        buf.write(commandBuffer[i], 0, 25, 'hex');
 //        console.log('buffer:');
 //        console.log(buf);
 //        socket.write(buf);
 //    }
 //    commandBuffer = [];
 //}, 2000);


 //发送数据给客户端
 //socket.write('FC0015000120202020200801100100124B000FF6AA36080018');
 //socket.write([0xFC,0x00,0x15,0x00,0x01,0x20,0x20,0x20,0x20,0x20,0x08,0x01,0x10,0x01,0x00,0x12,0x4B,0x00,0x0F,0xF6,0xAA,0x36,0x08,0x00,0x18]);
 //var data = [0xFC, 0x00, 0x15, 0x00, 0x01, 0x20, 0x20, 0x20, 0x20, 0x20, 0x08, 0x01, 0x10, 0x01, 0x00, 0x12, 0x4B, 0x00, 0x0F, 0xF6, 0xAA, 0x36, 0x08, 0x00, 0x18];
 //socket.write(data);

 //测试成功
 //var buf = new Buffer(25);
 //buf.write('FC0015000120202020200801100100124B000FF6AA36080018', 0, 25, 'hex');
 //socket.write(buf);
 });

 socketServer.listen(config.cloud.socketPort, function () {
 console.log('Socket port started on port ' + config.cloud.socketPort);
 });*/

