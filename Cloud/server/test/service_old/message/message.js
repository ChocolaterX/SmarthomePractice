/**
 * Created by leizhang on 2015/8/5.
 */

var mongoose = require('../../cloud_db_connect');
var User = mongoose.model('User');
var Message = mongoose.model('Message');
var EntranceSetting = mongoose.model('EntranceSetting');
var SenseSetting = mongoose.model('SenseSetting');

var validator = require('validator');
var config = require('../../../config/config');
//var log = require('log4js').getLogger('services/message');
var log4j = require('log4js').getLogger();
//var jpush=require('./jpush');
var JPush = require('jpush-sdk');
var client = JPush.buildClient(config.jpush.appKey, config.jpush.masterSecret);

var express = require('express');
var qr = require('qr-image');

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
            EntranceSetting.findOne({user: to}, function (error, pre) {
                if (error) {
                    log4j.error(error);
                    return cb(error, null);
                }
                if (pre && pre.send == false) {
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

exports.senseLocalCreate = function create(to, content, cb) {
    var to = to;
    var content = content;


    User.findOne({'_id': to}, function (err, user) {
        if (err) {
            log4j.error(err);
            return cb(err, null);
        }
        if (!user) {
            log4j.info('消息推送的目标用户不存在');
            return cb('消息推送的目标用户不存在', null);
        }



        var criteria = {
            to: user.id,
            content: content,
            removed: false

        };

        var message = new Message(criteria);
        message.save(function (err) {
            if (err) {
                log4j.error(err);
                return cb(err, null);
            } else {
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

};