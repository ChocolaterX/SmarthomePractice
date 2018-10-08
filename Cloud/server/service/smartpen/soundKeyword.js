/**
 * <copyright file="soundKeyword.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>2/26/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var SoundKeyword = mongoose.model('SoundKeyword');

var validator = require('validator');
var fs = require('fs');
var request = require('request');
var async = require('async');

//为家庭添加语音关键词
exports.createSoundKeyword = function (req, res) {
    var user = req.user.current;
    var keyword;
    var command;
    var sceneId;
    var deviceId;
    var infraredCommandId;
    var type;

    if (!user) {
        return res.json({
            errorCode: 2000,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.keyword) {
        return res.json({
            errorCode: 2000,
            message: '未输入关键词内容'
        });
    }
    else {
        keyword = validator.trim(req.body.keyword);
    }
    if (!req.body.type) {
        return res.json({
            errorCode: 2000,
            message: '未选择语音关键词绑定类型'
        });
    }
    else {
        type = req.body.type;
        if (type == 1) {
            if (req.body.deviceId) {
                deviceId = validator.trim(req.body.deviceId);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未选择语音关键词绑定的设备'
                });
            }
            if (req.body.command) {
                command = validator.trim(req.body.command);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未指定语音关键词绑定的设备操作'
                });
            }
        }
        else if (type == 2) {
            if (req.body.sceneId) {
                sceneId = validator.trim(req.body.sceneId);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未选择语音关键词绑定的情景模式'
                });
            }
        }
        else if (type == 3) {
            if (req.body.infraredCommandId) {
                infraredCommandId = validator.trim(req.body.infraredCommandId);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未选择语音关键词绑定的红外指令'
                });
            }
        }
        else {
            return res.json({
                errorCode: 2000,
                message: '绑定类型出错'
            });
        }
    }

    var soundKeywordTemp = {};
    soundKeywordTemp['user'] = user._id;
    soundKeywordTemp['keyword'] = keyword;

    async.waterfall([
        //查询当前用户是否已经使用了这个语音关键词
        function (callback) {
            SoundKeyword.findOne(soundKeywordTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询语音关键词失败'
                        });
                    }
                    else if (!result) {
                        callback();
                    }
                    else {
                        return res.json({
                            errorCode: 2000,
                            message: '待添加的语音关键词已存在'
                        });
                    }
                });
        },
        //添加语音关键词
        function (callback) {
            soundKeywordTemp['type'] = type;
            soundKeywordTemp['device'] = deviceId;
            soundKeywordTemp['command'] = command;
            soundKeywordTemp['scene'] = sceneId;
            soundKeywordTemp['infraredCommand'] = infraredCommandId;

            var soundKeywordSave = new SoundKeyword(soundKeywordTemp);
            soundKeywordSave.save(function (err) {
                if (err) {
                    return res.json({
                        errorCode: 2000,
                        message: '异常错误：保存语音关键词失败'
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
            message: '添加语音关键词成功'
        })
    });
};

//更新用户语音关键词的信息
exports.updateSoundKeyword = function (req, res) {
    var user = req.user.current;
    var soundKeywordId;
    var keyword;
    var type;
    var command;
    var sceneId;
    var deviceId;
    var infraredCommandId;

    if (!user) {
        return res.json({
            errorCode: 2000,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.soundKeywordId) {
        return res.json({
            errorCode: 2000,
            message: '未选择待更新的语音关键词'
        });
    }
    else {
        soundKeywordId = validator.trim(req.body.soundKeywordId);
    }
    if (!req.body.keyword) {
        return res.json({
            errorCode: 2000,
            message: '未输入关键词内容'
        });
    }
    else {
        keyword = validator.trim(req.body.keyword);
    }
    if (!req.body.type) {
        return res.json({
            errorCode: 2000,
            message: '未选择语音关键词绑定类型'
        });
    }
    else {
        type = req.body.type;
        if (type == 1) {
            if (req.body.deviceId) {
                deviceId = validator.trim(req.body.deviceId);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未选择语音关键词绑定的设备'
                });
            }
            if (req.body.command) {
                command = validator.trim(req.body.command);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未指定语音关键词绑定的设备操作'
                });
            }
        }
        else if (type == 2) {
            if (req.body.sceneId) {
                sceneId = validator.trim(req.body.sceneId);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未选择语音关键词绑定的情景模式'
                });
            }
        }
        else if (type == 3) {
            if (req.body.infraredCommandId) {
                infraredCommandId = validator.trim(req.body.infraredCommandId);
            }
            else {
                return res.json({
                    errorCode: 2000,
                    message: '未选择语音关键词绑定的红外指令'
                });
            }
        }
        else {
            return res.json({
                errorCode: 2000,
                message: '绑定类型出错'
            });
        }
    }

    var soundKeywordTemp = {};
    soundKeywordTemp['_id'] = soundKeywordId;
    soundKeywordTemp['user'] = user._id;
    var soundKeywordExists = true;          //判断要更改的关键词内容，是不是当前ID对应的关键词，如果是，则不代表关键词被占用

    async.waterfall([
        //查询语音关键词是否存在
        function (callback) {
            SoundKeyword.findOne(soundKeywordTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询语音关键词失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2000,
                            message: '找不到待更新的语音关键词'
                        });
                    }
                    else {
                        if (result.keyword == keyword) {
                            soundKeywordExists = false;
                        }
                        callback();
                    }
                });
        },
        //查询要更新的关键词是否被占用
        function (callback) {
            //soundKeywordTemp.drop(_id);
            delete soundKeywordTemp._id;
            soundKeywordTemp['keyword'] = keyword;
            SoundKeyword.findOne(soundKeywordTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询语音关键词失败'
                        });
                    }
                    else if (result) {
                        if (!soundKeywordExists) {
                            callback();
                        }
                        else {
                            return res.json({
                                errorCode: 2000,
                                message: '语音关键词已被占用'
                            });
                        }
                    }
                    else {
                        callback();
                    }
                });
        },
        //更新语音关键词
        function (callback) {
            soundKeywordTemp['type'] = type;
            soundKeywordTemp['device'] = deviceId;
            soundKeywordTemp['command'] = command;
            soundKeywordTemp['scene'] = sceneId;
            soundKeywordTemp['infraredCommand'] = infraredCommandId;
            SoundKeyword.update({_id: soundKeywordId}, {$set: soundKeywordTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 2000,
                        message: '异常错误：更新语音关键词失败'
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
            message: '更新语音关键词成功'
        })
    });
};

//取得家庭语音关键词列表
exports.getSoundKeywordList = function (req, res) {
    var user = req.user.current;

    if (!user) {
        return res.json({
            errorCode: 2000,
            message: '异常错误：无法取得当前用户信息'
        });
    }

    var soundKeywordTemp = {};
    soundKeywordTemp['user'] = user._id;
    var soundKeywords;

    async.waterfall([
        function (callback) {
            SoundKeyword.find(soundKeywordTemp)
                .sort({createdTime: -1})
                .populate('device')
                .populate('scene')
                .populate('infraredCommand')
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询用户语音关键词失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2000,
                            message: '当前家庭无语音关键词'
                        });
                    }
                    else {
                        soundKeywords = result;
                        callback();
                    }
                });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            soundKeywords: soundKeywords
        });
    });
};

//取得语音关键词详情
exports.getSoundKeywordDetail = function (req, res) {
    var soundKeywordId;
    var user = req.user.current;

    if (!user) {
        return res.json({
            errorCode: 2000,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.soundKeywordId) {
        return res.json({
            errorCode: 2000,
            message: '未选择待查看的语音关键词'
        });
    }
    else {
        soundKeywordId = req.body.soundKeywordId;
    }

    var soundKeywordTemp = {};
    soundKeywordTemp['_id'] = soundKeywordId;
    soundKeywordTemp['user'] = user._id;
    var soundKeyword = {};

    async.waterfall([
        function (callback) {
            SoundKeyword.findOne(soundKeywordTemp)
                .populate('device')
                .populate('scene')
                .populate('infraredCommand')
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询语音关键词异常'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2000,
                            message: '找不到待查看的语音关键词'
                        });
                    }
                    else {
                        soundKeyword = result;
                        callback();
                    }
                });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            soundKeyword: soundKeyword
        });
    });
};

//删除家庭中的语音关键词
exports.deleteSoundKeyword = function (req, res) {
    var user = req.user.current;
    var soundKeywordId;

    if (!user) {
        return res.json({
            errorCode: 2000,
            message: '异常错误：无法取得当前用户信息'
        });
    }
    if (!req.body.soundKeywordId) {
        return res.json({
            errorCode: 2000,
            message: '未选择待删除的语音关键词'
        });
    }
    else {
        soundKeywordId = req.body.soundKeywordId;
    }

    var soundKeywordTemp = {};
    soundKeywordTemp['_id'] = soundKeywordId;
    soundKeywordTemp['user'] = user._id;

    async.waterfall([
        //查询语音关键词是否存在
        function (callback) {
            SoundKeyword.findOne(soundKeywordTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 2000,
                            message: '异常错误：查询语音关键词异常'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 2000,
                            message: '找不到待删除的语音关键词'
                        });
                    }
                    else {
                        callback();
                    }
                });
        },
        //删除语音关键词表中的语音关键词名称（置为空）
        function (callback) {
            SoundKeyword.remove({_id: soundKeywordId}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1600,
                        message: '异常错误：删除语音关键词失败'
                    })
                }
                else {
                    callback();
                }
            });
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '删除语音关键词成功'
        });
    });
};

