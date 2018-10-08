/**
 * <copyright file="region.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>11/22/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var config = require('../../../config/config');
var Device = mongoose.model('Device');
var User = mongoose.model('User');
var Region = mongoose.model('Region');

var validator = require('validator');
var async = require('async');
var config = require('../../../config/config');
//var log4j = require('log4js').getLogger();
var jwt = require('jsonwebtoken');

//创建家庭区域
exports.createRegion = function (req, res) {
    var user = req.user.current;
    var regionName;

    if (!user) {
        return res.json({
            errorCode: 1600,
            message: '获取当前用户失败'
        })
    }
    if (!req.body.regionName) {
        return res.json({
            errorCode: 1600,
            message: '未输入待创建的家庭区域名称'
        });
    }
    else {
        regionName = validator.trim(req.body.regionName);
    }

    var regionTemp = {};
    regionTemp['user'] = user._id;
    regionTemp['name'] = regionName;

    async.waterfall([
        //查询当前是否已存在同名的区域
        function (callback) {
            Region.findOne(regionTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1600,
                            message: '异常错误：查询待创建区域是否存在失败'
                        })
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 1600,
                            message: '与已有区域重名，请重新输入'
                        })
                    } else {
                        callback();
                    }
                });
        },
        //存储
        function (callback) {
            var regionSave = new Region(regionTemp);
            regionSave.save(function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1600,
                        message: '异常错误：存储待创建区域失败'
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
            message: '创建新家庭区域成功'
        });
    });
};

//修改家庭区域
exports.updateRegion = function (req, res) {
    var user = req.user.current;
    var regionId;
    var regionName;

    if (!user) {
        return res.json({
            errorCode: 1600,
            message: '获取当前用户失败'
        })
    }
    if (!req.body.regionId) {
        return res.json({
            errorCode: 1600,
            message: '未选择待更新的家庭区域'
        })
    }
    else {
        regionId = req.body.regionId;
    }
    if (!req.body.regionName) {
        return res.json({
            errorCode: 1600,
            message: '未输入待创建的家庭区域名称'
        });
    }
    else {
        regionName = validator.trim(req.body.regionName);
    }

    var regionTemp = {};
    regionTemp['_id'] = regionId;
    regionTemp['user'] = user._id;

    async.waterfall([
        //查询当前待修改的区域是否存在
        function (callback) {
            Region.findOne(regionTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1600,
                            message: '异常错误：查询待修改区域是否存在失败'
                        })
                    }
                    else if (result) {
                        callback();
                    } else {
                        return res.json({
                            errorCode: 1600,
                            message: '未找到待修改的区域'
                        })
                    }
                });
        },
        //查询当前是否已存在与待修改的区域名字同名的区域
        function (callback) {
            regionTemp['name'] = regionName;
            delete regionTemp._id;

            Region.findOne(regionTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1600,
                            message: '异常错误：查询待修改区域是否存在重名失败'
                        })
                    }
                    else if (result) {
                        return res.json({
                            errorCode: 1600,
                            message: '待修改区域存在重名'
                        })
                    } else {
                        callback();
                    }
                });
        },
        //更新
        function (callback) {
            Region.update({_id: regionId}, {$set: regionTemp}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1600,
                        message: '修改区域名称失败'
                    })
                }
                else {
                    callback();
                }
            });
        }
    ], function () {
        return res.json({
            errorCode: 0,
            message: '修改区域名称成功'
        })
    });
};

//查看家庭区域
exports.getRegionList = function (req, res) {
    var user = req.user.current;

    if (!user) {
        return res.json({
            errorCode: 1600,
            message: '获取当前用户失败'
        })
    }

    var regionTemp = {};
    regionTemp['user'] = user._id;
    var deviceTemp = {};
    deviceTemp['user'] = user._id;
    var devices = [];       //用户的所有设备
    var regions = [];           //用户的区域
    var regionDevices = [];     //各区域的设备结果集，与regions索引相同，即regionDevices[0]代表regions[0]区域下的设备集
    //var deviceWithNoRegion = [];    //无区域设备

    async.waterfall([
        //查询用户家庭设备
        function (callback) {
            Device.find(deviceTemp)
                .sort({createdTime: -1})
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询用户家庭设备失败'
                        });
                    }
                    else if (!result) {
                        return res.json({
                            errorCode: 1700,
                            message: '当前家庭无设备'
                        });
                    }
                    else {
                        devices = result;
                        //console.log(devices);
                        callback();
                    }
                });
        },
        //查询用户的区域
        function (callback) {
            Region.find(regionTemp)
                .sort({createdTime: -1})
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1700,
                            message: '异常错误：查询用户区域失败'
                        });
                    }
                    else {
                        regions = result;
                        //console.log('\n\n');
                        //console.log(regions);
                        callback();
                    }
                });
        },
        //将设备置于指定区域中
        function (callback) {
            var regionDevicesTemp = [];     //临时存储一个区域中的所有设备
            var i = 0;
            var j = 0;

            //找出有区域的设备
            for (i = 0; i < regions.length; i++) {
                regionDevicesTemp = [];
                for (j = 0; j < devices.length; j++) {
                    if ((devices[j].region).equals(regions[i]._id)) {
                        regionDevicesTemp.push(devices[j]);
                    }
                    if (j == devices.length - 1) {
                        regionDevices.push(regionDevicesTemp);
                    }
                }
            }
            callback();
        }
    ], function (callback) {
        return res.json({
            errorCode: 0,
            regions: regions,
            regionDevices: regionDevices
        });
    });

    //Region.find(regionTemp)
    //    .sort({createdTime: -1})
    //    .exec(function (err, result) {
    //        if (err) {
    //            return res.json({
    //                errorCode: 1600,
    //                message: '查询区域失败'
    //            })
    //        }
    //        else {
    //            return res.json({
    //                errorCode: 0,
    //                regions: result
    //            })
    //        }
    //    });
};

//删除家庭区域
//未完成：删除家庭区域时，如有关联在该区域的设备，需更新这些设备
exports.deleteRegion = function (req, res) {
    var user = req.user.current;
    var regionId;

    if (!user) {
        return res.json({
            errorCode: 1600,
            message: '获取当前用户失败'
        })
    }
    if (!req.body.regionId) {
        return res.json({
            errorCode: 1600,
            message: '未选择待删除的家庭区域'
        })
    }
    else {
        regionId = req.body.regionId;
    }

    var regionTemp = {};
    regionTemp['_id'] = regionId;
    regionTemp['user'] = user._id;

    async.waterfall([
        //查询待删除区域是否存在
        function (callback) {
            Region.findOne(regionTemp)
                .exec(function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 1600,
                            message: '异常错误：查询待删除区域是否存在失败'
                        })
                    }
                    else if (result) {
                        callback();
                    } else {
                        return res.json({
                            errorCode: 1600,
                            message: '未找到待删除的区域'
                        })
                    }
                });
        },
        //删除
        function (callback) {
            Region.remove({_id: regionId}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 1600,
                        message: '异常错误：删除区域失败'
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
            message: '删除区域成功'
        })
    })
};

//更改家庭区域排序
exports.orderRegion = function (req, res) {

};


