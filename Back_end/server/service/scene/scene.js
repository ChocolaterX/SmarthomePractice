const asyncModule = require('async');
const validator = require('validator');
var userModel = require('../../model/user');
var deviceModel = require('../../model/controlDevice');
var sceneModel = require('../../model/scene');

//添加情景模式
exports.create = async (ctx) => {
    let response = {};
    let {name, commands} = ctx.request.body;
    let userId = ctx.request.header.userid;
    let sceneEntity = new sceneModel({
        name,
        commands,
        user: userId
    });

    return new Promise((resolve, reject) => {
        sceneEntity.save((err, result) => {
            if (err) {
                response = {
                    errorCode: 900,
                    message: '异常错误：创建情景模式失败 ' + err
                };
                reject(response);
            }
            else {
                response = {
                    errorCode: 0,
                    message: '创建情景模式成功',
                    scene: result
                };
                resolve(response);
            }
        });
    });
};

//情景模式列表
exports.retrievalList = async (ctx) => {
    let response = {};
    let userId = ctx.request.header.userid;
    let sceneEntity = {
        user: userId
    };

    return new Promise((resolve, reject) => {
        sceneModel.find(sceneEntity)
            .exec((err, result) => {
                if (err) {
                    response = {
                        errorCode: 900,
                        message: '异常错误：查询情景模式失败 ' + err,
                    };
                    reject(response);
                }
                else {
                    response = {
                        errorCode: 0,
                        message: '查询情景模式成功',
                        scenes: result
                    }
                }
            });
    });
};

exports.retrievalDetail = async (ctx) => {
    let response = {};
    let userId = req.request.header.userid;
    let {sceneId} = req.request.body;
    let sceneEntity = {
        _id: sceneId,
        user: userId
    };
    let deviceEntity = {
        user: userId
    };
    let scene = [];                 //store the scene found
    let sceneDevices = [];          //store devices ids in a scene

    return new Promise((resolve, reject) => {
        asyncModule.waterfall([
            callback => {
                sceneModel.findOne(sceneEntity)
                    .exec((err, result) => {
                        if (err) {
                            response = {
                                errorCode: 900,
                                message: '异常错误：查询情景模式失败 ' + err,
                            };
                            reject(response);
                        }
                        else if (result) {
                            scene = result;
                            for (let item of scene.commands) {
                                sceneDevices.push(item.device);
                            }
                            callback();
                        }
                        else {
                            response = {
                                errorCode: 900,
                                message: '未查询到该情景模式'
                            };
                            resolve(response);
                        }
                    });
            },
            callback => {
                deviceModel.find({_id: {$in: sceneDevices}, user: userId})
                    .sort({type: -1})
                    .exec((err, result) => {
                        if (err) {
                            response = {
                                errorCode: 900,
                                message: '异常错误：查询情景模式中的设备失败 ' + err,
                            };
                            reject(response);
                        }
                        else {
                            response = {
                                errorCode: 0,
                                message: '查询情景模式详细信息成功',
                                scene: scene,
                                devices: result
                            };
                            callback();
                        }
                    });
            }], () => {
            resolve(response);
        });
    });
};

exports.update = async (ctx) => {
    let response = {};
    let {sceneId, name, commands} = ctx.request.body;
    let userId = ctx.request.header.userid;
    let sceneEntity = {
        user: userId,
        sceneId
    };

    return new Promise((resolve, reject) => {
        asyncModule.waterfall([
            callback => {
                sceneModel.findOne(sceneEntity)
                    .exec((err, result) => {
                        if (err) {
                            response = {
                                errorCode: 900,
                                message: '异常错误：查询情景模式失败 ' + err,
                            };
                            reject(response);
                        }
                        else if (result) {
                            callback();
                        }
                        else {
                            response = {
                                errorCode: 900,
                                message: '未找到待更新的情景模式',
                            };
                            resolve(response);
                        }
                    })
            },
            callback => {
                sceneEntity['name'] = name;
                sceneEntity['commands'] = commands;
                sceneModel.updateOne({_id: sceneId}, {$set: sceneEntity}, (err, result) => {
                    if (err) {
                        response = {
                            errorCode: 900,
                            message: '异常错误：查询情景模式失败 ' + err,
                            scenes: result
                        };
                        reject(response);
                    }
                    else {
                        callback();
                    }

                });
            }
        ], () => {
            response = {
                errorCode: 0,
                message: '更新情景模式成功'
            }
        });
    });
};

exports.delete = async (ctx) => {
    let response = {};
    let {sceneId} = ctx.request.body;
    let userId = ctx.request.header.userid;
    let sceneEntity = {
        _id: sceneId,
        user: userId
    };
    return new Promise((resolve, reject) => {
        asyncModule.waterfall([
            callback => {
                sceneModel.findOne(sceneEntity)
                    .exec((err, result) => {
                        if (err) {
                            response = {
                                errorCode: 900,
                                message: '异常错误：查找待删除情景模式失败 ' + err,
                            };
                            reject(response);
                        }
                        else if (result) {
                            callback();
                        }
                        else {
                            response = {
                                errorCode: 900,
                                message: '找不到待删除的情景模式'
                            }
                        }
                    });
            },
            callback => {
                sceneModel.remove({_id: sceneId}, (err) => {
                    if (err) {
                        response = {
                            errorCode: 900,
                            message: '异常错误：删除情景模式失败 ' + err,
                        };
                        reject(response);
                    }
                    else {
                        response = {
                            errorCode: 0,
                            message: '删除情景模式成功'
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

//使用控制按钮进行情景模式控制
exports.run = async (ctx) => {
    let response = {};
    let {sceneId} = ctx.request.body;
    let userId = ctx.request.header.userid;
    let sceneEntity = {
        _id: sceneId,
        user: userId
    };
    return new Promise((resolve, reject) => {
    });
};
