/**
 * <copyright file="protocol.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>4/4/2018</date>
 * <summary>
 *  智能笔的指令解析，转化等
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var SoundKeyword = mongoose.model('SoundKeyword');
var ActionBinding = mongoose.model('ActionBinding');
var Device = mongoose.model('Device');
var InfraredCommand = mongoose.model('InfraredCommand');
var CommandModule = require('../device/command');
var SceneModule = require('../scene/scene');
var gatewayModule = require('../gateway/gateway');

var validator = require('validator');
var fs = require('fs');
var request = require('request');
var async = require('async');

//全局变量
var actionInstructions = [];        //单次动作指令数组
var soundInstructions = [];         //单次语音指令数组
var getActionDataNotEnd = false;

/**
 * 解析网关传来的智能笔的动作流
 */
exports.analyseSmartpenActionInstruction = function (instruction, callbackAll) {
    var analyseResult = {};
    //var instructionSet = [];        //对于动作指令来说，可能有多条指令集
    var formatResult = {};          //数据经过转译后的结果
    var i;
    var actionInstructionString = '';
    var tempString = '';

    if (!instruction) {
        result = {
            errorCode: 2000,
            message: '异常错误：指令为空'
        };
    }

    //将网关传来的原始数据写入txt文件
    //fs.appendFile('smartpenData.txt', instruction + '\n\n', function (err) {
    //    if (err) {
    //        console.log(err);
    //    }
    //});

    //formatResult = formatActionDataFlowFromSmartPen(instruction);
    //if (formatResult.errorCode != 0) {
    //    result['errorCode'] = 2000;
    //    result['message'] = '命令格式化失败，命令无效';
    //    return result;
    //}
    //else {
    //    instructionSet = formatResult.instructionSet;
    //}

    //判断数据指令的类型
    //查看传入的指令格式是否正确
    if (typeof instruction != 'string') {
        analyseResult['errorCode'] = 500;
        analyseResult['message'] = '待解析的指令格式有误';
        return analyseResult;
    }
    //Head位
    //Head必须为7e
    if (instruction.indexOf('7e') != 0) {
        analyseResult['errorCode'] = 500;
        analyseResult['message'] = '待解析的指令Head位有误';
        return analyseResult;
    }
    //GUID位
    //FF FF FF FF代表广播
    //if (instruction.indexOf('FF FF FF FF') != 3) {
    //    analyseResult['errorCode'] = 500;
    //    analyseResult['message'] = '待解析的指令GUID位有误';
    //    //console.log(analyseResult);
    //    return analyseResult;
    //}
    //Type位     00代表正常数据，01 02 03 04代表动作开始、动作结束、语音开始、语音结束
    if (instruction.substr(10, 2) != '00') {
        //收到动作开始帧
        if (instruction.substr(10, 4) == '0109') {
            console.log('动作开始帧');
            actionInstructions = [];
            actionInstructions.push(instruction);
            actionInstructionString = '';
            getActionDataNotEnd = true;
        }

        //收到动作结束帧
        else if (instruction.substr(10, 4) == '0209') {
            console.log('动作结束帧');
            getActionDataNotEnd = false;
            actionInstructions.push(instruction);

            //准备待写入的动作数据string
            for (i = 0; i < actionInstructions.length; i++) {
                actionInstructionString = actionInstructionString + actionInstructions[i];
            }
            tempString = '';
            for (i = 0; i < actionInstructionString.length; i++) {
                tempString = tempString + actionInstructionString[i];
                if (i % 2 == 1) {
                    tempString = tempString + ' ';      //按照此方法，最后一位23后面依然会有一个空格，请注意
                }
            }
            actionInstructionString = tempString;

            //将动作帧数据写入txt文件
            //fs.appendFile('actionData.txt', actionInstructionString, function (err) {
            //    if (err) {
            //        console.log(err);
            //    }
            //    else {
            //        analyseResult['errorCode'] = 0;
            //        analyseResult['message'] = '解析动作指令成功';
            //        actionInstructionString = '';
            //    }
            //});

            var user = '58de05b91cfc5d304b6809c3';

            var motionRecognizeSuccess = false;         //动作解析是否成功的判断位
            var dataString;                             //动作解析流临时字符串
            var actionRecognitionResult;                //动作解析结果
            var actionBindingTemp = {};
            var infraredCommandTemp = {};
            var deviceTemp = {};
            var actionBinding;                          //查询到的动作绑定
            var gateways;                               //用户的网关
            var device;                                 //动作绑定的控制设备
            var scene;                                  //动作绑定的情景模式

            async.waterfall([
                //将数据写入文件
                function (callback) {
                    fs.unlink('actionData.txt', function () {
                        //console.log('success');
                        try {
                            fs.appendFileSync('actionData.txt', actionInstructionString);
                            //console.log('写入文件actionFeature.txt成功。');
                            callback();
                        }
                        catch (err) {
                            console.log('写入actionData.txt出错:' + err);
                            analyseResult['errorCode'] = 500;
                            analyseResult['message'] = '写入actionData.txt出错';
                            callbackAll(analyseResult);
                        }
                    });
                },
                //调用java包解析动作数据文件
                function (callback) {
                    //java -jar MotionRecognition.jar test_data\xxx
                    var child = require('child_process').spawn('java', ['-jar',
                        'E://workspaces/SmartHome/trunk/cloud/bin/MotionRecognition.jar',
                        'E://workspaces/SmartHome/trunk/cloud/bin/actionData.txt']);
                    //'E://workspaces/SmartHome/trunk/cloud/bin/test_data/1_1']);
                    child.stdout.on('data', function (data) {
                        //输出结果
                        //Read Gesture Success!
                        //    0
                        //Time: 621 ms
                        dataString = validator.trim(data.toString());
                        //console.log(dataString);
                        if (dataString == 'Read Gesture Success!') {
                            motionRecognizeSuccess = true;
                        }
                        if ((dataString.length == 1 ) && motionRecognizeSuccess) {
                            actionRecognitionResult = dataString;
                            motionRecognizeSuccess = false;
                            callback();
                        }
                    });
                    child.stderr.on("data", function (data) {
                        console.log('调用动作识别模块失败：' + data.toString());
                        analyseResult['errorCode'] = 500;
                        analyseResult['message'] = '调用动作识别模块失败';
                        callbackAll(analyseResult);
                    });
                },
                //取数据库，获取动作对应的指令
                function (callback) {
                    console.log('actionRecognitionResult:' + actionRecognitionResult);
                    //缺一个user
                    //此处的返回值考虑如何给前台用户看到
                    //58de05b91cfc5d304b6809c3
                    actionBindingTemp['user'] = user;
                    actionBindingTemp['number'] = actionRecognitionResult;
                    ActionBinding.findOne(actionBindingTemp)
                        .exec(function (err, result) {
                            if (err) {
                                analyseResult['errorCode'] = 2000;
                                analyseResult['message'] = '异常错误：查询动作绑定失败';
                                callbackAll(analyseResult);
                            }
                            else if (!result) {
                                analyseResult['errorCode'] = 2000;
                                analyseResult['message'] = '当前动作未绑定具体操作';
                                callbackAll(analyseResult);
                            }
                            else {
                                actionBinding = result;
                                callback();
                            }
                        });
                },
                //查询网关，只处理了绑定设备的情况
                function (callback) {
                    console.log('\nactionBinding:');
                    console.log(actionBinding);
                    if (actionBinding.type == 1) {
                        deviceTemp['user'] = user;
                        deviceTemp['type'] = 0;
                        Device.find(deviceTemp)
                            .sort({createdTime: -1})
                            .exec(function (err, result) {
                                if (err) {
                                    analyseResult['errorCode'] = 2000;
                                    analyseResult['message'] = '异常错误：查询网关失败';
                                    callbackAll(analyseResult);
                                }
                                else if (result) {
                                    console.log('gateways:');
                                    console.log(result);
                                    gateways = result;
                                    //executeDeviceCommand(device, gateways, command);
                                    callback();
                                }
                                else {
                                    analyseResult['errorCode'] = 2000;
                                    analyseResult['message'] = '当前用户未添加网关';
                                    callbackAll(analyseResult);
                                }
                            });
                        //executeDeviceCommand(device, gateways, command);
                    }
                    else if (actionBinding.type == 2) {
                        SceneModule.runSceneBackground(user, actionBinding.scene);
                        callback();
                    }
                    else if (actionBinding.type == 3) {
                        infraredCommandTemp['_id'] = actionBinding.infraredCommand;
                        infraredCommandTemp['user'] = user;
                        InfraredCommand.findOne(infraredCommandTemp)
                            .exec(function (err, result) {
                                if (err) {
                                    analyseResult['errorCode'] = 2000;
                                    analyseResult['message'] = '查询红外指令失败';
                                    callbackAll(analyseResult);
                                }
                                else if (!result) {
                                    analyseResult['errorCode'] = 2000;
                                    analyseResult['message'] = '待执行的红外指令不存在';
                                    callbackAll(analyseResult);
                                }
                                else {
                                    if (!result.command) {
                                        analyseResult['errorCode'] = 2000;
                                        analyseResult['message'] = '红外指令有误';
                                        callbackAll(analyseResult);
                                    }
                                    else {
                                        gatewayModule.writeCommand(result.command, 'infraredCommand');
                                    }
                                }
                            });
                        callback();
                    }
                    else {
                        analyseResult['errorCode'] = 2000;
                        analyseResult['message'] = '当前动作数据异常';
                        callbackAll(analyseResult);
                    }
                    //callback();
                },
                //查询绑定的控制设备
                function (callback) {
                    if (actionBinding.type == 2 || actionBinding.type == 3) {
                        callback();
                    }
                    else {
                        delete deviceTemp.type;
                        deviceTemp['_id'] = actionBinding.device;
                        Device.findOne(deviceTemp)
                            .exec(function (err, result) {
                                if (err) {
                                    analyseResult['errorCode'] = 2000;
                                    analyseResult['message'] = '异常错误：查询设备失败';
                                    callbackAll(analyseResult);
                                }
                                else if (result) {
                                    device = result;
                                    CommandModule.executeDeviceCommand(device, gateways, actionBinding.command);
                                    callback();
                                }
                                else {
                                    analyseResult['errorCode'] = 2000;
                                    analyseResult['message'] = '异常错误：未找到待控制的设备';
                                    callbackAll(analyseResult);
                                }
                            });
                    }
                }
            ], function (callback) {
                analyseResult['errorCode'] = 0;
                analyseResult['message'] = '动作识别解析并执行操作成功';
                callbackAll(analyseResult);
            });
        }

        //收到语音开始帧
        /*else if (instructionSet[i].substr(15, 5) == '03 0a') {
         console.log('语音开始帧');
         soundInstructionSet = [];
         getSoundDataNotEnd = true;
         }*/

        //收到语音结束帧
        /*else if (instructionSet[i].substr(15, 5) == '04 0a') {
         getSoundDataNotEnd = false;

         console.log('\nsoundInstructionSet:\n');
         console.log(soundInstructionSet);

         var soundRecognitionResult = {};      //语音解析结果总集
         var soundRecognitionSuccess = false;
         var soundString = '';                 //语音解析结果文字内容


         async.waterfall([
         //采集语音指令，调用，生成语音文件
         function (callback) {

         },
         //传入语音文件的参数，调用，得到语音识别结果
         function (callback) {
         var dataString = '';

         //绝对路径成功，请注意此处相对路径位置为/cloud/bin文件夹下
         /!*var child = require('child_process').spawn('java', ['-jar',
         'E://workspaces/taghome2_business/trunk/cloud/server/service/smartpen/FeatureClassifier_1.0.jar',
         'E://workspaces/taghome2_business/trunk/cloud/bin/actionFeature.txt']);
         child.stdout.on('data', function (data) {
         dataString = validator.trim(data.toString());

         //if (dataString.length == 1) {
         //    actionIndex = dataString.charAt(0);
         //    console.log('actionIndex:' + actionIndex);
         //    console.log('识别成功');
         //    callback();
         //}
         });
         child.stderr.on("data", function (data) {
         console.log('调用语音识别模块失败：' + data.toString());
         //return message;
         soundRecognitionResult['errorCode'] = 500;
         soundRecognitionResult['message'] = '调用语音识别模块失败';
         });*!/

         }
         ], function (callback) {

         if (soundRecognitionSuccess) {
         analyseResult['errorCode'] = 0;
         analyseResult['execute'] = 'sound';
         analyseResult['soundKeyword'] = soundString;
         }
         else {
         analyseResult['errorCode'] = 500;
         analyseResult['message'] = '语音指令识别失败';

         }


         });


         //返回语音识别结果


         }*/

        else {
            analyseResult['errorCode'] = 500;
            analyseResult['message'] = '待解析的指令Type位有误';
            return analyseResult;
        }
    }
    else {
        var cmd = instruction.substr(12, 2);    //CMD位
        // '7e FF FF FF FF 00  09  FE 35  78 E2  56 00  0D 39  89 EF  2e 31  22 33  23'
        //MPU_DATA 动作数据
        if (cmd == '09') {
            //var d1, d2, d3, d4, d5, d6;
            //console.log('动作帧');
            if (getActionDataNotEnd) {
                actionInstructions.push(instruction);
            }
        }
    }
    callbackAll(analyseResult);
};

/**
 * 解析网关传来的智能笔的语音流
 * @param soundInstrucions  语音帧的长段字符串
 */
exports.analyseSmartpenSoundInstruction = function (soundInstrucions, callbackAll) {
    //console.log('进入语音流解析');
    var analyseResult = {};
    var soundRecognitionResult = '';                //语音解析结果，String

    var i = 0;

    var user = '58de05b91cfc5d304b6809c3';
    var soundKeywordTemp = {};
    var deviceTemp = {};
    var infraredCommandTemp = {};
    var soundKeywords = [];                         //查询得到的所有的语音关键词
    var soundKeywordMatched = {};                   //语音识别匹配的语音关键词
    var gateways = [];                              //该用户的所有网关
    var device = {};                                //待控制的设备

    soundKeywordTemp['user'] = user;

    async.waterfall([
        //将数据写入文件
        function (callback) {
            fs.unlink('voice.txt', function () {
                //console.log('success');
                try {
                    fs.appendFileSync('voice.txt', soundInstrucions);
                    //console.log('写入文件actionFeature.txt成功。');
                    callback();
                }
                catch (err) {
                    console.log('voice.txt出错:' + err);
                    analyseResult['errorCode'] = 500;
                    analyseResult['message'] = '写入actionData.txt出错';
                    callbackAll(analyseResult);
                }
            });
        },
        //调用java包解析语音数据文件
        function (callback) {
            var child = require('child_process').spawn('python', ['E://workspaces/SmartHome/trunk/cloud/bin/ConvertToPcm.py',
                'E://workspaces/SmartHome/trunk/cloud/bin/voice.txt']);
            child.stdout.on('data', function (data) {
                //输出结果
                //Read Gesture Success!
                //    0
                //Time: 621 ms
                console.log(data.toString());
                callback();
            });
            child.stderr.on("data", function (data) {
                console.log('调用语音转换脚本失败：' + data.toString());
                analyseResult['errorCode'] = 500;
                analyseResult['message'] = '调用语音转换脚本失败';
                callbackAll(analyseResult);
            });
        },
        function (callback) {
            var AipSpeechClient = require("baidu-aip-sdk").speech;
            //var fs = require('fs');
            var voice = fs.readFileSync('./voice.wav');
            var voiceBuffer = new Buffer(voice);

            //console.log(voiceBuffer);
            var APP_ID = "10881087";
            var API_KEY = "QVTRiLP2k64ST3jN7CxM10tp";
            var SECRET_KEY = "sLuvqNhuCyCArdeEGjnsiDBsnvkbg4xS";

            var client = new AipSpeechClient(APP_ID, API_KEY, SECRET_KEY);

            client.recognize(voiceBuffer, 'pcm', 8000).then(function (result) {
                console.log('语音识别结果为：');
                console.log(JSON.stringify(result));
                if (result.err_no == 0) {
                    soundRecognitionResult = result.result[0];
                    callback();
                }
                else {
                    analyseResult['errorCode'] = 500;
                    analyseResult['message'] = '百度语音脚本识别结果错误';
                    callbackAll();
                }
                //{"err_msg":"speech quality error.","err_no":3301,"sn":"511072765811523186655"}
                //{"corpus_no":"6542036999231651493","err_msg":"success.","err_no":0,"result":["打开厨房灯，"],"sn":"876786695491523186685"}
            }, function (err) {
                console.log(err);
                analyseResult['errorCode'] = 500;
                analyseResult['message'] = '调用百度语音脚本失败';
                callbackAll();
            });
        },
        //查看语音识别结果与语音关键词对应关系
        function (callback) {
            SoundKeyword.find(soundKeywordTemp)
                .exec(function (err, result) {
                    if (err) {
                        analyseResult['errorCode'] = 2000;
                        analyseResult['message'] = '异常错误：查询语音关键词异常';
                        callbackAll(analyseResult);
                    }
                    else if (!result) {
                        analyseResult['errorCode'] = 2000;
                        analyseResult['message'] = '当前用户未设置语音关键词';
                        callbackAll(analyseResult);
                    }
                    else {
                        for (var i = 0; i < result.length; i++) {
                            //连续说出两个关键词时，会报错; callback was already called.
                            if (soundRecognitionResult.indexOf(result[i].keyword) >= 0) {
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
                            analyseResult['errorCode'] = 2000;
                            analyseResult['message'] = '异常错误：查询网关失败';
                            callbackAll(analyseResult);
                        }
                        else if (result) {
                            //console.log('gateways:');
                            //console.log(result);
                            gateways = result;
                            //executeDeviceCommand(device, gateways, command);
                            callback();
                        }
                        else {
                            analyseResult['errorCode'] = 2000;
                            analyseResult['message'] = '当前用户未添加网关';
                            callbackAll(analyseResult);
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
                            analyseResult['errorCode'] = 2000;
                            analyseResult['message'] = '查询红外指令失败';
                            callbackAll(analyseResult);
                        }
                        else if (!result) {
                            analyseResult['errorCode'] = 2000;
                            analyseResult['message'] = '待执行的红外指令不存在';
                            callbackAll(analyseResult);
                        }
                        else {
                            if (!result.command) {
                                analyseResult['errorCode'] = 2000;
                                analyseResult['message'] = '红外指令有误';
                                callbackAll(analyseResult);
                            }
                            else {
                                gatewayModule.writeCommand(result.command, 'infraredCommand');
                            }
                        }
                    });
                callback();
            }
            else {
                analyseResult['errorCode'] = 2000;
                analyseResult['message'] = '当前语音数据异常';
                callbackAll(analyseResult);
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
                            analyseResult['errorCode'] = 2000;
                            analyseResult['message'] = '异常错误：查询设备失败';
                            callbackAll(analyseResult);
                        }
                        else if (result) {
                            device = result;
                            CommandModule.executeDeviceCommand(device, gateways, soundKeywordMatched.command);
                            callback();
                        }
                        else {
                            analyseResult['errorCode'] = 2000;
                            analyseResult['message'] = '异常错误：未找到待控制的设备';
                            callbackAll(analyseResult);
                        }
                    });
            }
        }
    ], function (callback) {
        analyseResult['errorCode'] = 0;
        analyseResult['message'] = '语音识别解析并执行操作成功';
        callbackAll(analyseResult);
    });
};


/**
 * 数据格式转化方法
 * （目前只针对动作指令）
 * 将来自智能笔的数据流格式化成标准指令流
 * 头为7e，尾为23，截取头尾，将中间的部分进行转化，一条数据可能含有几条指令，需进行切分
 * 格式化内容：7D 5E转成7e，2D 5E转成23，7D 5D转成7D， 2D 5D转成2D
 */
function formatActionDataFlowFromSmartPen(instruction) {

    var dataFlow = '';
    var instructionSet = [];
    var formattedData = '';
    var formatSuccess = false;
    var result = {};    //返回的结果集
    var i = 0;        //iterator

    //为字符串每两位加空格
    //此步骤的目的是排除 类似A7e2 这样的数据对数据帧头7e的干扰（数据帧尾23同理）
    for (i = 0; i < data.length; i++) {
        dataFlow = dataFlow + data[i];
        if (i % 2 == 1) {
            dataFlow = dataFlow + ' ';      //按照此方法，最后一位23后面依然会有一个空格，请注意
        }
    }

    var cutSuccess = false;         //截取命令
    var instruction = '';
    var cutIndex = 0;
    var startIndex = 0;
    var endIndex = 0;
    while (!cutSuccess) {
        startIndex = dataFlow.indexOf('7e');
        endIndex = dataFlow.indexOf('23');

        if (!((startIndex >= 0) && (endIndex >= 2) && (endIndex - startIndex > 2) )) {
            cutSuccess = true;
            break;
        }

        instruction = dataFlow.substring(startIndex, endIndex + 2);
        dataFlow = dataFlow.substring(endIndex + 3, dataFlow.length);

        instructionSet.push(instruction);

    }

    //console.log('instructionSet:');
    //for (var i = 0; i < instructionSet.length; i++) {
    //    console.log(instructionSet[i]);
    //}

    /**
     * 字符串处理代码
     * 流程：1.截取7e和23（即头与尾）    stringObject.substring(start,stop)
     *      2.处理转化      replace()
     */
    for (i = 0; i < instructionSet.length; i++) {
        //console.log(instructionSet[i]);

        startIndex = instructionSet[i].indexOf('7e');
        endIndex = instructionSet[i].indexOf('23');

        if ((startIndex >= 0) && (endIndex >= 2) && (endIndex - startIndex > 2)) {
            //instruction = instruction.substring(startIndex, endIndex + 2);

            //如果还存在图中的四个代替换字符串，就替换
            while ((instructionSet[i].indexOf('7d 5e') > 0) || (instructionSet[i].indexOf('2d 5e') > 0) ||
            (instructionSet[i].indexOf('7d 5d') > 0) || (instructionSet[i].indexOf('2d 5d') > 0)) {
                instructionSet[i] = instructionSet[i].replace('7d 5e', '7e');
                instructionSet[i] = instructionSet[i].replace('2d 5e', '23');
                instructionSet[i] = instructionSet[i].replace('7d 5d', '7d');
                instructionSet[i] = instructionSet[i].replace('2d 5d', '2d');
            }

            result['errorCode'] = 0;
            result['message'] = '指令格式化成功';
            //result['instruction'] = instruction;

            //console.log(result);
            //return result;
        }
        else {
            result['message'] = '指令格式不正确';
            result['errorCode'] = 500;
            return result;
        }
    }

    result['instructionSet'] = instructionSet;
    return result;


};

/**
 * 数据格式转化方法
 * 将发送给智能笔的指令流格式化成发送给智能笔能接收的数据流
 * 格式化内容：7e转成7D 5E，23转成2D 5E，7D转成7D 5D， 2D转成2D 5D
 */
exports.formatInstructionToSmartPen = function (instruction) {

    var formattedData = '';
    var formatSuccess = false;


    var result = {};

    //var instruction = '7e FF FF FF FF 00 09 FE 35 78 E2 56 00 0D 39 89 EF 2E 31 22 33 23';        //动作数据

    var instruction = '7e FF FF FF FF 7D 00 7D 2D 2D 7e 23 01 02 23';

    var startIndex = 0;
    var endIndex = 0;

    //console.log('\ninstruction1 : ' + instruction + '\n');

    startIndex = instruction.indexOf('7e');
    endIndex = instruction.lastIndexOf('23');

    //对end和index的判断，包括end必须大于start
    if ((startIndex >= 0) && (endIndex >= 2) && (endIndex - startIndex > 2)) {
        instruction = instruction.substring(3, instruction.length - 3);
        //console.log('\ninstruction2 : ' + instruction + '\n');

        //如果还存在四个代替换字符串，就替换
        var formatMidSuccess = false;
        while ((instruction.indexOf('7e') > 0) || (instruction.indexOf('23') > 0) ||
        (instruction.indexOf('7D') > 0) || (instruction.indexOf('2D') > 0)) {
            instruction = instruction.replace('7D', 'TEMP1');
            instruction = instruction.replace('2D', 'TEMP2');
            instruction = instruction.replace('7e', 'TEMP3');
            instruction = instruction.replace('23', 'TEMP4');
        }

        //console.log('\ninstruction3 : ' + instruction + '\n');

        while ((instruction.indexOf('TEMP1') > 0) || (instruction.indexOf('TEMP2') > 0) ||
        (instruction.indexOf('TEMP3') > 0) || (instruction.indexOf('TEMP4') > 0)) {
            instruction = instruction.replace('TEMP1', '7D 5D');
            instruction = instruction.replace('TEMP2', '2D 5D');
            instruction = instruction.replace('TEMP3', '7D 5E');
            instruction = instruction.replace('TEMP4', '2D 5E');
        }

        instruction = '7e ' + instruction + ' 23';
        console.log('\ninstruction4 : ' + instruction + '\n');

        result['errorCode'] = 0;
        result['message'] = '指令格式化成功';
        result['instruction'] = instruction;

        //console.log(result);
        return result;
    }
    else {
        result['message'] = '指令格式不正确';
        result['errorCode'] = 500;
        console.log(result.message);
        return result;
    }


    return formattedData;
};

