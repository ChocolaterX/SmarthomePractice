const asyncModule = require('async');
const validator = require('validator');
const deviceConfig = require('../../../config/device');
const controlDeviceModel = require('../../model/controlDevice');
// const securityDeviceModel = require('../../model/securityDevice');
const gatewayModule = require('../../../gateway/index');

//获取用户所有的网关
exports.retrievalGatewayList = async ctx => {
    let response = {};
    let userId = ctx.request.header.userid;
    let deviceEntity = {user: userId, type: 0};

    return new Promise((resolve, reject) => {
        controlDeviceModel.find(deviceEntity)
            .exec((err, result) => {
                if (err) {
                    console.log('异常错误：查询用户网关失败');
                    reject(err);
                }
                else if (result) {
                    response = {
                        errorCode: 0,
                        message: '查询用户网关成功',
                        gateways: result
                    };
                    resolve(response);
                }
                else {
                    response = {
                        errorCode: 900,
                        message: '当前用户并未添加网关',
                    };
                    resolve(response);
                }
            });
    });
};

//对指定网关发送开放组网指令
exports.open = async ctx => {
    let response = {};
    let {gatewayId} = ctx.request.body;
    let userId = ctx.request.header.userid;
    let gateway = {};
    let deviceEntity = {user: userId, type: 0, _id: gatewayId};

    return new Promise((resolve, reject) => {
        asyncModule.waterfall([
            callback => {
                controlDeviceModel.findOne(deviceEntity)
                    .exec((err, result) => {
                        if (err) {
                            console.log('异常错误：查询用户网关失败');
                            reject(err);
                        }
                        else if (result) {
                            gateway = result;
                            callback();
                        }
                        else {
                            response = {
                                errorCode: 900,
                                message: '未查询到当前用户的网关'
                            };
                            resolve(response);
                        }
                    });
            },
            callback => {
                let instruction = formatInstruction(gateway, 'open');
                // for (let i = 0; i < instructions.length; i++) {
                //     gatewayModule.writeInstruction(instructions[i]);
                // }
                console.log('开放组网指令：' + instruction);
                gatewayModule.writeInstruction(instruction);
                response = {
                    errorCode: 0,
                    message: '成功发送开放网络指令'
                };
                callback();
            }
        ], () => {
            resolve(response);
        });
    });
};

//获取用户所有关联的设备
exports.retrievalDeviceList = async ctx => {
    let response = {};
    let userId = ctx.request.header.userid;
    let gateways = [];
    let deviceEntity = {user: userId, type: 0};
    let devicesFromHeartbeat = [];          //从心跳包获取到的当前设备
    let devices = [];                       //经过格式处理后的设备

    return new Promise((resolve, reject) => {
        asyncModule.waterfall([
            //获取所有的网关
            callback => {
                controlDeviceModel.find(deviceEntity)
                    .exec((err, result) => {
                        if (err) {
                            console.log('异常错误：查询用户网关失败');
                            reject(err);
                        }
                        else if (result) {
                            gateways = result;
                            callback();
                        }
                        else {
                            response = {
                                errorCode: 900,
                                message: '未查询到当前用户的网关'
                            };
                            resolve(response);
                        }
                    });
            },
            callback => {
                devicesFromHeartbeat = gatewayModule.getDevicesFromHeartbeat(gateways).devices;
                if (devicesFromHeartbeat.length === 0) {
                    response = {
                        errorCode: 900,
                        message: '当前网络内尚未有设备'
                    };
                    resolve(response);
                }
                callback();
            },
            callback => {
                //查询数据库，显示信息
                //此处稍后添加
                // let devicesMac = [];
                // for (let i = 0; i < devicesFromHeartbeat.length; i++) {
                //     devicesMac.push(devicesFromHeartbeat[i].substr(0, 16));
                // }
                let mac = '';
                let port;
                let deviceId;
                let device = {};
                for (let i = 0; i < devicesFromHeartbeat.length; i++) {
                    mac = devicesFromHeartbeat[i].substr(0, 16);
                    port = devicesFromHeartbeat[i].substr(16, 2);
                    deviceId = devicesFromHeartbeat[i].substr(18, 4);
                    device = {
                        mac,
                        port,
                        deviceId
                    };
                    devices.push(device);
                }
                response = {
                    errorCode: 0,
                    message: '查询设备成功',
                    devices
                };
                callback();
            }
        ], () => {
            resolve(response);
        });
    });
};

//从当前网络中删除某个设备节点
exports.delete = async ctx => {

};

/**
 * 单个网关的命令转译
 * type可选值:'open'
 */
function formatInstruction(gateway, type) {
    let instruction = '';
    let parityByte;

    if (type === 'open') {
        instruction = '000C0001' + gateway.mac + '01001010';    //最后的10代表16秒
        // instruction = '000C0001'+gateway.mac +'02001000';
        //000C 0001 202020303008 02 0010 00
        parityByte = checkParity(instruction);
        instruction = 'FC' + instruction + parityByte;
    }

    return instruction;
}

//多个网关的命令转译

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

