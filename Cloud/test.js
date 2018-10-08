//B
var fs = require('fs');

var AipSpeechClient = require("baidu-aip-sdk").speech;
//var fs = require('fs');
var voice = fs.readFileSync('./voice.pcm');
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


//var str = 'FC00FB000130EB1F03D0DD01122500124B000E916ECB08E60052470034170137021E00260064002500C409260088003A0200002100FFFFFFFFFFFFFFFF011111111222222222221111111122222345F00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001040376004C';
//var i;
//var tempString = '';
//
//for (i = 0; i < str.length; i++) {
//    tempString = tempString + str[i];
//    if (i % 2 == 1) {
//        tempString = tempString + ' ';      //按照此方法，最后一位23后面依然会有一个空格，请注意
//    }
//}
//console.log(tempString);


//fc 00 fc 00 01 30 eb 1f 03 d0 dd 03 12 24 00 12 4b 00 0e 91 6e cb 08 00 e6 00 52 47 00 34 18 01 36 02 21 00 23 00 67 00 23 00 c8 09 23 00 8a 00 38 02 00 00 1f 00 ff ff ff ff ff ff ff ff 01 11 11 11 12 22 22 22 21 11 21 11 12 22 12 22 23 45 f0 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 03 04 76 3e 70
//fc00fc000130eb1f03d0dd03122400124b000e916ecb0800e60052470034180136022100230067002300c80923008a00380200001f00ffffffffffffffff011111111222222221112111122212222345f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010304763e70
//var str = 'fc00fc000130eb1f03d0dd03122400124b000e916ecb0800e60052470034180136022100230067002300c80923008a00380200001f00ffffffffffffffff011111111222222221112111122212222345f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010304763e70';
////256*2
//var str2;
//str2 = str.toUpperCase();
//console.log(str);
//console.log(str2);
//console.log(str2.length);
//str2 = '00FB' + str2.substr(6, 16) + '011225' + str2.substr(28, 18) + 'E6' + str2.substr(50,460);
//console.log(str2);
//console.log(str2.length);


//console.log(checkParity('0015000130EB1F03D0DD01110100124B0011E784B70805'));
//console.log(checkParity('0015000130EB1F03D0DD01110100124B0011E784B70805'));
//00 15 00 01 30 eb 1f 03 d0 dd 01 11 01 00 12 4b 00 11 e7 84 b7 08 05
//console.log(decToHexStr(251));

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


//var str = '1b';
//console.log(str.charCodeAt(0).toString(16));


//console.log(Date.parse('2018-02-06 10:20:20.250'));

//var schedule = require("node-schedule");
//
//var rule = new schedule.RecurrenceRule();
//rule.dayOfWeek = [0, new schedule.Range(1, 6)];
//rule.hour = 9;
//rule.minute = 43;
//var j = schedule.scheduleJob(rule, function(){
//    console.log("执行任务");
//});


//var net = require('net');
////
////// 创建TCP服务器
//var server = net.createServer(function (socket) {
//    console.log('client connected');
//
//    socket.setEncoding("hex");
//    // 监听客户端的数据
//    socket.on('data', function (data) {
//        console.log('server got data from client: ', data.toString());
//    });
//    // 监听客户端断开连接事件
//    socket.on('end', function (data) {
//        console.log('connection closed');
//    });
//    // 发送数据给客户端
//    //socket.write('FC0015000120202020200801100100124B000FF6AA36080018');
//    //socket.write([0xFC,0x00,0x15,0x00,0x01,0x20,0x20,0x20,0x20,0x20,0x08,0x01,0x10,0x01,0x00,0x12,0x4B,0x00,0x0F,0xF6,0xAA,0x36,0x08,0x00,0x18]);
//    //var data = [0xFC, 0x00, 0x15, 0x00, 0x01, 0x20, 0x20, 0x20, 0x20, 0x20, 0x08, 0x01, 0x10, 0x01, 0x00, 0x12, 0x4B, 0x00, 0x0F, 0xF6, 0xAA, 0x36, 0x08, 0x00, 0x18];
//    //socket.write(data);
//
//    //测试成功
//    var buf = new Buffer(25);
//    buf.write('FC0015000120202020200801100100124B000FF6AA36080018', 0, 25, 'hex');
//    buf.write('FC0015000120202020200801100100124B000FF6AA36080119', 0, 25, 'hex');
//    socket.write(buf);
//});
//
//// 启动服务
//server.listen(7702, function () {
//    console.log('server bound 7702');
//});