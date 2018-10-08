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

//var SecurityAlarmModule = require('../security/securityAlarm');
var SmartpenModule = require('../smartpen/smartpen');

//全局变量
var ClientTransmit = [];           //已连接的客户端

var getSoundDataNotEnd = false;
var soundInstructions = '';

/**
 * 建立Socket连接，处理网关传过来的数据、发送控制指令等
 * 数据类型包括：智能笔数据（语音+动作），网关心跳包，网关状态指令，传感器数据
 */
var socketServer = net.createServer();
socketServer.on('connection', function (client) {
    console.log('\non connection transmit\n');
    //console.log(client);

    //测试client.write
    client.setEncoding("hex");
    //console.log(client);
    //ClientTransmit.push(client);

    //ClientTransmit = [client];

    var clientTemp;

    if (ClientTransmit.length < 3) {
        ClientTransmit.push(client);
    }
    if (ClientTransmit.length == 3) {
        clientTemp = client;
        ClientTransmit[0] = ClientTransmit[1];
        ClientTransmit[1] = ClientTransmit[2];
        ClientTransmit[2] = clientTemp;
    }

    client.on('data', function (data) {
        console.log('server got data from client: ', data.toString());
        //console.log(ClientTransmit);
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
        if (getSoundDataNotEnd) {
            soundInstructions = soundInstructions + instruction;
        }

        //智能笔数据
        if (instruction.substring(0, 2) == '7e') {
            console.log('智能笔数据');
            /**
             * 语音数据的形式是：语音起始帧，很长的多个断帧，语音结束帧
             * 首先判断是不是语音帧
             */
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
        }

    });

    //add set client keep alive
    client.setKeepAlive(true);

    client.setTimeout(2 * 60 * 1000, function () {
        client.end("Connection: close\r\n\r\n");
        client.destroy();
        //ClientTransmit = [];
    });
    client.on('timeout', function () {
        client.end();
        client.destroy();
        //ClientTransmit=[];
    });

    client.on('end', function (data) {
        //delete clients[gate];     //清理client
        console.log('client end.');
        //ClientTransmit=[];
    });

    client.on('error', function (exc) {
        client.end();
        client.destroy();
        //ClientTransmit=[];
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

socketServer.listen(7703);

