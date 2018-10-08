/**
 * <copyright file="infraredCommand.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>4/2/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var validator = require('validator');
var fs = require('fs');
var request = require('request');
var async = require('async');
var path = require('path');

var InfraredCommand = mongoose.model('InfraredCommand');
var Device = mongoose.model('Device');
var gatewayModule = require('../gateway/gateway');


//添加一个新的红外指令
exports.createInfraredCommand = function (req, res) {
    var user;
    var name;
    var telecontrollerId;

    if (!req.user.current) {
        return res.json({
            errorCode: 2300,
            message: '无法获取当前用户'
        });
    }
    else {
        user = req.user.current;
    }
    if (!req.body.name) {
        return res.json({
            errorCode: 2300,
            message: '未命名当前红外指令'
        });
    }
    else {
        name = req.body.name;
    }
    if (!req.body.telecontrollerId) {
        return res.json({
            errorCode: 2300,
            message: '未选择遥控器'
        });
    }
    else {
        telecontrollerId = req.body.telecontrollerId;
    }

    var infraredCommandTemp = {};
    infraredCommandTemp['user'] = user;
    infraredCommandTemp['name'] = name;
    infraredCommandTemp['telecontroller'] = telecontrollerId;
    var infraredCommandId;

    async.waterfall([
        //查询该红外指令是否已存在
        function (callback) {
            InfraredCommand.findOne(infraredCommandTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2300,
                            message: '异常错误：查询红外指令失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2300,
                            message: '待添加的红外指令已存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        //添加红外指令
        function (callback) {
            infraredCommandTemp['showComponent'] = false;
            var infraredCommandSave = new InfraredCommand(infraredCommandTemp);
            infraredCommandSave.save(function (err, result) {
                if (err) {
                    return res.json({
                        errorCode: 2300,
                        message: '异常错误：添加红外指令失败'
                    });
                }
                else if (!result) {
                    return res.json({
                        errorCode: 2300,
                        message: '异常错误：添加红外指令失败'
                    });
                }
                else {
                    infraredCommandId = result._id;
                    callback();
                }
            })
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '添加红外指令成功',
            infraredCommandId: infraredCommandId
        })
    });
};

//更新红外指令信息
exports.updateInfraredCommand = function (req, res) {
    var user;
    var name;
    var infraredCommandId;

    if (!req.user.current) {
        return res.json({
            errorCode: 2300,
            message: '无法获取当前用户'
        });
    }
    else {
        user = req.user.current;
    }
    if (!req.body.infraredCommandId) {
        return res.json({
            errorCode: 2300,
            message: '未选择要更新的红外指令'
        });
    }
    else {
        infraredCommandId = req.body.infraredCommandId;
    }
    if (!req.body.name) {
        return res.json({
            errorCode: 2300,
            message: '未命名当前红外指令'
        });
    }
    else {
        name = req.body.name;
    }

    var infraredCommandTemp = {};
    infraredCommandTemp['user'] = user;

    async.waterfall([
        //查询待修改的红外指令是否存在
        function (callback) {
            infraredCommandTemp['_id'] = infraredCommandId;
            InfraredCommand.findOne(infraredCommandTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2300,
                            message: '异常错误：查询红外指令失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2300,
                            message: '待修改的红外指令不存在'
                        });
                    }
                    else {
                        infraredCommandTemp['telecontroller'] = result.telecontroller;
                        callback();
                    }
                })
        },
        //查询红外指令的名称是否已存在
        function (callback) {
            delete infraredCommandTemp._id;
            infraredCommandTemp['name'] = name;
            InfraredCommand.findOne(infraredCommandTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2300,
                            message: '异常错误：查询红外指令失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2300,
                            message: '待添加的红外指令已存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        //更新红外指令
        function (callback) {
            infraredCommandTemp['showComponent'] = false;
            InfraredCommand.update({_id: infraredCommandId}, {$set: infraredCommandTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 2300,
                        message: '异常错误：更新红外指令失败'
                    });
                }
                else {
                    callback();
                }
            });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '更新红外指令成功'
        })
    });

};

//查看红外指令列表
exports.getInfraredCommandList = function (req, res) {
    var user;
    var telecontrollerId;

    if (!req.user.current) {
        return res.json({
            errorCode: 2300,
            message: '无法获取当前用户'
        });
    }
    else {
        user = req.user.current;
    }
    if (!req.body.telecontrollerId) {
        return res.json({
            errorCode: 2300,
            message: '未选择遥控器'
        });
    }
    else {
        telecontrollerId = req.body.telecontrollerId;
    }

    var infraredCommandTemp = {};
    infraredCommandTemp['user'] = user;
    infraredCommandTemp['telecontroller'] = telecontrollerId;
    var infraredCommands = [];

    async.waterfall([
        function (callback) {
            InfraredCommand.find(infraredCommandTemp)
                .sort({createdTime: -1})
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2300,
                            message: '异常错误：查询红外指令失败'
                        });
                    }
                    else {
                        infraredCommands = result;
                        callback();
                    }
                })
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '查询红外指令成功',
            infraredCommands: infraredCommands
        })
    });
};

//删除红外指令
exports.deleteInfraredCommand = function (req, res) {
    var user;
    var infraredCommandId;

    if (!req.user.current) {
        return res.json({
            errorCode: 2300,
            message: '无法获取当前用户'
        });
    }
    else {
        user = req.user.current;
    }
    if (!req.body.infraredCommandId) {
        return res.json({
            errorCode: 2300,
            message: '未选择要更新的红外指令'
        });
    }
    else {
        infraredCommandId = req.body.infraredCommandId;
    }

    var infraredCommandTemp = {};
    infraredCommandTemp['user'] = user._id;

    async.waterfall([
        //查询待删除的红外指令是否存在
        function (callback) {
            infraredCommandTemp['_id'] = infraredCommandId;
            InfraredCommand.findOne(infraredCommandTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2300,
                            message: '异常错误：查询红外指令失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2300,
                            message: '待删除的红外指令不存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        function (callback) {
            InfraredCommand.remove({_id: infraredCommandId}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 2300,
                        message: '异常错误：删除红外指令失败'
                    });
                }
                else {
                    callback();
                }
            });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '删除红外指令成功'
        })
    });
};

//开始学习红外指令
exports.startSimulateInfraredCommand = function (req, res) {
    var user;
    var infraredMac;

    if (!req.user.current) {
        return res.json({
            errorCode: 2300,
            message: '无法获取当前用户'
        });
    }
    else {
        user = req.user.current;
    }
    if (!req.body.infraredMac) {
        return res.json({
            errorCode: 2300,
            message: '未选择要学习的红外设备'
        });
    }
    else {
        infraredMac = req.body.infraredMac;
    }

    var deviceTemp = {};
    deviceTemp['user'] = user._id;
    var infraredDevice = {};
    var gateways = [];
    var instruction = '';

    async.waterfall([
            //查询网关
            function (callback) {
                deviceTemp['type'] = 0;
                Device.find(deviceTemp)
                    .exec(function (err, result) {
                        if (err) {
                            return res.json({
                                errorCode: 2300,
                                message: '异常错误：无法获取当前用户'
                            });
                        }
                        else if (!result) {
                            return res.json({
                                errorCode: 2300,
                                message: '当前用户并无网关'
                            });
                        }
                        else {
                            gateways = result;
                            callback();
                        }
                    });
            },
            //查询红外设备
            function (callback) {
                deviceTemp.type = 5;
                deviceTemp['mac'] = infraredMac;
                Device.findOne(deviceTemp)
                    .exec(function (err, result) {
                        if (err) {
                            return res.json({
                                errorCode: 2300,
                                message: '异常错误：无法获取当前用户'
                            });
                        }
                        else if (!result) {
                            return res.json({
                                errorCode: 2300,
                                message: '当前用户并无此红外设备'
                            });
                        }
                        else {
                            infraredDevice = result;
                            callback();
                        }
                    });
            },
            //指令
            function (callback) {
                //发送一条学习开始指令
                //gatewayModule.writeCommand('FC0016000130EB1F03D0DD01122300124B000E916ECB08000086', 'infrared');
                //'FC0016000130EB1F03D0DD 011223 00124B000E916ECB 08000086'
                //FC0016000130EB1F03D0DD01122300124B000E916ECB08000086
                //30EB1F03D0DD
                var i;
                var j;
                var parityByte;
                for (i = 0; i < gateways.length; i++) {
                    instruction = '00160001' + gateways[i].mac + '011223' + infraredDevice.mac + '080000';
                    parityByte = checkParity(instruction);
                    instruction = 'FC' + instruction + parityByte;
                    gatewayModule.writeCommand(instruction, 'infrared');
                }
                callback();
            }
        ],
        function (callback) {
            return res.json({
                errorCode: 0,
                message: '开始学习红外指令，请点击选定按钮'
            })
        }
    );
};

//确认学习指令完成
exports.confirmSimulateInfraredCommand = function (req, res) {
    var user;
    var infraredCommandId;
    var formattedCommand = '';
    var command = gatewayModule.getInfraredCommand();
    //var command = 'fc00fc000130eb1f03d0dd03122400124b000e916ecb0800e60052470034180136022100230067002300c80923008a00380200001f00ffffffffffffffff011111111222222221112111122212222345f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010304763e70';

    if (!req.user.current) {
        return res.json({
            errorCode: 2300,
            message: '无法获取当前用户'
        });
    }
    else {
        user = req.user.current;
    }
    if (!req.body.infraredCommandId) {
        return res.json({
            errorCode: 2300,
            message: '未选择要更新的红外指令'
        });
    }
    else {
        infraredCommandId = req.body.infraredCommandId;
    }
    if (!command) {
        return res.json({
            errorCode: 2300,
            message: '指令为空，无法获取'
        })
    }
    else {
        formattedCommand = formatInfraredCommand(command);
    }

    var infraredCommandTemp = {};
    async.waterfall([
        //查询待确认的指令是否存在
        function (callback) {
            infraredCommandTemp['_id'] = infraredCommandId;
            infraredCommandTemp['user'] = user;
            InfraredCommand.findOne(infraredCommandTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2300,
                            message: '异常错误：查询红外指令失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2300,
                            message: '待确认的红外指令不存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        //存储指令
        function (callback) {
            infraredCommandTemp['command'] = formattedCommand;
            InfraredCommand.update({_id: infraredCommandId}, {$set: infraredCommandTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 2300,
                        message: '异常错误：更新红外指令失败'
                    });
                }
                else {
                    callback();
                }
            });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '指令学习成功'
        });
    });
};

//执行红外指令
exports.executeInfraredCommand = function (req, res) {
    var user;
    var infraredCommandId;

    if (!req.user.current) {
        return res.json({
            errorCode: 2300,
            message: '无法获取当前用户'
        });
    }
    else {
        user = req.user.current;
    }
    if (!req.body.infraredCommandId) {
        return res.json({
            errorCode: 2300,
            message: '未选择要执行的红外指令'
        });
    }
    else {
        infraredCommandId = req.body.infraredCommandId;
    }

    var infraredCommandTemp = {};
    infraredCommandTemp['user'] = user._id;
    var infraredCommand;

    async.waterfall([
        //查询待执行的红外指令是否存在
        function (callback) {
            infraredCommandTemp['_id'] = infraredCommandId;
            InfraredCommand.findOne(infraredCommandTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2300,
                            message: '异常错误：查询红外指令失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2300,
                            message: '待执行的红外指令不存在'
                        });
                    }
                    else {
                        infraredCommand = result;
                        callback();
                    }
                })
        },
        //执行红外指令
        function (callback) {
            if (!infraredCommand.command) {
                return res.json({
                    errorCode: 2300,
                    message: '红外指令有误'
                });
            }
            else {
                //test 通电指令 2018.4.16
                //var abc='FC00FB000130EB1F03D0DD01122500124B000E916ECB08E60052470034170137021E00260064002500C409260088003A0200002100FFFFFFFFFFFFFFFF011111111222222222221111111122222345F00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001040376004C';
                //gatewayModule.writeCommand(abc, 'infraredCommand');

                gatewayModule.writeCommand(infraredCommand.command, 'infraredCommand');
                callback();
            }
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '红外指令执行完成'
        });
    });

};


//红外转发指令处理
//指令长度（fc改成fb），指向（03改成01），指向（12 24改成12 25），长度（00 e6改成e6），奇偶校验位
//fc 00 fc 00 01 30 eb 1f 03 d0 dd 03 12 24 00 12 4b 00 0e 91 6e cb 08 00 e6 00 52 47 00 34 18 01 36 02 21 00 23 00 67 00 23 00 c8 09 23 00 8a 00 38 02 00 00 1f 00 ff ff ff ff ff ff ff ff 01 11 11 11 12 22 22 22 21 11 21 11 12 22 12 22 23 45 f0 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 03 04 76 3e 70
//fc00fc000130eb1f03d0dd03122400124b000e916ecb0800e60052470034180136022100230067002300c80923008a00380200001f00ffffffffffffffff011111111222222221112111122212222345f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010304763e70
function formatInfraredCommand(command) {
    var formattedCommand;

    formattedCommand = command.toUpperCase();
    formattedCommand = '00FB' + formattedCommand.substr(6, 16) + '011225' + formattedCommand.substr(28, 18) + 'E6' + formattedCommand.substr(50, 460);

    var parityByte = checkParity(formattedCommand);
    formattedCommand = 'FC' + formattedCommand + parityByte;

    console.log('infrared command:' + formattedCommand);
    return formattedCommand;
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
