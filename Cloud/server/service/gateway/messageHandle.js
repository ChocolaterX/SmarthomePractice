/**
 * Created by liyang on 2015-8-19.
 */
var mongoose = require('../../cloud_db_connect');
var message = require('../message/message');
var Device = mongoose.model('Device');
var config = require('../../../config/config');

exports.handle = function (req, res) {
    var parameter = req.body._json

    var type = parameter.type;
    var value = parameter.value;
    switch (type) {
        case 'door':

            var content;
            if (value == 0) {
                content = config.jpush.doorCloseContent;


            }
            if (value == 1) {
                content = config.jpush.doorOpenContent;

            }
            getUserByMac(parameter.deviceId, function (err, doc) {
                if (err) {
                    return res.json({
                        message: 'device is not exist'
                    });
                }
                message.create(doc, content, null, function (err, doc) {
                    if (doc == null) {
                        console.log('推送信息失败---')
                        return res.json({
                            message: '推送信息失败'
                        });
                    }
                    else {
                        return res.json({
                            errorCode: 0
                        });
                    }
                });
            })
            break;
        case 'temperature':
            if (value > config.jpush.temperature) {
                getUserByDeviceId(parameter.deviceId, function (err, doc) {
                    if (err) {
                        return res.json({
                            message: 'device is not exist'
                        });
                    }
                    message.create(doc, config.jpush.temperatureContent, null, function (err, doc) {
                        if (doc == null) {
                            console.log('推送信息失败---')
                            return res.json({
                                message: '推送信息失败'
                            });
                        }
                        else {
                            return res.json({
                                errorCode: 0
                            });
                        }
                    })
                });

            }
            break;
        case 'humidity':
            if (value > config.jpush.humidity) {
                getUserByDeviceId(parameter.deviceId, function (err, doc) {
                    if (err) {
                        return res.json({
                            message: 'device is not exist'
                        });
                    }
                    message.create(doc, config.jpush.humidityContent, null, function (err, doc) {
                        if (doc == null) {
                            console.log('推送信息失败---')
                            return res.json({
                                message: '推送信息失败'
                            });
                        }
                        else {
                            return res.json({
                                errorCode: 0
                            });
                        }
                    })
                });

            }
            break;
        case 'gasdetection':
            if (value > config.jpush.gasdetection) {
                getUserByDeviceId(parameter.deviceId, function (err, doc) {
                    if (err) {
                        return res.json({
                            message: 'device is not exist'
                        });
                    }
                    message.create(doc, config.jpush.gasdetectionContent, null, function (err, doc) {
                        if (doc == null) {
                            console.log('推送信息失败---')
                            return res.json({
                                message: '推送信息失败'
                            });
                        }
                        else {
                            return res.json({
                                errorCode: 0
                            });
                        }
                    })
                });

            }
            break;
    }

    function getUserByDeviceId(deviceId, cb) {
        if (!deviceId) {
            return;
        }
        Device.findById(deviceId).populate('home', 'user').exec(function (err, doc) {
            if (err || !doc||(!doc.home)) {
                return cb(new Error('device is not exist'));
            } else {
                return cb(null, doc.home.user)
            }
        });
    }

    function getUserByMac(deviceId, cb) {
        if (!deviceId) {
            return;
        }
        Device.findOne({'mac': deviceId}).populate('home', 'user').exec(function (err, doc) {
            if (err || !doc || (!doc.home)) {
                return cb(new Error('device is not exist'));
            }
            else {
                return cb(null, doc.home.user)
            }
        });
    }
}