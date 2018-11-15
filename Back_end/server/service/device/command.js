const asyncModule = require('async');
const validator = require('validator');
const deviceConfig = require('../../../config/device');
const controlDeviceModel = require('../../model/controlDevice');
const gatewayModule = require('../../../gateway/index');

//使用控制按钮进行设备控制
exports.command = async (ctx) => {
    let response = {};
    let {deviceId, command} = ctx.request.body;
    let userId = ctx.request.header.userid;
    let device = {};    //待控制设备
    let gateways = [];  //用户的网关
    let deviceEntity = {
        _id: deviceId,
        user: userId
    };

    return new Promise((resolve, reject) => {
        asyncModule.waterfall([
            callback => {
                controlDeviceModel.findOne(deviceEntity)
                    .exec((err, result) => {
                        if (err) {
                            console.log('异常错误：删除设备失败');
                            reject(err);
                        }
                        else if (result) {
                            device = result;
                            callback();
                        }
                        else {
                            response = {
                                errorCode: 700,
                                message: '未找到待控制的设备'
                            };
                            resolve(response);
                        }
                    });
            },
            //找到用户名下所有的gateways
            callback => {
                delete deviceEntity._id;
                deviceEntity['type'] = 0;
                controlDeviceModel.find(deviceEntity)
                    .exec((err, result) => {
                        if (err) {
                            console.log('异常错误：删除设备失败');
                            reject(err);
                        }
                        else if (result) {
                            gateways = result;
                            callback();
                        }
                        else {
                            response = {
                                errorCode: 700,
                                message: '当前用户未添加网关'
                            };
                            resolve(response);
                        }
                    });
            },
            callback => {
                let instructions = formatControlInstruction(gateways, device, command);
                for (let i = 0; i < instructions.length; i++) {
                    gatewayModule.writeCommand(instructions[i]);
                }
                // console.log(instructions);
                response = {
                    errorCode: 0,
                    message: '执行完成'
                };
                callback();
            }
        ], () => {
            resolve(response);
        });
    });
};

//使用指令进行设备控制
exports.instruction = async (ctx) => {
    let {instruction} = ctx.request.body;
    let response = {};

    //instruction格式处理
    instruction = validator.trim(instruction);
    //去掉空格
    instruction = instruction.replace(/\s*/g, "");
    instruction = instruction.replace(/^\s*|\s*$/g, "");

    console.log(instruction);

    return new Promise((resolve, reject) => {
        gatewayModule.writeCommand(instruction);
        response = {
            errorCode: 0,
            message: '控制指令发送成功'
        };
        resolve(response);
    });
};

//将命令转译成指令
function formatControlInstruction(gateways, device, command) {
    let instructions = [], instruction = '', parityByte;
    let cmd0, cmd1, d10, d11;
    cmd1 = '01';

    switch (command) {
        case 'SwitchLeftOff':
            cmd0 = '10';
            d10 = '08';
            d11 = '01';
            break;
        case 'SwitchLeftOn':
            cmd0 = '10';
            d10 = '08';
            d11 = '00';
            break;
        case 'SwitchRightOff':
            cmd0 = '10';
            d10 = '09';
            d11 = '01';
            break;
        case 'SwitchRightOn':
            cmd0 = '10';
            d10 = '09';
            d11 = '00';
            break;
        case 'CurtainOpen':
            cmd0 = '11';
            d10 = '08';
            d11 = '04';
            break;
        case 'CurtainClose':
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

    for (let i = 0; i < gateways.length; i++) {
        instruction = '00150001' + gateways[i].mac + '01' + cmd0 + cmd1 + device.mac + d10 + d11;
        parityByte = checkParity(instruction);
        instruction = 'FC' + instruction + parityByte;
        instructions.push(instruction);
    }
    //处理一下控制返回消息


    // console.log('instructions:');
    // console.log(instructions);

    return instructions;
}

//CRC校验
function checkParity(instruction) {
    let length = instruction.length;
    let checkResult = hexStrToDec(instruction.substr(0, 2));
    for (let i = 2; i < length; i = i + 2) {
        checkResult = checkResult ^ hexStrToDec(instruction.substr(i, 2));
    }

    return decToHexStr(checkResult);
}

//16进制（字符串）转成10进制数字
function hexStrToDec(str) {
    let num = 0;
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
    let str = '';
    let firstBit = Math.floor(dec / 16);
    let secondBit = dec % 16;
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
