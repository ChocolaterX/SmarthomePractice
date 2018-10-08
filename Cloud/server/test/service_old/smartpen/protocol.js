/**
 * Created by Jiang Suyang on 2016-12-2.
 * /cloud/server/service/smartpen/protocol.js
 * 该文件主要作用是解析服务器与智能笔的通信协议，将指令转化为指定格式或将格式转化为指令
 */

var fs = require('fs');
var async = require('async');
var validator = require('validator');

var actionInstructionSet = [];
var soundInstructionString = '';
var index = 0;
var getActionDataNotEnd = false;        //true代表正在接收动作数据帧
var getSoundDataNotEnd = false;         //true代表正在接收声音数据帧


/**
 * 解析从智能笔发来的（格式化过的）动作指令，转化为node服务器能理解的格式
 * 具体步骤：将智能笔的动作数据流（数条），转化成陀螺仪和加速度传感器的数据，写入文件，返回文件地址，将文件地址作为参数，调用动作识别jar包
 */
exports.analyseActionInstructionFromSmartPen = function (instructionSet, callbackAll) {

    var analyseResult = {};     //存储该方法总的返回结果

    var i = 0;        //iterator
    //console.log(instructionSet);

    //单独解析每条指令
    for (i = 0; i < instructionSet.length; i++) {
        //查看传入的指令格式是否正确
        if (typeof instructionSet[i] != 'string') {
            analyseResult['errorCode'] = 500;
            analyseResult['message'] = '待解析的指令格式有误';
            return analyseResult;
        }

        //Head位
        //Head必须为7e
        if (instructionSet[i].indexOf('7e') != 0) {
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

        //Type位
        //00代表成功
        if (instructionSet[i].substr(15, 2) != '00') {

            //收到动作开始帧
            if (instructionSet[i].substr(15, 5) == '01 09') {
                console.log('动作开始帧');
                actionInstructionSet = [];
                getActionDataNotEnd = true;
            }

            //收到动作结束帧
            else if (instructionSet[i].substr(15, 5) == '02 09') {
                console.log('动作结束帧');
                getActionDataNotEnd = false;

                //console.log('\n\nactionInstructionSet:\n');
                //console.log(actionInstructionSet);

                /**
                 * analyseResult ={errorCode: , message, execute:('action','sound'), actionIndex: Number, soundKeyword: String}
                 */
                i = 0;      //iterator
                var x = 0;  //iterator
                var y = 0;  //iterator
                var z = 0;  //iterator

                var dataForRecognition = [];   //使用数组先存储要写入文件的数据
                var stringForWrite = '';      //待写入动作识别文件的长字符串
                var actionRecognitionResult = [];       //使用JSON存储动作识别的返回结果

                //判断指令长度对不对
                var indexX = 0;
                var indexY = 0;
                var indexZ = 0;

                //加速度x轴
                for (i = 0; i < actionInstructionSet.length; i++) {
                    x = uintToInt(actionInstructionSet[i].substr(21, 5));
                    dataForRecognition.push(x);
                    if (stringForWrite.length == 0) {
                        stringForWrite = x;
                        indexX++;
                        continue;
                    }
                    indexX++;
                    stringForWrite = stringForWrite + ' ' + x;
                }

                //加速度y轴
                for (i = 0; i < actionInstructionSet.length; i++) {
                    y = uintToInt(actionInstructionSet[i].substr(27, 5));
                    dataForRecognition.push(y);
                    stringForWrite = stringForWrite + ' ' + y;
                    indexY++;
                }

                //加速度z轴
                for (i = 0; i < actionInstructionSet.length; i++) {
                    z = uintToInt(actionInstructionSet[i].substr(33, 5));
                    dataForRecognition.push(z);
                    stringForWrite = stringForWrite + ' ' + z;
                    indexZ++;
                }

                var actionIndex = -1;           //动作识别结果
                async.waterfall([
                    function (callback) {
                        fs.unlink('actionFeature.txt', function () {
                            //console.log('success');
                            try {
                                fs.appendFileSync('actionFeature.txt', stringForWrite);
                                //console.log('写入文件actionFeature.txt成功。');
                                callback();
                            }
                            catch (err) {
                                console.log('写入文件actionFeature.txt出错:' + err);
                                //return '';        //此处需添加返回错误提示
                            }
                        });
                    },
                    function (callback) {
                        var dataString = '';
                        actionIndex = -1;

                        //绝对路径成功，请注意此处相对路径位置为/cloud/bin文件夹下
                        /*var child = require('child_process').spawn('java', ['-jar',
                         'E://workspaces/taghome2_business/trunk/cloud/server/service/smartpen/FeatureClassifier_2.0.jar',
                         'E://workspaces/taghome2_business/trunk/cloud/bin/actionFeature.txt']);
                         child.stdout.on('data', function (data) {
                         //console.log('\n\n123451234512345 ' + data.toString());
                         //console.log(data);
                         dataString = validator.trim(data.toString());

                         //当length=3时，输出的是动作识别后匹配的表中的第几个动作
                         //当actionIndex>10时，不能用chatAt来判断
                         if (dataString.length >= 15) {
                         actionIndex = dataString.charAt(15);
                         console.log('actionIndex:' + actionIndex);
                         console.log('识别成功');
                         callback();
                         }
                         //var actionIndex = dataString.indexOf(1);
                         //console.log('length:' + dataString.length);
                         });*/

                        var child = require('child_process').spawn('java', ['-jar',
                            'E://workspaces/taghome2_business/trunk/cloud/server/service/smartpen/FeatureClassifier_1.0.jar',
                            'E://workspaces/taghome2_business/trunk/cloud/bin/actionFeature.txt']);
                        child.stdout.on('data', function (data) {
                            //console.log('\n\n123451234512345 ' + data.toString());
                            //console.log(data);
                            //console.log(data.length);
                            dataString = validator.trim(data.toString());

                            //console.log(dataString.length);
                            //当length=3时，输出的是动作识别后匹配的表中的第几个动作
                            //当actionIndex>10时，不能用chatAt来判断
                            if (dataString.length == 1) {
                                actionIndex = dataString.charAt(0);
                                console.log('actionIndex:' + actionIndex);
                                console.log('识别成功');
                                callback();
                            }
                            //var actionIndex = dataString.indexOf(1);
                            //console.log('length:' + dataString.length);
                        });
                        child.stderr.on("data", function (data) {
                            //console.log('调用动作识别模块失败：' + data.toString());
                            //message = '调用动作识别模块失败';
                            //return message;
                            actionRecognitionResult['errorCode'] = 500;
                            actionRecognitionResult['message'] = '调用动作识别模块失败';
                        });
                    }
                ], function (callback) {
                    /**
                     * actionRecognitionResult ={errorCode: , message, actionNumber: Number}
                     */
                    //动作判定成功
                    if (actionIndex > 0) {
                        //actionRecognitionResult['errorCode'] = 0;
                        //actionRecognitionResult['message'] = '动作识别成功';
                        actionRecognitionResult['actionIndex'] = actionIndex;
                        analyseResult['errorCode'] = 0;
                        analyseResult['message'] = '动作指令解析完成';
                        analyseResult['execute'] = 'action';
                        analyseResult['actionIndex'] = actionRecognitionResult.actionIndex;
                    }

                    //动作判定失败
                    else {
                        analyseResult['errorCode'] = 500;
                        analyseResult['message'] = '动作指令解析失败';
                        analyseResult['execute'] = 'action';
                    }
                    //console.log(actionRecognitionResult)
                    callbackAll(analyseResult);

                    return analyseResult;
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


            var cmd = instructionSet[i].substr(18, 2);    //CMD位
            //console.log('\ncmd位:' + cmd);

            // '7e FF FF FF FF 00  09  FE 35  78 E2  56 00  0D 39  89 EF  2e 31  22 33  23'

            //RESTART_WIFI
            if (cmd == '01') {

            }
            /*!//CONFIRM_GUID
             if (cmd == '02') {

             }
             //COPY_FACTORY_DEFAULT
             if (cmd == '03') {

             }
             //FACTORY_RESET
             if (cmd == '04') {

             }
             //AP_STA_MODE_CONFIG
             if (cmd == '05') {

             }
             //STA_SSID_CONFIG
             if (cmd == '06') {

             }
             //STA_KEY_CONFIG
             if (cmd == '07') {

             }
             //STA_TCP_CONFIG
             if (cmd == '08') {

             }*/
            //MPU_DATA 动作数据
            if (cmd == '09') {
                //var d1, d2, d3, d4, d5, d6;
                //console.log('动作帧');

                if (getActionDataNotEnd) {
                    actionInstructionSet.push(instructionSet[i]);
                }


            }
            //VOICE_DATA 语音数据
            if (cmd == '0a') {
                //if (getSoundDataNotEnd) {
                //    soundInstructionSet.push(instructionSet[i]);
                //}

            }
            if (cmd == '0b') {

            }
            //analyseResult = instructionSet[i];
            //return analyseResult;
        }
    }
    return {};
};

/**
 * 解析从智能笔发来的（格式化过的）语音指令，转化为node服务器能理解的格式
 * 具体步骤：将语音流写入文件，调用语音流python脚本，生成pcm文件，然后调用识别jar包，返回识别结果
 */
exports.analyseSoundInstructionFromSmartPen = function (soundInstructionString, callbackAll) {

    var analyseResult = {};     //存储该方法总的返回结果
    var i = 0;        //iterator

    console.log('abcabcabcabcabc:');
    console.log(soundInstructionString);
    async.waterfall([
        //写文件
        function (callback) {
            fs.unlink('soundFeature.txt', function () {
                //console.log('success');
                try {
                    fs.appendFileSync('soundFeature.txt', soundInstructionString);
                    console.log('写入文件soundFeature.txt成功。');
                    callback();
                }
                catch (err) {
                    console.log('写入文件soundFeature.txt出错:' + err);
                    //return '';        //此处需添加返回错误提示
                }
            });
        },
        //调用识别接口
        function (callback) {
            var child = require('child_process').spawn('java', ['-jar',
                'E://workspaces/taghome2_business/trunk/cloud/server/service/smartpen/SpeechRecognition_jar.jar',
                'E://workspaces/taghome2_business/trunk/cloud/server/service/smartpen/sound.wav']);
            child.stdout.on('data', function (data) {
                var dataString = validator.trim(data.toString());
                //console.log('length:' + dataString.length);

                if (dataString.length > 0) {
                    console.log(dataString);

                    analyseResult['errorCode'] = 0;
                    analyseResult['message'] = '调用语音识别模块成功';
                    analyseResult['soundRecognitionResult'] = dataString.substr(11, dataString.length - 1);
                    callback();
                }

            });
            child.stderr.on("data", function (data) {
                analyseResult['errorCode'] = 500;
                analyseResult['message'] = '调用语音识别模块失败';
                callback();
            });
        }
    ], function (callback) {
        return analyseResult;
    });
};

/**
 * 将语音识别内容与关键字进行匹配，返回匹配结果
 */
exports.matchingSoundKeywords = function (commandSets, deviceSets, sceneSets, soundContent, callbackAll) {

    var matchingResult = {};            //匹配结果
    var i, j;      //iterator
    var matchingDeviceKeywordSuccess = false;
    var matchingCommandKeywordSuccess = false;

    //匹配情景模式关键字
    for (i = 0; i < sceneSets.length; i++) {
        //如匹配到情景模式关键字，则直接返回匹配结果
        if (soundContent.indexOf(sceneSets[i].soundName) >= 0) {
            matchingResult['errorCode'] = 0;
            matchingResult['message'] = '匹配情景模式关键字成功';
            matchingResult['type'] = 'scene';
            matchingResult['sceneId'] = sceneSets[i].scene;
            callbackAll(matchingResult);
        }
    }

    //先匹配设备关键字，再匹配操作关键字
    for (i = 0; i < deviceSets.length; i++) {
        if (soundContent.indexOf(deviceSets[i].soundName) >= 0) {

            var newSoundContent = soundContent.replace(deviceSets[i].soundName, '');

            matchingResult['type'] = 'device';      //代表控制设备
            matchingResult['deviceId'] = deviceSets[i].device;
            matchingDeviceKeywordSuccess = true;
            break;
        }
    }

    if (matchingDeviceKeywordSuccess) {
        for (i = 0; i < commandSets.length; i++) {
            if (newSoundContent.indexOf(commandSets[i].soundName) >= 0) {

                matchingResult['errorCode'] = 0;
                matchingResult['message'] = '匹配控制设备关键字成功';
                matchingResult['command'] = commandSets[i].command;
                callbackAll(matchingResult);
            }
        }
    }

    matchingResult['errorCode'] = 500;
    matchingResult['message'] = '未匹配到语音关键字';
    callbackAll(matchingResult);
};

/**
 * 将uint转换成int
 * 此处传入的是字符串形式的uint，例如：ed f8（中间有空格）
 */
function uintToInt(uintString) {
    var first = uintString.substr(0, 1);
    var second = uintString.substr(1, 1);
    var third = uintString.substr(3, 1);
    var fourth = uintString.substr(4, 1);

    var i = 0;            //iterator

    var binaryResult = [];   //用boolean数组存储每一位
    var binaryTemp = '';
    var intResult = 0;

    //16进制转换成2进制 所需字典
    var hexToBinaryDic = {
        '0': '0000',
        '1': '0001',
        '2': '0010',
        '3': '0011',
        '4': '0100',
        '5': '0101',
        '6': '0110',
        '7': '0111',
        '8': '1000',
        '9': '1000',
        'a': '1010',
        'b': '1011',
        'c': '1100',
        'd': '1101',
        'e': '1110',
        'f': '1111'
    };

    //将16进制转化为16位boolean数组
    var j = 0;
    for (i = 0; i < 16; i++) {
        if ((i >= 0) && (i < 4)) {
            binaryTemp = hexToBinaryDic[first];
            if (binaryTemp.charAt(i) == '0') {
                binaryResult[i] = false;
            }
            else if (binaryTemp.charAt(i) == '1') {
                binaryResult[i] = true;
            }
            else {
                console.log('数据有误');
            }
        }
        else if ((i >= 4) && (i < 8)) {
            binaryTemp = hexToBinaryDic[second];
            if (binaryTemp.charAt(i - 4) == '0') {
                binaryResult[i] = false;
            }
            else if (binaryTemp.charAt(i - 4) == '1') {
                binaryResult[i] = true;
            }
            else {
                console.log('数据有误');
            }
        }
        else if ((i >= 8) && (i < 12)) {
            binaryTemp = hexToBinaryDic[third];
            if (binaryTemp.charAt(i - 8) == '0') {
                binaryResult[i] = false;
            }
            else if (binaryTemp.charAt(i - 8) == '1') {
                binaryResult[i] = true;
            }
            else {
                console.log('数据有误');
            }
        }
        else if ((i >= 12) && (i < 16)) {
            binaryTemp = hexToBinaryDic[fourth];
            if (binaryTemp.charAt(i - 12) == '0') {
                binaryResult[i] = false;
            }
            else if (binaryTemp.charAt(i - 12) == '1') {
                binaryResult[i] = true;
            }
            else {
                console.log('数据有误');
            }
        }
    }

    /*    console.log('binaryResult');
     for (i = 0; i < 16; i++) {
     console.log(binaryResult[i]);
     }*/

    //正数
    if (!binaryResult[0]) {
        intResult = 0;
        for (i = 1; i < 16; i++) {
            if (binaryResult[i]) {
                intResult += Math.pow(2, 15 - i);
            }
        }
    }
    //负数  取反+1
    else {
        var forward = false;            //判定每一位是否需要进1位

        for (i = 0; i < 16; i++) {      //取反
            binaryResult[i] = !binaryResult[i];
        }

        /*
         console.log('binaryResult取反');
         for (i = 0; i < 16; i++) {
         console.log(binaryResult[i]);
         }
         */

        for (i = 15; i > 0; i--) {      //+1
            if (binaryResult[i]) {
                binaryResult[i] = false;
                forward = true;
            }
            else {
                if (forward) {
                    binaryResult[i] = true;
                    forward = false;
                    break;
                }
                else {
                    break;
                }
            }
        }

        /*
         console.log('binaryResult取反+1');
         for (i = 0; i < 16; i++) {
         console.log(binaryResult[i]);
         }
         */

        intResult = 0;
        for (i = 0; i < 16; i++) {
            if (binaryResult[i]) {
                intResult += Math.pow(2, 15 - i);
            }
        }
        intResult = 0 - intResult;
    }

    //console.log('uintString:' + uintString);
    //console.log(first + second + third + fourth);
    //console.log('\n\n\n\n\n\nintResult:' + intResult + '\n\n\n');

    return intResult;
}


/**
 * 语音流格式转化和识别
 * flag: sound_start代表语音流开始，sound_process代表语音流接收中, sound_end代表语音流结束
 */
exports.formatSoundDataFlowFromSmartPen = function (data, flag) {

    //console.log(data);
    var result = {};                    //返回的结果集
    var formatSuccess = false;
    var soundInstruction = '';          //存储语音流中间值
    var soundInstructionResult = '';    //存储返回的语音流结果（要加空格）

    var i = 0;          //iterator


    if (flag == 'sound_start') {

        getSoundDataNotEnd = true;
        soundInstructionString = '';

        console.log('语音流开始');
        console.log(soundInstructionString);
        //console.log('语音流开始2');
    }
    else if (flag == 'sound_process' && getSoundDataNotEnd) {

        soundInstruction = data;

        while ((soundInstruction.indexOf('7e0a') >= 0) || (soundInstruction.indexOf('23')>=0)) {
            soundInstruction = soundInstruction.replace('7e0a', '');
            soundInstruction = soundInstruction.replace('23', '');
        }

        while ((soundInstruction.indexOf('7d5e') > 0) || (soundInstruction.indexOf('2d5e') > 0) ||
        (soundInstruction.indexOf('7d5d') > 0) || (soundInstruction.indexOf('2d5d') > 0)) {
            soundInstruction = soundInstruction.replace('7d5e', '7e');
            soundInstruction = soundInstruction.replace('2d5e', '23');
            soundInstruction = soundInstruction.replace('7d5d', '7d');
            soundInstruction = soundInstruction.replace('2d5d', '2d');
        }

        soundInstructionString = soundInstructionString + '' + soundInstruction;

        console.log('语音流进行中');
        //console.log(soundInstructionString);
    }
    else if (flag == 'sound_end' && getSoundDataNotEnd) {
        //console.log('语音流结束1');
        //console.log(soundInstructionString);

        var endIndex = data.indexOf('7effffffff040a');          //有效语音帧的末位index

        if (endIndex > 0) {
            soundInstruction = data.substr(0, endIndex);
            while ((soundInstruction.indexOf('7d5e') > 0) || (soundInstruction.indexOf('2d5e') > 0) ||
            (soundInstruction.indexOf('7d5d') > 0) || (soundInstruction.indexOf('2d5d') > 0)) {
                soundInstruction = soundInstruction.replace('7d5e', '7e');
                soundInstruction = soundInstruction.replace('2d5e', '23');
                soundInstruction = soundInstruction.replace('7d5d', '7d');
                soundInstruction = soundInstruction.replace('2d5d', '2d');
            }

            soundInstructionString = soundInstructionString + '' + soundInstruction;
        }

        console.log('语音流结束2');
        //console.log(soundInstructionString);
        getSoundDataNotEnd = false;

        //console.log(soundInstructionString.length);
        //console.log(soundInstructionString[i]);

        for (i = 0; i < soundInstructionString.length; i++) {
            soundInstructionResult = soundInstructionResult + soundInstructionString[i];
            if (i % 2 == 1) {
                soundInstructionResult = soundInstructionResult + ' ';      //按照此方法，最后一位23后面依然会有一个空格，请注意
            }
        }

        result['errorCode'] = 0;
        result['message'] = '指令格式化成功';
        result['soundInstructionResult'] = soundInstructionResult;
    }
    else {
        getSoundDataNotEnd = false;
        console.log('语音流格式出错');

        result['errorCode'] = 500;
        result['message'] = '指令格式化失败';
    }

    return result;

};

/**
 * 数据格式转化方法（目前只针对动作指令）
 * 将来自智能笔的数据流格式化成标准指令流
 * 头为7e，尾为23，截取头尾，将中间的部分进行转化，一条数据可能含有几条指令，需进行切分
 * 格式化内容：7D 5E转成7e，2D 5E转成23，7D 5D转成7D， 2D 5D转成2D
 */
exports.formatActionDataFlowFromSmartPen = function (data) {

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
 *
 */
exports.formatActionDataFlowFromSmartPen = function (data) {

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
 * 将欲发送给智能笔的指令流格式化成发送给智能笔能接收的数据流
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
}
;








