const asyncModule = require('async');
const validator = require('validator');
const deviceConfig = require('../../../config/device');
const controlDeviceModel = require('../../model/controlDevice');
const gatewayModule = require('../../../gateway/index');

//添加设备
//参数检查
exports.create = async (ctx) => {
    let response = {};
    let deviceId = '';
    let {mac, name} = ctx.request.body;
    let userId = validator.trim(ctx.request.header.userid);
    let deviceEntity = {
        mac
    };

    return new Promise((resolve, reject) => {
        asyncModule.waterfall([
            callback => {
                controlDeviceModel.findOne(deviceEntity, (err, result) => {
                    if (err) {
                        console.log('异常错误：查询设备失败');
                        reject(err);
                    }
                    else if (result) {
                        if (result.user) {
                            if (validator.trim(result.user + '') !== userId) {

                                response = {
                                    errorCode: 700,
                                    message: '该设备已被他人添加'
                                };
                                resolve(response);
                            }
                            else {
                                response = {
                                    errorCode: 700,
                                    message: '该设备已被您添加'
                                };
                                resolve(response);
                            }
                        }
                        deviceId = result._id;
                        callback();
                    }
                    else {
                        response = {
                            errorCode: 700,
                            message: '未查询到该设备'
                        };
                        resolve(response);
                    }
                });
            },
            callback => {
                deviceEntity['name'] = name;
                deviceEntity['user'] = userId;
                controlDeviceModel.updateOne({_id: deviceId}, {$set: deviceEntity}, (err, result) => {
                    if (err) {
                        console.log('异常错误：更新设备失败');
                        reject(err);
                    }
                    else {
                        response = {
                            errorCode: 0,
                            message: '更新设备成功',
                            controlDevice: result
                        };
                        callback();
                    }
                });
            }
        ], () => {
            resolve(response);
        });
    });
};

//设备列表
//参数检查
exports.retrievalList = async (ctx) => {
    let response = {};
    let userId = ctx.request.header.userid;
    let deviceEntity = {
        user: userId
    };
    return new Promise((resolve, reject) => {
        controlDeviceModel.find(deviceEntity)
            .sort({type: 1})
            .exec((err, result) => {
                if (err) {
                    console.log('异常错误：查询设备失败');
                    reject(err);
                }
                else {
                    response = {
                        errorCode: 0,
                        message: '查找设备列表成功',
                        controlDevices: result
                    };
                    resolve(response);
                }
            });
        // controlDeviceModel.find(deviceEntity, (err, result) => {
        //     if (err) {
        //         console.log('异常错误：查询设备失败');
        //         reject(err);
        //     }
        //     else {
        //         response = {
        //             errorCode: 0,
        //             message: '查找设备列表成功',
        //             controlDevices: result
        //         };
        //         resolve(response);
        //     }
        // });
    });
};

exports.update = async (ctx) => {
    let response = {};
    let {deviceId, name} = ctx.request.body;
    let userId = ctx.request.header.userid;
    let deviceEntity = {
        _id: deviceId,
        user: userId
    };
    return new Promise((resolve, reject) => {
        asyncModule.waterfall([
            callback => {
                controlDeviceModel.findOne(deviceEntity, (err, result) => {
                    if (err) {
                        console.log('异常错误：查询设备失败');
                        reject(err);
                    }
                    else if (result) {
                        callback();
                    }
                    else {
                        response = {
                            errorCode: 700,
                            message: '未找到待更新的设备'
                        };
                        resolve(response);
                    }
                });
            },
            callback => {
                deviceEntity['name'] = name;
                controlDeviceModel.updateOne({_id: deviceId}, {$set: deviceEntity}, (err, result) => {
                    if (err) {
                        console.log('异常错误：更新设备失败');
                        reject(err);
                    }
                    else {
                        response = {
                            errorCode: 0,
                            message: '更新设备成功'
                        };
                        callback();
                    }
                });
            }
        ], () => {
            resolve(response);
        });
    });
};

exports.delete = async (ctx) => {
    let response = {};
    let {deviceId} = ctx.request.body;
    let userId = ctx.request.header.userid;
    let deviceEntity = {
        _id: deviceId,
        user: userId
    };
    return new Promise((resolve, reject) => {
        asyncModule.waterfall([
            callback => {
                controlDeviceModel.findOne(deviceEntity, (err, result) => {
                    if (err) {
                        console.log('异常错误：查询设备失败');
                        reject(err);
                    }
                    else if (result) {
                        callback();
                    }
                    else {
                        response = {
                            errorCode: 700,
                            message: '未找到待删除的设备'
                        };
                        resolve(response);
                    }
                });
            },
            callback => {
                deviceEntity['name'] = null;
                deviceEntity['user'] = null;
                controlDeviceModel.updateOne({_id: deviceId}, {$set: deviceEntity}, (err, result) => {
                    if (err) {
                        console.log('异常错误：删除设备失败');
                        reject(err);
                    }
                    else {
                        response = {
                            errorCode: 0,
                            message: '删除设备成功'
                        };
                        callback();
                    }
                });
            }
        ], () => {
            resolve(response);
        });
    });
};

//得到控制台消息
exports.console = async (ctx) => {
    let response = {};
    let userId = ctx.request.header.userid;
    let deviceEntity = {
        user: userId,
        type: 0
    };
    let gateways = [];

    return new Promise((resolve, reject) => {
        asyncModule.waterfall([
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
                                errorCode: 700,
                                message: '未查询到当前用户的网关'
                            };
                            resolve(response);
                        }
                    });
            },
            callback => {
                response=gatewayModule.getConsole(gateways, 'control');
                // console.log('\n response');
                // console.log(response);
                callback();
            }
        ], () => {
            resolve(response);
        });
    });
};