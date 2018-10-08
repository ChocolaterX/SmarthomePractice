/**
 * Created by leizhang on 2015/8/5.
 */

var mongoose = require('../../cloud_db_connect');
var User = mongoose.model('User');
var Preference = mongoose.model('Preference');
var Message = mongoose.model('Message');
var validator = require('validator');
var config = require('../../../config/config');
//var log = require('log4js').getLogger('services/message');
var log4j = require('log4js').getLogger();
//var jpush=require('./jpush');
var JPush = require('jpush-sdk');
var client = JPush.buildClient(config.jpush.appKey, config.jpush.masterSecret);


var express = require('express');
var qr = require('qr-image');


exports.get = function (req, res, next) {
    var userId = req.user.current._id;
    var mesId = req.param('messageId');




    Message.findOne({_id: mesId}, function (err, message) {

        if (err) {

            return res.json({

                errorCode: 500,
                message: err.message
            });
        }
        if (message && (message.to) != userId) {
            return res.json({
                errorCode: 1307,
                message: '没有权限'
            });
        }
        else {
            if (message) {

                var actions = message.actions;
                if (actions) {
                    for (var i = 0; i < actions.length; i++) {
                        if (actions[i].parameters) {
                            var action = {};
                            action._id = actions[i]._id;
                            action.name = actions[i].name;
                            action.url = actions[i].url;
                            action.method = actions[i].method;
                            action.parameter = JSON.parse(actions[i].parameters);
                            actions[i] = action;
                        }
                    }
                }
            }
            return res.json({
                errorCode: 0,
                message: message
            });
        }
    });
};

/*
 exports.create = function (to,content,actions) {

 var to = to;
 var content = content;
 var actions = actions;


 /!*  if(!content){
 return res.json({
 errorCode:1302,
 message:'消息内容为空'
 })
 }*!/
 /!*if (!to || typeof to != 'string') {
 return res.json({
 errorCode: 1301,
 message: 'to 参数格式错误，须为对方id字符串'
 });
 }*!/


 //to must be user
 //var query = to.indexOf('@') < 0 ? {'_id': to} : {'email': to};
 User.findOne({'_id': to}, function (err, user) {
 if (err) {
 return res.json({
 errorCode: 500,
 message: err.message
 });
 }
 if (!user) {
 return res.json({
 errorCode: 1306,
 message: '消息对方用户不存在'
 });
 }

 if (actions && actions.constructor === Array) {
 for (var i = 0; i < actions.length; i++) {
 if (actions[i].parameters && typeof actions[i].parameters == 'object') {
 actions[i].parameters = JSON.stringify(actions[i].parameters);
 }
 }
 }

 var criteria = {
 to: user.id,
 content: content,
 read: false,
 removed: false,
 actions: actions
 };

 var message = new Message(criteria);
 message.save(function (err,mess) {
 if (err) {
 return res.json({
 errorCode: 500,
 message: err.message
 });
 }
 console.log(to);
 console.log(content);
 jpush.push(to,content);
 /!*Message.findById(mess._id)
 .populate('to', 'phone email')
 .exec(function (err, msg) {
 if (err) {
 log.error('it fails to populate the message from.');
 log.error(err);
 } else {
 /!* req.message = msg;
 next();*!/
 jpush.push(msg)
 }

 //return;
 });*!/
 /!* console.log(5555555);
 res.json({
 errorCode: 0
 });*!/
 });
 });
 };
 */

exports.count = function (req, res) {
    var userId = req.user.current._id;
    var filters = req.body.filters;

    var criteria = {};

    //add filters
    if (filters) {
        try {
            if (validator.isJSON(filters)) {
                filters = JSON.parse(filters);
            }
            if (typeof(filters) === 'object') {
                for (var key in filters) {
                    criteria[key] = filters[key];
                }
            }
        } catch (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
    }

    criteria['to'] = userId;

    Message.count(criteria).exec(function (err, count) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
        else {
            return res.json({
                errorCode: 0,
                count: count
            });
        }
    });
};

exports.unread = function (req, res) {
    var userId = req.user.current._id;
    var criteria = {'to': userId, 'read': false};
    Message.find(criteria)
        .sort({'lastUpdatedTime': -1})
        .populate('from', 'name email')
        .populate('to', 'name email')
        .exec(function (err, mess) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            }
            else {
                return res.json({
                    errorCode: 0,
                    messages: mess
                });
            }
        });
};

exports.find = function (req, res) {

    try {
        var userId = req.user.current._id;

        var filters = req.body.filters;

        var pageIndex = validator.toInt(req.body.pageIndex) >= 0 ? validator.toInt(req.body.pageIndex) : 0;
        var pageSize = validator.toInt(req.body.pageSize) >= 0 ? validator.toInt(req.body.pageSize) : 10;
        var orderBy = req.body.orderBy ? (Message.schema.path(req.body.orderBy) ? req.body.orderBy : 'lastUpdatedTime') : 'lastUpdatedTime';
        var ascend = (typeof req.body.ascend) === 'boolean' && req.body.ascend ? 1 : -1;

        var order = {};
        order[orderBy] = ascend;

        var criteria = {};

        //add filters
        if (filters) {
            try {
                if (validator.isJSON(filters)) {
                    filters = JSON.parse(filters);
                }
                if (typeof(filters) === 'object') {
                    for (var key in filters) {
                        if (key == 'content' && typeof filters[key] == 'string') {
                            criteria[key] = {'$regex': filters[key], '$options': 'i'};
                        }
                        else if (filters[key] != null) {
                            criteria[key] = filters[key];
                        }
                    }
                }
            } catch (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            }
        }

        criteria['$or'] = [];

        criteria['$or'].push({to: userId});
        //criteria['to']=userId;


        Message.count(criteria).exec(function (out_err, count) {
            if (out_err)
                return res.json({
                    errorCode: 500,
                    message: out_err.message
                });

            Message.find(criteria)
                .sort(order)
                .skip(pageIndex * pageSize)
                .limit(pageSize)
                .populate('from', 'name email')
                .populate('to', 'name email')
                .exec(function (err, mes) {
                    if (err) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    else {
                        for (var j = 0; j < mes.length; j++) {
                            var actions = mes[j].actions;
                            if (actions) {
                                for (var i = 0; i < actions.length; i++) {
                                    if (actions[i].parameters) {
                                        var action = {};
                                        action._id = actions[i]._id;
                                        action.name = actions[i].name;
                                        action.url = actions[i].url;
                                        action.method = actions[i].method;
                                        action.parameter = JSON.parse(actions[i].parameters);
                                        actions[i] = action;
                                    }
                                }
                            }
                        }
                        return res.json({
                            errorCode: 0,
                            messages: mes,
                            totalRecords: count
                        });
                    }
                });
        });
    } catch (e) {
        log.error('if fails to find the message');
        log.error(e);
        res.json({
            errorCode: 500,
            message: e.message
        })
    }
};


exports.read = function (req, res) {
    var userId = req.user.current._id;
    var mesId = req.param('messageId');
    Message.findOne({_id: mesId}, function (err, message) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
        if (!message) {
            return res.json({
                errorCode: 1303,
                message: 'Message not found'
            });
        }

        if (!message.to.equals(userId)) {
            return res.json({
                errorCode: 1307,
                message: 'No authority'
            });
        }

        message.read = true;
        message.readTime = Date.now();
        message.save(function (err) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            }

            return res.json({
                errorCode: 0,
                messageId: message._id
            });
        });
    });
};


exports.remove = function (req, res) {
    var userId = req.user.current._id;
    var mesId = req.param('messageId');
    Message.findOne({_id: mesId}, function (err, message) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
        if (!message) {
            return res.json({
                errorCode: 1303,
                message: 'Message not found'
            });
        }
        if (!message.to.equals(userId)) {
            return res.json({
                errorCode: 1307,
                message: 'No authority'
            });
        }

        message.removed = true;
        message.save(function (err) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            }

            return res.json({
                errorCode: 0,
                messageId: message._id
            });
        });
    });
};

exports.perform = function (req, res) {
    var userId = req.user.current._id;
    var mesId = req.param('messageId');
    var actName = req.body.actionName;


    Message.findOne({_id: mesId}, function (err, message) {

        if (err)
            return res.json({
                errorCode: 500,
                message: err.message
            });
        if (!message)
            return res.json({
                errorCode: 1303,
                message: 'Message not existed'
            });

        var action = null;
        for (var i = 0; i < message.actions.length; i++) {
            if (message.actions[i].name === actName) {
                action = message.actions[i];
                break;
            }
        }
        if (!action)
            return res.json({
                errorCode: 1305,
                message: 'Action not existed'
            });

        message.performed = actName;
        message.save(function (in_err) {
            if (in_err)
                return res.json({
                    errorCode: 500,
                    message: in_err.message
                });
            else

                return res.json({
                    errorCode: 0,
                    messageId: message._id
                });
        });
    });
};
exports.create = function (req, res) {
    var to = req.body.to;
    var content = req.body.content;
    var actions = req.body.actions || null;
    log4j.info('在'+req.body)
    User.findOne({'_id': to}, function (err, user) {
        if (err) {

            log4j.error(err);
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
        if (!user) {
            log4j.info('消息推送的目标用户不存在');
            return res.json({
                errorCode: 1306,
                message: '消息推送的目标用户不存在'
            });
        }

        if (actions && actions.constructor === Array) {
            for (var i = 0; i < actions.length; i++) {
                if (actions[i].parameters && typeof actions[i].parameters == 'object') {
                    actions[i].parameters = JSON.stringify(actions[i].parameters);
                }
            }
        }

        var criteria = {
            to: user.id,
            content: content,
            read: false,
            removed: false,
            actions: actions
        };
        console.log("!!!!!!!!!!!!!!!!!!!")
        console.log("!!!!!!!!!!!!!!!!!!!")
        console.log(criteria)
        console.log("!!!!!!!!!!!!!!!!!!!")
        console.log("!!!!!!!!!!!!!!!!!!!")

        var message = new Message(criteria);
        message.save(function (err) {
           
            if (err) {
                log4j.error(err);
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            }
            Preference.findOne({user: to}, function (error, pre) {
                if (error) {

                    log4j.error(error);
                    return res.json({
                        errorCode: 500,
                        message: error.message
                    });
                }
                if (pre && pre.receiveMessage == false) {
                    log4j.info('消息创建成功');
                    return res.json({
                        errorCode: 0
                    });
                }
                else {
                    client.push().setPlatform(JPush.ALL)
                        //.setAudience(JPush.ALL)

                        .setAudience(JPush.alias('' + to + ''))
                        // .setNotification('华系签家',JPush.android('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}), JPush.ios('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}))
                        //  .setNotification(JPush.android('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}))
                        .setNotification(JPush.android('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}),
                        JPush.ios('' + content + '', 'sound', '+1'))
                        .setMessage('' + content + '', config.jpush.title, 'system', {'user': '' + to + ''})
                        // .setOptions(null,null,null,true,null)
                        .send(function (err, resp) {
                            if (err) {
                                // console.log('push fail ' + JSON.parse(err.response).error.message);
                                log4j.error(err);

                                // return cb(JSON.parse(err.response).error.message, null);
                                return res.json({
                                    errorCode: 500,
                                    message: err.message

                                });
                            } else {
                                log4j.info('推送成功');
                                console.log('推送成功-------');
                                return res.json({
                                    errorCode: 0
                                });
                            }
                        });
                }
            });
        });
    });
};

exports.localCreate = function create(to, content, actions, cb) {
    var to = to;
    var content = content;
    var actions = actions || null;

    User.findOne({'_id': to}, function (err, user) {
        if (err) {
            log4j.error(err);
            return cb(err, null);
        }
        if (!user) {
            log4j.info('消息推送的目标用户不存在');
            return cb('消息推送的目标用户不存在', null);
        }

        if (actions && actions.constructor === Array) {
            for (var i = 0; i < actions.length; i++) {
                if (actions[i].parameters && typeof actions[i].parameters == 'object') {
                    actions[i].parameters = JSON.stringify(actions[i].parameters);
                }
            }
        }

        var criteria = {
            to: user.id,
            content: content,
            read: false,
            removed: false,
            actions: actions
        };

        var message = new Message(criteria);
        message.save(function (err) {
            if (err) {
                log4j.error(err);
                return cb(err, null);
            }
            Preference.findOne({user: to}, function (error, pre) {
                if (error) {
                    log4j.error(error);
                    return cb(error, null);
                }
                if (pre && pre.receiveMessage == false) {
                    log4j.info('消息创建成功');
                    return cb(null, null);
                }
                else {
                    client.push().setPlatform(JPush.ALL)
                        //.setAudience(JPush.ALL)
                        .setAudience(JPush.alias('' + to + ''))
                        // .setNotification('华系签家',JPush.android('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}), JPush.ios('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}))
                        //  .setNotification(JPush.android('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}))
                        .setNotification(JPush.android('' + content + '', config.jpush.title, 1, {'user': '' + to + ''}),
                        JPush.ios('' + content + '', 'sound', '+1'))
                        .setMessage('' + content + '', config.jpush.title, 'system', {'user': '' + to + ''})
                        // .setOptions(null,null,null,true,null)
                        .send(function (err, resp) {
                            if (err) {
                                // console.log('push fail ' + JSON.parse(err.response).error.message);
                                log4j.error(err);
                                // return cb(JSON.parse(err.response).error.message, null);
                                return cb(err, null);
                            } else {
                                log4j.info('推送成功');
                                console.log('推送成功-------');
                                return cb(null, 'success');
                            }
                        });
                }
            });
        });
    });
};


exports.test = function (req, res) {
    console.log('in');
    var to = req.body.to;
    var content = req.body.content;
    create(to, content, null, function (err, result) {
        console.log(err);
        if (err) {
            return res.json({
                errorCode: 500,
                message: err
            });
        } else {
            console.log(result);
            return res.json({errorCode: 0, result: result})
        }
    });
};