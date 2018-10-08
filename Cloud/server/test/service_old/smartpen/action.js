/**
 * Created by Jiang Suyang on 2016-11-18.
 */

var mongoose = require('../../cloud_db_connect');

//model文件
var Action = mongoose.model('Action');
var PenAction = mongoose.model('PenAction');
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
 * 取得所有动作/行为列表
 */
exports.getActionList = function (req, res) {
    Action.find({removed: false}, function (err, result) {
        if (err) {
            log4j.error(err);
            return res.json({
                errorCode: 500,
                message: err.message
            });
        } else {
            log4j.info('get action list success');
            return res.json({
                errorCode: 0,
                actions: result
            });
        }
    });
};

/**
 * 取得未绑定的动作列表
 * 本方法的应用场景：用户选择未绑定的动作列表，进行绑定操作
 * 本方法作为对getActionList()的补充
 * 本方法的核心是：所有动作-当前家庭已绑定的动作=未绑定的动作列表
 */
exports.getNotBindingActionList = function (req, res) {

    var homeId = req.user.current.home._id;

    if (!homeId) {
        return res.json({
            errorCode: 2001,
            message: '家庭为空'
        });
    }

    var findPenActionCondition = {
        removed: false,
        home: homeId
    };

    var actions = [];
    var penActions = [];
    var actionsNotBinding = [];

    async.waterfall([
        function (callback) {
            Action.find({removed: false}, function (err1, result) {
                if (err1) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                } else {
                    actions = result;

                    //console.log(actions);
                    callback();
                }
            });
        },
        function (callback) {
            PenAction.find(findPenActionCondition)
                .exec(function (err2, results) {
                    if (err2) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    } else {
                        if (results) {
                            penActions = results;

                            //console.log(penActions);
                        }
                        callback();
                    }
                });
        },
        function (callback) {
            var i = 0;
            var j = 0;
            var isBinding = false;

            for (i = 0; i < actions.length; i++) {
                for (j = 0; j < penActions.length; j++) {
                    if ((actions[i]._id).equals(penActions[j].action)) {
                        isBinding = true;
                    }
                }
                if (!isBinding) {
                    actionsNotBinding.push(actions[i]);
                }
                isBinding = false;
            }
            callback();

        }

    ], function () {
        return res.json({
            errorCode: 0,
            message: '取得未绑定的动作列表',
            actionsNotBinding: actionsNotBinding
        });
    });


};


//行为的创建（管理员创建预设动作）
exports.actionCreate = function (req, res) {
    var actionName = req.body.actionName;
    var feature = req.body.feature;

    if (!actionName) {

        return res.json({
            errorCode: 1910,
            message: '行为名称为空'
        });
    }
    if (!feature) {

        return res.json({
            errorCode: 1911,
            message: '行为特征为空。'
        })
    }


    var criteria = {
        actionName: actionName,
        feature: feature,
        removed: false
    }
    Action.create(criteria, function (err, result) {   //行为已存在未验证
        if (err) {
            log4j.error(err);
            return res.json({
                errorCode: 500,
                message: err.message
            });
        } else {
            return res.json({
                errorCode: 0,
                message: "创建行为成功！"
            });
        }

    })

};
//行为的更新（管理员更新预设动作）
exports.actionUpdate = function (req, res) {
    var actionId = req.body.actionId;
    var actionName = req.body.actionName;
    var feature = req.body.feature;

    var criteria = {};
    if (actionName) {
        criteria['actionName'] = actionName;
    }
    if (feature) {
        criteria['feature'] = feature;
    }
    Action.findOneAndUpdate({_id: actionId}, criteria, null, function (err, results) {
        if (err) {
            log4j.error(err);
            return res.json({
                errorCode: 500,
                message: err.message
            });
        } else {
            return res.json({
                errorCode: 0,
                message: "更新行为成功！"
            });
        }

    })

};
//行为的删除（管理员删除预设动作）
exports.actionDelete = function (req, res) {
    var actionId = req.body.actionIds;    //行为ID数组
    var criteria = {'_id': {$in: actionId}};
    Action.count(criteria, function (err, count) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
        if (count < 0) {
            return res.json({
                errorCode: 1903,
                message: '行为不存在'
            });
        } else {

            Action.update(criteria, {$set: {removed: true}}, {multi: true}, function (err) {
                if (err) {
                    log4j.error('it fails to delete action');
                    log4j.error(err);
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                else {
                    log4j.info('delete action success');

                    return res.json({

                        errorCode: 0
                    });

                }
            });
        }
    });
};


/**
 * 取得某家庭绑定的列表（包含行为本身的信息、设备、情景模式等）
 */
exports.getList = function (req, res) {
    var homeId = req.user.current.home._id;
    var criteria = {
        removed: false
    };
    if (homeId) {
        criteria['home'] = homeId;
    }
    PenAction.find(criteria)
        .select('action bindType device deviceCommand scene createdTime updatedTime')
        .populate('action device scene')
        .exec(function (err, penActions) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            } else {


                var deviceIds = [];
                for (var i = 0; i < penActions.length; i++) {
                    if (penActions[i].device) {

                        deviceIds.push(penActions[i].device._id)

                    }
                }

                //
                //for (var i = 0; i < penActions.length; i++) {
                //    if (penActions[i].action) {
                //        penActions[i].action = null;
                //    }
                //}
                //
                //for (var i = 0; i < penActions.length; i++) {
                //    if (penActions[i].device) {
                //        if (penActions[i].device.state) {
                //            penActions[i].device.state = null;
                //        }
                //    }
                //}
                //for (var i = 0; i < penActions.length; i++) {
                //    if (penActions[i].scene) {
                //        penActions[i].scene.action = null;
                //        penActions[i].scene.repeat = null;
                //    }
                //}

                //console.log(penActions);

                HomeDevice.findOne({'devices.deviceId': {$in: deviceIds}}, function (err, result) {
                    if (err) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    } else {
                        var remarks = [];       //设备名称
                        var temp = {};

                        var i = 0;
                        var z = 0;
                        var j = 0;


                        //console.log(deviceIds);
                        //console.log(deviceIds.length);
                        //console.log(result.devices);


                        //遍历绑定的设备ID，从家庭设备列表中取得有动作绑定的设备的名称
                        for (z = 0; z < deviceIds.length; z++) {
                            temp = {};
                            for (j = 0; j < result.devices.length; j++) {


                                //此处注意转化为string类型作比较（原本是object类型）
                                if (validator.trim(deviceIds[z]) == validator.trim(result.devices[j].deviceId)) {

                                    temp['id'] = validator.trim(deviceIds[z]);
                                    temp['remark'] = validator.trim(result.devices[j].remark);
                                    remarks.push(temp);

                                    //remarks.push(result.devices[j].remark);
                                    //console.log(remarks);
                                    break;
                                }
                            }
                        }

                        var tempPenAction = {};
                        //将设备的名称写到penActions中
                        //for (i = 0; i < 1; i++) {
                        for (i = 0; i < remarks.length; i++) {
                            for (j = 0; j < penActions.length; j++) {
                                if (penActions[j].device) {
                                    if (validator.trim(remarks[i].id) == validator.trim(penActions[j].device._id)) {
                                        //console.log('123123123123');
                                        tempPenAction = penActions[j];

                                        //console.log(tempPenAction);
                                        //console.log('\n');
                                        //tempPenAction['remark'] = remarks[i].remark;

                                        //tempPenAction.device.remark = remarks[i].remark;
                                        tempPenAction.device.state.remark = remarks[i].remark;
                                        //console.log(tempPenAction);
                                        //console.log('\n\n\n');
                                        penActions[j] = tempPenAction;
                                        break;
                                    }
                                }
                                //console.log(penActions[j].device);
                            }
                        }


                        return res.json({
                            errorCode: 0,
                            message: "取得绑定列表",
                            penActions: penActions
                            //remarks: remarks
                        })

                    }
                });


                //return res.json({
                //    errorCode: 0,
                //    message: "取得绑定列表",
                //    penActions: penActions,
                //    device: deviceIds
                //})

            }
        })

};

/**
 * 将动作、行为绑定到设备或情景模式
 */
exports.create = function (req, res) {     //需要补充设备类型验证，category只能2,3,7
    var homeId = req.user.current.home._id;
    var actionId = req.body.actionId;
    var bindType = req.body.bindType;         //1代表设备控制，2代表情景模式
    var deviceId = req.body.deviceId;
    var deviceCommand = req.body.deviceCommand;
    var sceneId = req.body.sceneId;

    if (!homeId) {
        return res.json({
            errorCode: 1904,
            message: '家庭为空'
        });
    }

    if (!actionId) {
        return res.json({
            errorCode: 1903,
            message: '行为不存在。'
        })
    }

    if (!bindType) {
        return res.json({
            errorCode: 1905,
            message: '绑定模式为空'
        });
    }

    if (bindType == 1 && (!deviceId || !deviceCommand)) {
        return res.json({
            errorCode: 1906,
            message: '设备信息为空。'
        })
    }

    if (bindType == 2 && !sceneId) {
        return res.json({
            errorCode: 1907,
            message: '情景模式为空'
        });
    }

    var criteria = {
        home: homeId,
        action: actionId,
        bindType: bindType,
        createdTime: Date.now(),
        updatedTime: Date.now(),
        removed: false
    };
    if (bindType == 1) {
        criteria['device'] = deviceId;
        criteria['deviceCommand'] = deviceCommand;
        criteria['scene'] = null
    }
    if (bindType == 2) {
        criteria['device'] = null;
        criteria['deviceCommand'] = null;
        criteria['scene'] = sceneId
    }
    var findCriteria = {
        home: homeId,
        action: actionId,
        removed: false
    };
    PenAction.count(findCriteria, function (in_err, count) {
        log4j.debug('count[' + findCriteria + "]");
        if (in_err) {
            return res.json({
                errorCode: 500,
                message: in_err.message
            });
        }
        if (count > 0) {
            log4j.info('PenAction already exist.');
            return res.json({
                errorCode: 1908,
                message: '行为已绑定'
            });
        } else {
            var penAction = new PenAction(criteria);
            penAction.save(function (err) {
                log4j.debug('save[' + penAction + "]");
                if (err) {
                    log4j.error('it fails to save the penAction');
                    log4j.error(err);
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                else {
                    log4j.info('Create penAction success.');
                    return res.json({
                        errorCode: 0,
                        message: "行为绑定成功"
                    });
                }
            });
        }
    });
};

/**
 * 更新动作的绑定（绑定新的设备或情景模式）
 */
exports.update = function (req, res) {    //需要补充设备类型验证，category只能2,3,7
    var penActionId = req.body.penActionId;

    var bindType = req.body.bindType;         //1代表设备控制，2代表情景模式
    var deviceId = req.body.deviceId;
    var deviceCommand = req.body.deviceCommand;
    var sceneId = req.body.sceneId;

    if (!penActionId) {

        return res.json({
            errorCode: 1909,
            message: '行为绑定ID为空'
        });
    }

    if (!bindType) {

        return res.json({
            errorCode: 1905,
            message: '绑定模式为空'
        });
    }
    if (bindType == 1 && (!deviceId || !deviceCommand)) {

        return res.json({
            errorCode: 1906,
            message: '设备信息为空。'
        })
    }
    if (bindType == 2 && !sceneId) {

        return res.json({
            errorCode: 1907,
            message: '情景模式为空'
        });
    }

    var criteria = {
        bindType: bindType,
        updateTime: Date.now()
    }
    if (bindType == 1) {
        criteria['device'] = deviceId;
        criteria['deviceCommand'] = deviceCommand;
        criteria['scene'] = null;
    }
    if (bindType == 2) {
        criteria['scene'] = sceneId
        criteria['device'] = null;
        criteria['deviceCommand'] = null;
    }

    PenAction.findOneAndUpdate({_id: penActionId}, criteria, null, function (err, results) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        } else {
            return res.json({
                errorCode: 0,
                message: '更新行为绑定成功！'
            });
        }

    })

}

/**
 * 删除动作的绑定（即该动作不再绑定设备或情景模式）
 */
exports.delete = function (req, res) {
    var penActionId = req.body.penActionId;
    if (!penActionId) {

        return res.json({
            errorCode: 1909,
            message: '行为绑定ID为空'
        });
    }
    PenAction.findOneAndUpdate({_id: penActionId}, {$set: {removed: true}}, null, function (err, results) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        } else {
            return res.json({
                errorCode: 0,
                message: '删除行为绑定成功！'
            });
        }

    })

}