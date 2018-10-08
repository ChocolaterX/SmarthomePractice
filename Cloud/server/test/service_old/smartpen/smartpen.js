/**
 * Created by Jiang Suyang on 2016-11-18.
 *
 * 主要内容：
 * （1）处理来自智能网关转发的智能笔相关的命令；
 * //（2）处理服务器向智能网关再向智能笔发送的命令；
 */

var net = require('net');
var fs = require('fs');
var config = require('../../../config/config');
var agenda = require('../../../lib/schedule');

//引入数据库，model
var mongoose = require('../../cloud_db_connect');
var Device = mongoose.model('Device');
var Action = mongoose.model('Action');
var PenAction = mongoose.model('PenAction');
var SoundCommand = mongoose.model('SoundCommand');
var SoundDevice = mongoose.model('SoundDevice');
var SoundScene = mongoose.model('SoundScene');
var log = mongoose.model('Log');
var Command = require('../device/command');
var Scene = require('../scene/scene');

var validator = require('validator');
var request = require('request');
var clients = {};           //already authed clients
var unAuthClient = {};      //unauth
var async = require('async');
var needle = require('needle');
var log4j = require('log4js').getLogger();

var jwt = require('jsonwebtoken');

//引用/service/smartpen/protocol.js中的方法
var protocol = require('./protocol');

/**
 * 网关数据流当前状态标志位
 * sound_start代表语音流开始，sound_process代表语音流接收中, sound_end代表语音流结束
 */
var flag = 'default';

/**
 * getActionAndSound
 * 该方法的作用是，接收转发
 * 调用方：cloud/server/service/gateway/gateway.js的SocketServer.on('connection')
 * 参数：
 *      type:值为'action'或'sound'
 *      gatewayId:网关ID
 *      data:指令内容，String
 * 返回值：
 *      message：消息
 */
exports.getActionAndSound = function (gatewayId, data) {
    var message = '';           //返回消息(主要用于错误提示)
    var formatResult = {};      //指令流格式化后的结果

    var dataType = '';          //数据流的类型

    //先查询数据流中有没有语音开始帧和语音结束帧
    if (data.indexOf('7effffffff030a') >= 0) {
        flag = 'sound_start';
    }
    if (data.indexOf('7effffffff040a') >= 0) {
        flag = 'sound_end';       //语音结束
    }

    /**
     * 对语音或动作流数据做第一步的格式化处理
     */
    if (flag == 'sound_start') {       //代表语音流开始
        formatResult = protocol.formatSoundDataFlowFromSmartPen(data, flag);
        flag = 'sound_process';
        return '';
    }
    else if (flag == 'sound_process') {     //代表语音流正在进行中
        //console.log('sound process111');
        formatResult = protocol.formatSoundDataFlowFromSmartPen(data, flag);
        return '';
    }
    else if (flag == 'sound_end') {     //代表语音流结束
        console.log('sound end111');
        dataType = 'sound';
        formatResult = protocol.formatSoundDataFlowFromSmartPen(data, flag);
        //console.log('abcabcabc');
        //console.log(formatResult.soundInstructionString);
        flag = 'default';
    }
    else {                              //代表动作指令流
        formatResult = protocol.formatActionDataFlowFromSmartPen(data);       //指令格式化后的结果
        dataType = 'action';
    }

    console.log('dataType:' + dataType);
    //return '';

    /**
     * 如果格式化执行成功，则进一步解析命令
     * 分动作和语音两种
     */
    if (formatResult.errorCode != 0) {
        message = '命令格式化失败，命令无效';
        return message;
    }
    else if (dataType == 'action') {
        var analyseResult = {};

        /**
         * （1）异步函数，调用protocol.js文件的anylyseInstructionFromSmartPen方法，然后对解析结果进行处理
         * （2）分为动作和语音两种
         * （3）动作指令，取数据库，找到所属的动作绑定，执行
         * （4）语音指令，取数据库，找到对应的语音绑定，执行
         * 备注：动作或语音指令的识别结果格式为analyseResult ={errorCode: , message, execute:('action','sound'), actionIndex: Number, soundKeyWord: String}
         */
        protocol.analyseActionInstructionFromSmartPen(formatResult.instructionSet, function (analyseResult) {
            console.log('\nanalyseResult:');
            console.log(analyseResult);
            //如果返回的结果显示错误，则退出
            if (analyseResult.errorCode != 0) {
                message = analyseResult.message;
                return message;
            }

            var type = analyseResult.execute;   //动作还是语音
            var homeId = '';            //当前请求来源的家庭ID（通过网关ID取得所属家庭ID）
            var gateway = {};           //当前设备的网关

            //动作部分代码

            var actionSets = [];             //所有动作的结果集（actions表）
            var penActionSets = [];        //所有动作绑定的结果集（penActions表）
            var actionIndex = -1;       //动作匹配的index    此处要用index-1来做索引
            var penActionIndex = -1;    //动作绑定的index

            async.waterfall([
                    //从传入的gatewayID获取当前家庭id
                    function (callback) {
                        Device.findOne({_id: gatewayId}, function (err, result) {
                            if (err) {
                                message = '查询当前网关失败';
                                return message;
                            }
                            else if (result) {
                                gateway = result;
                                homeId = gateway.home;
                                callback();
                            }
                            else {
                                message = '找不到当前网关';
                                return message;
                            }
                        });
                    },
                    //找出所有手势动作集
                    function (callback) {
                        Action.find({removed: false}, function (err, result) {
                            if (err) {
                                message = '查询动作列表失败';
                                return message;
                            } else {
                                actionSets = result;
                                callback();
                            }
                        });
                    },
                    //从homeID取得当前家庭的所有动作绑定信息
                    function (callback) {
                        //动作绑定的查询条件
                        var findActionBindingCondition = {
                            removed: false,
                            home: homeId
                        };
                        PenAction.find(findActionBindingCondition, function (err, results) {
                            if (err) {
                                message = '查询动作绑定列表失败';
                                return message;
                            } else if (results) {
                                penActionSets = results;
                                callback();
                            }
                            else {
                                penActionSets = [];
                                callback();
                            }
                        })
                    },
                    //根据动作识别结果，匹配后调用控制命令或调用情景模式
                    function (callback) {
                        //console.log('\n\nactionSets:');
                        //console.log(actionSets);
                        //console.log('\n\npenActionSets:');
                        //console.log(penActionSets);

                        var penAction = {};

                        var actionId = actionSets[analyseResult.actionIndex - 1]._id;

                        //console.log(actionId);

                        var i = 0;      //iterator
                        for (i = 0; i < penActionSets.length; i++) {
                            if (validator.trim(actionId) == validator.trim(penActionSets[i].action)) {
                                penAction = penActionSets[i];
                                break;
                            }
                        }


                        //console.log('\n\n\n123456\n');
                        //console.log(penAction);

                        //设备控制
                        if (penAction.bindType == 1) {
                            console.log('设备控制');
                            Command.commandScene(penAction.deviceCommand, penAction.device);
                            //Command.commandScene('LightOn', '560167e5aa6a24623fa6b1a1');
                        }
                        //情景模式
                        else if (penAction.bindType == 2) {
                            console.log('情景模式控制');
                            Scene.localrun(penAction.scene, function (err_in, doc_in) {
                                if (doc_in == 'error') {
                                    //return client.write('localrun is failure')
                                    return 'localrun is failure';
                                } else {
                                    console.log(doc_in);
                                }
                            })
                        }
                        else {
                            message = '动作绑定数据有误';
                            return message;
                        }

                        callback();
                    }
                ],
                function () {
                    console.log('callback  调用结束');
                    message = '动作识别并执行成功';
                    return message;
                });
        });
    }
    else if (dataType == 'sound') {
        protocol.analyseSoundInstructionFromSmartPen(formatResult.soundInstructionResult, function (analyseResult) {
            console.log('smartpen.js  analyseResult sound');
            console.log(analyseResult);

            var commandSets = [];        //查询数据库的结果集（语音操作关键字相关数据）
            var deviceSets = [];         //查询数据库的结果集（语音设备关键字相关数据）
            var sceneSets = [];          //查询数据库的结果集（语音情景模式关键字相关数据）
            var soundContent = analyseResult.soundRecognitionResult;

            async.waterfall([
                    //从传入的gatewayID获取当前家庭id
                    function (callback) {
                        Device.findOne({_id: gatewayId}, function (err, result) {
                            if (err) {
                                message = '查询当前网关失败';
                                return message;
                            }
                            else if (result) {
                                gateway = result;
                                //console.log('\n\n\n\ngateway:' + gateway + '\n\n\n\n\n');
                                homeId = gateway.home;

                                //注意此处，将home改用56cbcf50b024aba3ae0a6669，room2
                                //因为该home下有很多可用的action与sound
                                homeId = '56cbcf50b024aba3ae0a6669';

                                callback();
                            }
                            else {
                                message = '找不到当前网关';
                                return message;
                            }
                        });
                    },
                    //获取语音操作关键字
                    function (callback) {

                        var findDefaultCommandKeywordCondition = {   //查询默认的操作关键字列表
                            removed: false,
                            home: null
                        };
                        var findHomeCommandKeywordCriteria = {     //查询家庭的操作关键字列表
                            removed: false,
                            home: homeId
                        };

                        SoundCommand.find(findDefaultCommandKeywordCondition, function (err, defaultCommandKeywords) {
                            if (err) {
                                message = '查询语音操作关键字失败';
                                return message;
                            } else {
                                SoundCommand.find(findHomeCommandKeywordCriteria, function (err, homeCommandKeywords) {
                                    if (err) {
                                        message = '查询语音操作关键字失败';
                                        return message;
                                    } else {
                                        var i = 0;
                                        for (i = 0; i < defaultCommandKeywords.length; i++) {
                                            commandSets.push(defaultCommandKeywords[i]);
                                        }
                                        for (i = 0; i < homeCommandKeywords.length; i++) {
                                            commandSets.push(homeCommandKeywords[i]);
                                        }
                                        callback();
                                    }
                                })
                            }
                        });
                    },
                    //获取语音设备关键字
                    function (callback) {
                        //语音设备关键字的搜索条件
                        var findDeviceKeywordCondition = {
                            removed: false,
                            home: homeId
                        };

                        SoundDevice.find(findDeviceKeywordCondition, function (err, results) {
                            if (err) {
                                message = '查询语音设备关键字失败';
                                return message;
                            } else {
                                deviceSets = results;
                                callback();
                            }
                        })
                    },
                    //获取语音情景模式关键字
                    function (callback) {
                        //语音情景模式关键字的搜索条件
                        var findSceneKeywordCondition = {
                            removed: false,
                            home: homeId
                        };
                        SoundScene.find(findSceneKeywordCondition, function (err, results) {
                            if (err) {
                                message = '查询语音情景模式关键字失败';
                                return message;
                            } else {
                                sceneSets = results;
                                callback();
                            }
                        })
                    },
                    //使用算法判断语音关键字内容
                    function (callback) {
                        protocol.matchingSoundKeywords(commandSets, deviceSets, sceneSets, soundContent, function (matchingResult) {

                            console.log(matchingResult);

                            if (matchingResult.type == 'device') {
                                Command.commandScene(matchingResult.command, matchingResult.deviceId);
                                callback();
                            }
                            else if (matchingResult.type == 'scene') {
                                Scene.localrun(matchingResult.scene, function (err_in, doc_in) {
                                    if (doc_in == 'error') {
                                        //return client.write('localrun is failure')
                                        return 'localrun is failure';
                                    } else {
                                        callback();
                                        console.log(doc_in);
                                    }
                                })
                            }
                            else {
                                message = '语音绑定数据有误';
                                console.log(message);
                                return message;
                            }
                        });
                    }
                ],
                function () {
                    console.log('callback  调用结束');
                    message = '语音识别并执行成功';
                    return message;
                });
        });

    }

};




