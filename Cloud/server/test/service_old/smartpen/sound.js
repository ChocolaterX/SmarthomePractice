/**
 * Created by Jiang Suyang on 2016-11-18.
 *
 * 语音操作关键字部分，由浦剑锋编写。
 * 语音设备关键字和语音情景模式关键字部分，由蒋苏阳编写。
 *
 */

var mongoose = require('../../cloud_db_connect');

//model文件
var SoundCommand = mongoose.model('SoundCommand');
var SoundDevice = mongoose.model('SoundDevice');
var SoundScene = mongoose.model('SoundScene');
var HomeDevice = mongoose.model('HomeDevice');

var log4j = require('log4js').getLogger();
var log = mongoose.model('Log');

var agenda = require('../../../lib/schedule');
//var Command = require('../device/command');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var config = require('../../../config/config');
var request = require('request');

var async = require('async');


/**
 * 语音 操作关键字
 * 增删改查
 */

/**
 * 获取语音操作关键字列表
 */
exports.getCommandKeywordList = function (req, res) {

    var homeId = req.user.current.home._id;
    if (!homeId) {
        return res.json({
            errorCode: 2001,
            message: '家庭为空'
        });
    }

    var findDefaultCriteria = {   //查询默认的操作关键字列表
        removed: false,
        home: null
    };
    var findHomeCriteria = {     //查询家庭的操作关键字列表
        removed: false,
        home: homeId
    };

    SoundCommand.find(findDefaultCriteria, function (err, defaultCommandKeywords) {
        if (err) {
            log4j.error(err);
            return res.json({
                errorCode: 500,
                message: err.message
            });
        } else {
            SoundCommand.find(findHomeCriteria, function (err, homeCommandKeywords) {

                if (err) {
                    log4j.error(err);
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                } else {
                    return res.json({
                        errorCode: 0,
                        defaultCommandKeywords: defaultCommandKeywords,
                        homeCommandKeywords: homeCommandKeywords
                    });
                }
            })
        }
    });

};

/**
 * 创建语音操作关键字
 */
exports.createCommandKeyword = function (req, res) {

    var soundName = req.body.soundName;	//关键字名称
    var category = req.body.category;	//操作对应的设备类型：2为智能窗帘，3为智能灯泡，7为智能墙面开关；
    var command = req.body.command;     //详细操作命令

    /**
     * 当此字段值为1时，代表此语音操作关键字为默认操作关键字，所有用户均可使用此操作关键字；当此字段的值为2时，代表此语音操作关键字为用户自定义添加的关键字
     */
    var belong = req.body.belong;

    //当管理员调用此方法时，超级管理员无home,故将homeId置为空；当普通用户调用此方法时，将homeId置为当前登录用户的homeId
    var homeId = null;
    if (belong == 2) {
        homeId = req.user.current.home._id;
    }

    if (!homeId && (belong == 2)) {
        return res.json({
            errorCode: 2001,
            message: '家庭为空'
        });
    }
    if (!soundName) {
        return res.json({
            errorCode: 2002,
            message: '关键字为空'
        })
    }
    if (!category) {
        return res.json({
            errorCode: 2003,
            message: '设备类型为空'
        });
    }
    if (category != 2 && category != 3 && category != 7) {
        return res.json({
            errorCode: 2004,
            message: '设备类型不正确'
        });
    }
    if (!command) {
        return res.json({
            errorCode: 2005,
            message: '设备控制命令为空'
        })
    }
    if ((!belong) || (!(belong == 1 || belong == 2))) {
        return res.json({
            errorCode: 2006,
            message: '设备控制关键字类型出错'
        });
    }

    var criteria = {
        soundName: soundName,
        category: category,
        command: command,
        belong: belong,
        createdTime: Date.now(),
        updatedTime: Date.now(),
        removed: false
    };


    if (belong == 1) {//管理员操作


        //数据库操作
        async.waterfall([

            //查看数据库--默认设备控制关键字--中是否已有该关键字
            function (callback) {
                SoundCommand.findOne({soundName: soundName, home: null, removed: false}, function (err2, result) {
                    if (err2) {
                        return res.json({
                            errorCode: 500,
                            message: '查询失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2007,
                            message: '已存在--默认设备控制关键字'
                        });
                    }
                    else {
                        callback();
                    }
                });
            },

            //创建该设备操作关键字
            function (callback) {
                var soundCommand = new SoundCommand(criteria);
                soundCommand.save(function (err) {
                    if (err) {
                        log4j.error('it fails to save the soundCommand');
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else {
                        callback();
                    }
                });
            }
        ], function () {
            return res.json({
                errorCode: 0,
                message: "默认设备控制关键字创建成功"
            });
        });

    }

    if (belong == 2) {//用户操作
        //数据库操作
        async.waterfall([
            //查看数据库--设备关键字--中是否已有该关键字
            function (callback) {
                SoundDevice.findOne({soundName: soundName, home: homeId, removed: false}, function (err1, result) {
                    if (err1) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2009,
                            message: '已存在--设备关键字'
                        });
                    }
                    else {
                        callback();
                    }
                });
            },
            //查看数据库--默认设备控制关键字--中是否已有该关键字
            function (callback) {
                SoundCommand.findOne({soundName: soundName, home: null, removed: false}, function (err2, result) {
                    if (err2) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2007,
                            message: '已存在--默认设备控制关键字'
                        });
                    }
                    else {
                        callback();
                    }
                });
            },
            //查看数据库--自定义设备控制关键字--中是否已有该关键字
            function (callback) {
                SoundCommand.findOne({soundName: soundName, home: homeId, removed: false}, function (err3, result) {
                    if (err3) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2008,
                            message: '已存在--自定义设备控制关键字'
                        });
                    }
                    else {
                        callback();
                    }
                });
            },
            //查看数据库--情景模式关键字--中是否已有该关键字
            function (callback) {
                SoundScene.findOne({soundName: soundName, home: homeId, removed: false}, function (err4, result) {
                    if (err4) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2010,
                            message: '已存在--情景模式关键字'
                        });
                    }
                    else {
                        callback();
                    }
                });
            },
            //创建该设备操作关键字
            function (callback) {
                var soundCommand = new SoundCommand(criteria);
                soundCommand.save(function (err) {
                    if (err) {
                        log4j.error('it fails to save the soundCommand');
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else {
                        callback();
                    }
                });
            }
        ], function () {
            return res.json({
                errorCode: 0,
                message: "设备控制关键字创建成功"
            });
        });

    }


};

/**
 * 更新语音操作关键字
 */
exports.updateCommandKeyword = function (req, res) {

    var soundCommandId = req.body.soundCommandId;  //操作关键字ID
    var soundName = req.body.soundName;	//关键字名称
    var category = req.body.category;	//操作对应的设备类型：2为智能窗帘，3为智能灯泡，7为智能墙面开关；
    var command = req.body.command;     //详细操作命令

    /**
     * 当此字段值为1时，代表此语音操作关键字为默认操作关键字，所有用户均可使用此操作关键字；当此字段的值为2时，代表此语音操作关键字为用户自定义添加的关键字
     */
    var belong = req.body.belong;

    //当管理员调用此方法时，超级管理员无home,故将homeId置为空；当普通用户调用此方法时，将homeId置为当前登录用户的homeId
    var homeId = null;
    if ((!belong) || (belong == 2)) {
        homeId = req.user.current.home._id;
    }


    if (!soundCommandId) {
        return res.json({
            errorCode: 2011,
            message: '设备控制关键字ID为空'
        });
    }
    if (!soundName) {
        return res.json({
            errorCode: 2002,
            message: '关键字为空'
        })
    }
    if (!category) {
        return res.json({
            errorCode: 2003,
            message: '设备类型为空'
        });
    }
    if (category != 2 && category != 3 && category != 7) {
        return res.json({
            errorCode: 2004,
            message: '设备类型不正确'
        });
    }
    if (!command) {
        return res.json({
            errorCode: 2005,
            message: '设备操作命令为空。'
        })
    }
    //if (belong) {
    //    return res.json({
    //        errorCode: 2006,
    //        message: '操作类型为空'
    //    });
    //}
    if (!belong) {
        belong = 2;
    }

    var criteria = {
        soundName: soundName,
        category: category,
        command: command,
        belong: belong,
        home: homeId,
        updatedTime: Date.now(),
    };


    if (belong == 1) {//管理员操作


        //数据库操作
        async.waterfall([

            //查看数据库--默认设备控制关键字--中是否已有该关键字
            function (callback) {
                SoundCommand.findOne({
                    soundName: soundName,
                    home: null,
                    removed: false,
                    _id: {$ne: soundCommandId}
                }, function (err2, result) {
                    if (err2) {
                        return res.json({
                            errorCode: 500,
                            message: '查询失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2007,
                            message: '已存在--默认设备控制关键字'
                        });
                    }
                    else {
                        callback();
                    }
                });
            },

            //更新该设备操作关键字
            function (callback) {
                SoundCommand.findOneAndUpdate({_id: soundCommandId}, criteria, null, function (err, results) {

                    if (err) {
                        log4j.error('it fails to update the soundCommand');
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else {
                        callback();
                    }
                });
            }
        ], function () {
            return res.json({
                errorCode: 0,
                message: "默认设备控制关键字更新成功"
            });
        });

    }

    if (belong == 2) {//用户操作

        //数据库操作
        async.waterfall([
            //查看数据库--设备关键字--中是否已有该关键字
            function (callback) {
                SoundDevice.findOne({soundName: soundName, home: homeId, removed: false}, function (err1, result) {
                    if (err1) {
                        return res.json({
                            errorCode: 500,
                            message: '查询失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2009,
                            message: '已存在--设备关键字'
                        });
                    }
                    else {
                        callback();
                    }
                });
            },

            //查看数据库--默认设备控制关键字--中是否已有该关键字
            function (callback) {
                SoundCommand.findOne({
                    soundName: soundName,
                    home: null,
                    removed: false,
                    _id: {$ne: soundCommandId}
                }, function (err2, result) {
                    if (err2) {
                        return res.json({
                            errorCode: 500,
                            message: '查询失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2007,
                            message: '已存在--默认设备控制关键字'
                        });
                    }
                    else {
                        callback();
                    }
                });
            },
            //查看数据库--自定义设备控制关键字--中是否已有该关键字
            function (callback) {
                SoundCommand.findOne({soundName: soundName, home: homeId, removed: false}, function (err3, result) {
                    if (err3) {
                        return res.json({
                            errorCode: 500,
                            message: '查询失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2008,
                            message: '已存在--自定义设备控制关键字'
                        });
                    }
                    else {
                        callback();
                    }
                });
            },
            //查看数据库--情景模式关键字--中是否已有该关键字
            function (callback) {
                SoundScene.findOne({soundName: soundName, home: homeId, removed: false}, function (err4, result) {
                    if (err4) {
                        return res.json({
                            errorCode: 500,
                            message: '查询失败'
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 2010,
                            message: '已存在--情景模式关键字'
                        });
                    }
                    else {
                        callback();
                    }
                });
            },
            //更新该设备控制关键字
            function (callback) {
                SoundCommand.findOneAndUpdate({_id: soundCommandId}, criteria, null, function (err, results) {
                    if (err) {
                        log4j.error('it fails to update the soundCommand');
                        log4j.error(err);
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else {
                        callback();
                    }
                });
            }
        ], function () {
            return res.json({
                errorCode: 0,
                message: "自定义设备控制关键字更新成功"
            });
        });
    }
    ;

}

/**
 * 删除语音操作关键字
 */
exports.deleteCommandKeyword = function (req, res) {
    var soundCommandId = req.body.soundCommandId;
    if (!soundCommandId) {
        return res.json({
            errorCode: 2011,
            message: '设备控制关键字ID为空'
        });
    }

    SoundCommand.findOneAndUpdate({_id: soundCommandId}, {$set: {removed: true}}, null, function (err, results) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        } else {
            return res.json({
                errorCode: 0,
                message: '操作关键字删除成功'
            });
        }
    })
};


/**
 * 语音 设备关键字
 */
/**
 * 获取语音设备关键字列表
 */
exports.getDeviceKeywordList = function (req, res) {

    var homeId = req.user.current.home._id;
    if (!homeId) {
        return res.json({
            errorCode: 2001,
            message: '家庭为空'
        });
    }

    //语音设备关键字的搜索条件
    var findDeviceKeywordCondition = {
        removed: false,
        home: homeId
    };

    SoundDevice.find(findDeviceKeywordCondition)
        .populate('device')
        .exec(function (err, results) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            } else {

                HomeDevice.findOne({home: homeId}, function (err, homeDevices) {
                    if (err) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    } else {
                        var remarks = [];       //设备名称
                        var temp = {};


                        var z = 0;



                        //console.log(deviceIds);
                        //console.log(deviceIds.length);
                        //console.log(result.devices);


                        //遍历绑定的设备ID，从家庭设备列表中取得有动作绑定的设备的名称
                        for (var i = 0; i < results.length; i++) {
                            temp = {};
                            for (var j = 0; j < homeDevices.devices.length; j++) {


                                //此处注意转化为string类型作比较（原本是object类型）
                                if (validator.trim(results[i].device._id) == validator.trim(homeDevices.devices[j].deviceId)) {

                                    temp['id'] = validator.trim(results[i].device._id);
                                    temp['remark'] = validator.trim(homeDevices.devices[j].remark);
                                    remarks.push(temp);


                                    break;
                                }
                            }
                        }

                        var soundDevice = {};
                        //将设备的名称写到soundDevice中

                        for (i = 0; i < remarks.length; i++) {
                            for (j = 0; j < results.length; j++) {
                                if (results[j].device) {
                                    if (validator.trim(remarks[i].id) == validator.trim(results[j].device._id)) {

                                        soundDevice = results[j];


                                        soundDevice.device.state.remark = remarks[i].remark;

                                        results[j] = soundDevice;
                                        break;
                                    }
                                }

                            }
                        }


                        return res.json({
                            errorCode: 0,
                            message: "取得设备关键字表成功",
                            deviceKeywords: results

                        })

                    }
                });




            }
        })

};





/**
 * 创建语音设备关键字
 */
exports.createDeviceKeyword = function (req, res) {

    var homeId = req.user.current.home._id;
    var soundName = req.body.soundName;
    var category = req.body.category;
    var deviceId = req.body.deviceId;

    if (!homeId) {
        return res.json({
            errorCode: 2001,
            message: '家庭为空'
        });
    }
    if (!soundName) {
        return res.json({
            errorCode: 2002,
            message: '关键字为空'
        })
    }
    if (!category) {
        return res.json({
            errorCode: 2003,
            message: '设备类型为空'
        });
    }
    if (!deviceId) {
        return res.json({
            errorCode: 2012,
            message: '设备ID为空'
        });
    }

    var createDeviceKeywordCondition = {
        soundName: soundName,
        category: category,
        home: homeId,
        device: deviceId,
        createdTime: Date.now(),
        updatedTime: Date.now(),
        removed: false
    };

    //数据库操作
    async.waterfall([
        //查看数据库--设备关键字--中是否已有该关键字
        function (callback) {
            SoundDevice.findOne({soundName: soundName, home: homeId, removed: false}, function (err1, result) {
                if (err1) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2009,
                        message: '已存在--设备关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //查看数据库--默认设备控制关键字--中是否已有该关键字
        function (callback) {
            SoundCommand.findOne({soundName: soundName, home: null, removed: false}, function (err2, result) {
                if (err2) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2007,
                        message: '已存在--默认设备控制关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //查看数据库--自定义设备控制关键字--中是否已有该关键字
        function (callback) {
            SoundCommand.findOne({soundName: soundName, home: homeId, removed: false}, function (err3, result) {
                if (err3) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2008,
                        message: '已存在--自定义设备控制关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //查看数据库--情景模式关键字--中是否已有该关键字
        function (callback) {
            SoundScene.findOne({soundName: soundName, home: homeId, removed: false}, function (err4, result) {
                if (err4) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2010,
                        message: '已存在--情景模式关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //创建该设备关键字
        function (callback) {
            var soundDevice = new SoundDevice(createDeviceKeywordCondition);
            soundDevice.save(function (err) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else {
                    callback();
                }
            });
        }
    ], function () {
        return res.json({
            errorCode: 0,
            message: "设备关键字创建成功"
        });
    });


};

/**
 * 更新语音设备关键字
 */
exports.updateDeviceKeyword = function (req, res) {

    var homeId = req.user.current.home._id;
    var soundDeviceId = req.body.soundDeviceId;
    var soundName = req.body.soundName;
    var category = req.body.category;
    var deviceId = req.body.deviceId;

    if (!homeId) {
        return res.json({
            errorCode: 2001,
            message: '家庭为空'
        });
    }
    if (!soundDeviceId) {
        return res.json({
            errorCode: 2013,
            message: '语音设备关键字ID为空'
        });
    }
    if (!soundName) {
        return res.json({
            errorCode: 2002,
            message: '关键字为空'
        })
    }
    if (!category) {
        return res.json({
            errorCode: 2003,
            message: '设备类型为空'
        });
    }
    if (!deviceId) {
        return res.json({
            errorCode: 2012,
            message: '设备ID为空'
        });
    }

    var updateDeviceKeywordCondition = {
        soundName: soundName,
        category: category,
        home: homeId,
        device: deviceId,
        updatedTime: Date.now(),
        removed: false
    };

    //数据库操作
    async.waterfall([
        //查看数据库--设备关键字--中是否已有该关键字
        function (callback) {                                             //查询时排除本身
            SoundDevice.findOne({
                soundName: soundName,
                home: homeId,
                removed: false,
                _id: {$ne: soundDeviceId}
            }, function (err1, result) {
                if (err1) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2009,
                        message: '已存在--设备关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },

        //查看数据库--默认设备控制关键字--中是否已有该关键字
        function (callback) {
            SoundCommand.findOne({soundName: soundName, home: null, removed: false}, function (err2, result) {
                if (err2) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2007,
                        message: '已存在--默认设备控制关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //查看数据库--自定义设备控制关键字--中是否已有该关键字
        function (callback) {
            SoundCommand.findOne({soundName: soundName, home: homeId, removed: false}, function (err3, result) {
                if (err3) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2008,
                        message: '已存在--自定义设备控制关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //查看数据库--情景模式关键字--中是否已有该关键字
        function (callback) {
            SoundScene.findOne({soundName: soundName, home: homeId, removed: false}, function (err4, result) {
                if (err4) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2010,
                        message: '已存在--情景模式关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //更新该设备关键字
        function (callback) {
            SoundDevice.findOneAndUpdate({_id: soundDeviceId}, updateDeviceKeywordCondition, null, function (err, result) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: '更新失败'
                    });
                }
                else {
                    callback();
                }
            });
        }
    ], function () {
        return res.json({
            errorCode: 0,
            message: "设备关键字更新成功"
        });
    });
};

/**
 * 删除语音设备关键字
 */
exports.deleteDeviceKeyword = function (req, res) {

    var soundDeviceId = req.body.soundDeviceId;

    if (!soundDeviceId) {
        return res.json({
            errorCode: 2013,
            message: '语音设备关键字ID为空'
        });
    }

    //数据库操作
    SoundDevice.findOneAndUpdate({_id: soundDeviceId}, {$set: {removed: true}}, null, function (err, results) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        } else {
            return res.json({
                errorCode: 0,
                message: '设备关键字删除成功'
            });
        }
    })

};


/**
 * 语音 情景模式关键字
 */
/**
 * 获取语音情景模式关键字列表
 */
exports.getSceneKeywordList = function (req, res) {

    var homeId = req.user.current.home._id;
    if (!homeId) {
        return res.json({
            errorCode: 2001,
            message: '家庭为空'
        });
    }

    //语音情景模式关键字的搜索条件
    var findSceneKeywordCondition = {
        removed: false,
        home: homeId
    };

    SoundScene.find(findSceneKeywordCondition)
        .populate('scene')
        .exec(function (err, results) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            } else {
                return res.json({
                    errorCode: 0,
                    sceneKeywords: results
                });
            }
        })


};
/**
 * 创建语音情景模式关键字
 */
exports.createSceneKeyword = function (req, res) {

    var homeId = req.user.current.home._id;
    var soundName = req.body.soundName;
    var sceneId = req.body.sceneId;


    if (!homeId) {
        return res.json({
            errorCode: 2001,
            message: '家庭为空'
        });
    }
    if (!soundName) {
        return res.json({
            errorCode: 2002,
            message: '关键字为空'
        })
    }
    if (!sceneId) {
        return res.json({
            errorCode: 2014,
            message: '未选择情景模式'
        });
    }


    var createSceneKeywordCondition = {
        soundName: soundName,
        home: homeId,
        scene: sceneId,
        createdTime: Date.now(),
        updatedTime: Date.now(),
        removed: false
    };

    //数据库操作
    async.waterfall([
        //查看数据库--设备关键字--中是否已有该关键字
        function (callback) {
            SoundDevice.findOne({soundName: soundName, home: homeId, removed: false}, function (err1, result) {
                if (err1) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2009,
                        message: '已存在--设备关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //查看数据库--默认设备控制关键字--中是否已有该关键字
        function (callback) {
            SoundCommand.findOne({soundName: soundName, home: null, removed: false}, function (err2, result) {
                if (err2) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2007,
                        message: '已存在--默认设备控制关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //查看数据库--自定义设备控制关键字--中是否已有该关键字
        function (callback) {
            SoundCommand.findOne({soundName: soundName, home: homeId, removed: false}, function (err3, result) {
                if (err3) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2008,
                        message: '已存在--自定义设备控制关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //查看数据库--情景模式关键字--中是否已有该关键字
        function (callback) {
            SoundScene.findOne({soundName: soundName, home: homeId, removed: false}, function (err4, result) {
                if (err4) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2010,
                        message: '已存在--情景模式关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },


        //创建该情景模式关键字
        function (callback) {
            var soundScene = new SoundScene(createSceneKeywordCondition);
            soundScene.save(function (err2) {
                if (err2) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else {
                    callback();
                }
            });
        }
    ], function () {
        return res.json({
            errorCode: 0,
            message: "情景模式关键字创建成功"
        });
    });

};
/**
 * 更新语音情景模式关键字
 */
exports.updateSceneKeyword = function (req, res) {

    var homeId = req.user.current.home._id;
    var soundSceneId = req.body.soundSceneId;
    var soundName = req.body.soundName;
    var sceneId = req.body.sceneId;

    if (!soundSceneId) {
        return res.json({
            errorCode: 2015,
            message: '情景模式关键字ID为空'
        });
    }
    if (!homeId) {
        return res.json({
            errorCode: 2001,
            message: '家庭为空'
        });
    }
    if (!soundName) {
        return res.json({
            errorCode: 2002,
            message: '关键字为空'
        })
    }
    if (!sceneId) {
        return res.json({
            errorCode: 2014,
            message: '未选择情景模式'
        });
    }

    var updateSceneKeywordCondition = {
        soundName: soundName,
        home: homeId,
        scene: sceneId,
        updatedTime: Date.now(),
        removed: false
    };

    //数据库操作
    async.waterfall([


        //查看数据库--设备关键字--中是否已有该关键字
        function (callback) {
            SoundDevice.findOne({soundName: soundName, home: homeId, removed: false}, function (err1, result) {
                if (err1) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2009,
                        message: '已存在--设备关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //查看数据库--默认设备控制关键字--中是否已有该关键字
        function (callback) {
            SoundCommand.findOne({soundName: soundName, home: null, removed: false}, function (err2, result) {
                if (err2) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2007,
                        message: '已存在--默认设备控制关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },
        //查看数据库--自定义设备控制关键字--中是否已有该关键字
        function (callback) {
            SoundCommand.findOne({soundName: soundName, home: homeId, removed: false}, function (err3, result) {
                if (err3) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2008,
                        message: '已存在--自定义设备控制关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },

        //查看数据库--情景模式关键字--中是否已有该关键字
        function (callback) {
            SoundScene.findOne({
                soundName: soundName,
                home: homeId,
                removed: false,
                _id: {$ne: soundSceneId}
            }, function (err4, result) {
                if (err4) {
                    return res.json({
                        errorCode: 500,
                        message: '查询失败'
                    });
                }
                else if (result) {
                    return res.json({
                        errorCode: 2010,
                        message: '已存在--情景模式关键字'
                    });
                }
                else {
                    callback();
                }
            });
        },


        //更新该情景模式关键字
        function (callback) {
            SoundScene.findOneAndUpdate({_id: soundSceneId}, updateSceneKeywordCondition, null, function (err2, result) {
                if (err2) {
                    return res.json({
                        errorCode: 500,
                        message: '更新失败'
                    });
                }
                else {
                    callback();
                }
            });
        }
    ], function () {
        return res.json({
            errorCode: 0,
            message: "情景模式关键字更新成功"
        });
    });
};
/**
 * 删除语音情景模式关键字
 */
exports.deleteSceneKeyword = function (req, res) {

    var soundSceneId = req.body.soundSceneId;

    if (!soundSceneId) {
        return res.json({
            errorCode: 2015,
            message: '语音情景模式关键字ID为空'
        });
    }

    //数据库操作
    SoundScene.findOneAndUpdate({_id: soundSceneId}, {$set: {removed: true}}, null, function (err, results) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        } else {
            return res.json({
                errorCode: 0,
                message: '情景模式关键字删除成功'
            });
        }
    })

};

