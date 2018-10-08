/**
 * Created by pjf on 2017-4-6.
 */
var mongoose = require('../../cloud_db_connect');

var User = mongoose.model('User');
var Sensor = mongoose.model('Sensor');

var config = require('../../../config/config');
var log4j = require('log4js').getLogger();
var fs = require('fs');
var word = require('png-word');
var images = require("images");
var request = require('request');
var EasyZip = require('easy-zip').EasyZip;
var path = require('path');
var validator = require('validator');
var async = require('async');


//admin添加一个新设备到数据库
exports.createSensor = function (req, res) {
    var mac = validator.trim(req.body.mac);
    var interfaceType = req.body.interfaceType;   //设备接口类型,  例如：1 zigbee, 2 串口；
    var type = req.body.type;                    //传感器类型              1 温度，2湿度，3空气质量，4光照，5烟雾

    if (!mac) {
        return res.json({
            errorCode: 1700,
            message: '未输入设备MAC地址'
        });
    }
    if (!interfaceType) {
        return res.json({
            errorCode: 1700,
            message: '未选择设备设备接口类型'
        });
    }
    if (!((typeof interfaceType == 'number') && (interfaceType > 0) && (interfaceType < 10))) {
        return res.json({
            errorCode: 1700,
            message: '设备接口类型有误'
        });
    }

    if (!type) {
        return res.json({
            errorCode: 1700,
            message: '未选择设备类型'
        });
    }
    if (!((typeof type == 'number') && (type > 0) && (type < 10))) {
        return res.json({
            errorCode: 1700,
            message: '设备类型有误'
        });
    }


    var sensorTemp = {};
    sensorTemp['mac'] = mac;

    async.waterfall([
        //查询是否已存在（MAC地址必须唯一）
        function (callback) {
            Sensor.findOne(sensorTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 1700,
                            message: '设备MAC已存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },
        //添加
        function (callback) {
            sensorTemp['type'] = type;
            sensorTemp['interfaceType'] = interfaceType;
            sensorTemp['user'] = null;
            sensorTemp['name'] = null;
            var sensor = new Sensor(sensorTemp);
            sensor.save(function (err) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                else {
                    callback();
                }
            })
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '添加设备成功'
        })
    });
};

//admin更新设备信息
//暂时不需做
exports.updateSensor = function (req, res) {

};

//admin查看数据库中的设备列表
//附带模糊查询账号、MAC
exports.getSensorList = function (req, res) {
    var sensorTemp = {};
    var userTemp = {};

    var sensorFind = {};

    var loginName = new RegExp(req.body.loginName);  //可选参数，模糊查询--用户账号
    var mac = new RegExp(req.body.mac);              //可选参数，模糊查询--MAC地址
    var type = req.body.type;                        //可选参数，传感器类型  1 温度，2湿度，3空气质量，4光照，5烟雾


    var pageIndex = validator.toInt(req.body.pageIndex) >= 0 ? validator.toInt(req.body.pageIndex) : 0;
    var pageSize = validator.toInt(req.body.pageSize) >= 0 ? validator.toInt(req.body.pageSize) : 10;


    if (type) {
        sensorTemp['type'] = type;
        sensorFind['type'] = type;
    }

    if (mac) {
        sensorTemp['mac'] = mac;
        sensorFind['mac'] = mac;
    }

    if (loginName) {


        async.waterfall([

            function (callback) {
                userTemp['loginName'] = loginName;

                User.find(userTemp)
                    .exec(function (err, user) {
                        if (err) {
                            return res.json({
                                errorCode: 500,
                                message: err.message
                            })
                        }
                        else if (user) {
                            var array = [];
                            for (var i = 0; i < user.length; i++) {
                                array.push(user[i]._id);
                            }

                            callback(null, array);
                        } else {
                            return res.json({
                                errorCode: 1600,
                                message: '未找到符合条件的用户账号'
                            })
                        }
                    });
            },
            function (user_array, callback) {
                sensorFind['user'] = {'$in': user_array}

                Sensor.find(sensorFind)
                    .sort({createdTime: -1})
                    .skip(pageIndex * pageSize)
                    .limit(pageSize)
                    .populate('user')
                    .exec(function (err, result) {
                        if (err) {


                            return res.json({
                                errorCode: 1700,
                                message: '异常错误：查询设备列表失败'
                            })
                        }
                        else {
                            callback(null, result);
                        }
                    });
            }

        ], function (err, result) {


            return res.json({
                errorCode: 0,
                sensors: result

            })
        })


    }
    else {
        Sensor.find(sensorTemp)
            .sort({createdTime: -1})
            .skip(pageIndex * pageSize)
            .limit(pageSize)
            .populate('user')
            .exec(function (err, result) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    })
                }
                else {
                    return res.json({
                        errorCode: 0,
                        sensors: result
                    })
                }
            });
    }


};

//admin删除设备
exports.deleteSensor = function (req, res) {
    var sensorId = req.body.sensorId;

    if (!sensorId) {
        return res.json({
            errorCode: 1700,
            message: '未选择设备ID'
        });
    }

    var sensorTemp = {};
    sensorTemp['_id'] = sensorId;

    async.waterfall([
        //查询待删除区域是否存在
        function (callback) {
            Sensor.findOne(sensorTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        })
                    }
                    else if (result) {
                        callback();
                    } else {
                        return res.json({
                            errorCode: 1600,
                            message: '未找到待删除的设备'
                        })
                    }
                });
        },
        //删除
        function (callback) {
            Sensor.remove({_id: sensorId}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
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
            message: '删除设备成功'
        })
    })
};

//用户绑定传感器
exports.create = function (req, res) {
    var userId = req.user.current._id;
    var sensorId = req.body.sensorId;
    var name = req.body.name;
    if (!userId) {
        return res.json({
            errorCode: 1305,
            message: '无法取得当前登录用户，请重新登录'
        });
    }

    if (!sensorId) {
        return res.json({
            errorCode: 1700,
            message: '未选择设备ID'
        });
    }

    if (!name) {
        return res.json({
            errorCode: 1700,
            message: '设备名称为空'
        });
    }

    var sensorFind = {
        _id: sensorId,
        user: null
    };

    var sensorUpdate = {
        name: name,
        user: userId
    };


    async.waterfall([
        //查询是否有该传感器
        //查询设备是否已被注册
        function (callback) {
            Sensor.findOne(sensorFind)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '该设备不存在或已被注册'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },

        //添加
        function (callback) {

            Sensor.update(sensorFind, sensorUpdate, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                else {
                    callback();
                }
            })
        }


    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '添加设备成功'
        })
    })
};
//用户删除传感器
exports.delete = function (req, res) {
    var userId = req.user.current._id;
    var sensorId = req.body.sensorId;

    if (!userId) {
        return res.json({
            errorCode: 1305,
            message: '无法取得当前登录用户，请重新登录'
        });
    }

    if (!sensorId) {
        return res.json({
            errorCode: 1700,
            message: '未选择设备ID'
        });
    }

    var sensorFind = {
        _id: sensorId,
        user: userId
    };

    var sensorUpdate = {
        name: null,
        user: null
    };

    async.waterfall([

        //查询设备是否已被删除
        function (callback) {
            Sensor.findOne(sensorFind)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '该设备不存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },

        //删除，将user,name重置为null
        function (callback) {

            Sensor.update(sensorFind, sensorUpdate, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                else {
                    callback();
                }
            })
        }


    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '删除设备成功'
        })
    })
};
//用户更新传感器
exports.update = function (req, res) {
    var userId = req.user.current._id;
    var sensorId = req.body.sensorId;
    var name = req.body.name;
    if (!userId) {
        return res.json({
            errorCode: 1305,
            message: '无法取得当前登录用户，请重新登录'
        });
    }

    if (!sensorId) {
        return res.json({
            errorCode: 1700,
            message: '未选择设备ID'
        });
    }


    var sensorFind = {
        _id: sensorId,
        user: userId
    };

    var sensorUpdate = {};

    if (name) {
        sensorUpdate['name'] = name
    }


    async.waterfall([
        //查询是否有该传感器

        function (callback) {
            Sensor.findOne(sensorFind)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '该设备不存在'
                        });
                    }
                    else {
                        callback();
                    }
                })
        },

        //更新
        function (callback) {

            Sensor.update(sensorFind, sensorUpdate, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                else {
                    callback();
                }
            })
        }


    ], function (callback) {
        return res.json({
            errorCode: 0,
            message: '更新设备成功'
        })
    })
};
//用户查看传感器列表(可单查)
exports.getList = function (req, res) {
    var userId = req.user.current._id;
    var sensorId = req.body.sensorId;

    if (!userId) {
        return res.json({
            errorCode: 1305,
            message: '无法取得当前登录用户，请重新登录'
        });
    }


    var sensorFind = {
        user: userId
    };

    if (sensorId) {
        sensorFind['_id'] = sensorId
    }
    Sensor.find(sensorFind)
        .exec(function (err, result) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                })
            }
            else {
                return res.json({
                    errorCode: 0,
                    sensors: result
                })
            }
        });
};


