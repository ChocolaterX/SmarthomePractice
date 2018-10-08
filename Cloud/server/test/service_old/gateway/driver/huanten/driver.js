/**
 * modified by Jaye on 15/12/13.
 */

var needle = require('needle');
var request = require('request');
var double = 3;
var config = require('../../../../../config/config');
var commandHandle = require('./commandHandleimpl');
var senseHandle = require('./senseHandleimpl');
var messageHandle = require('./messageHandle');
var log4j = require('log4js').getLogger();
var util = require('util');


function push(_json, value) {
    //needle.request('post', config.cloud.baseUrl+'/download/commandHandle', {_json:_json,value:value}, function(err, resp) {
    //});
    log4j.info('==================================command push!====================================');
    commandHandle.handle({_json:_json,value:value},function(err,msg){
        if(err){
            return log4j.error("commandHandleImpl:"+util.inspect(err));
        }
        return log4j.info("commandHandleImpl:"+util.inspect(msg));
    });
}

function pushsense(_json, value) {
    //needle.request('post', config.cloud.baseUrl+'/download/senseHandle', {_json:_json,value:value}, function(err, resp) {
    //});
    senseHandle.handle({_json:_json,value:value},function(err,msg){
        if(err){
            return log4j.error("senseHandleImpl:"+err);
        }
        return log4j.info("senseHandleImpl:"+msg);

    });
}

function pushmessage(_json) {
    //var a = (new Date(Date.now())).toLocaleString();
    //needle.request('post', config.cloud.baseUrl+'/download/messageHandle', {_json:_json}, function(err, resp) {
    //});
    messageHandle.handle({_json:_json},function(err,msg){
        if(err){
            return log4j.error("messageHandleImpl:"+err);
        }
        return log4j.info("messageHandleImpl:"+msg);

    })
}
exports.execute = function (parameter,cb) {
    //var data = req.body.data;
    //tooken = req.body.tooken;
    //console.log('driver execute');//+require('util').inspect(parameter));
    var data = parameter.data;
    var c = data.data;
    var method = data.method;
    var deviceId = c.addr;
    var gatewayId = data.gatewayId;
    if (method == 'huanten' && data.type != 'sense') {
        log4j.info('driver execute:method===huangteng means command')
        //状态确认
        if (c.command == '5269') {
            var lightOn = parseInt(((c.para).substring(3, 4)), 16);
            var intensity = parseInt(((c.para).substring(4, 6)), 16);
            var hue = parseInt(((c.para).substring(6, 8)), 16);
            var para = (c.para).substring(0, 2);
            var _value = {};
            _value['lightOn'] = lightOn;
            _value['intensity'] = intensity;
            _value['hue'] = hue;
            var _certia = {
                type: 'command',
                gatewayId: gatewayId,
                data: {
                    addr: deviceId,
                    command: '6173',
                    para: para + '00'
                },
                method: 'huanten'
            };
            var d = JSON.stringify(_certia);
            push(d, _value);
            //return res.json({
            //    errorCode: 0
            //})
            return cb(null, {errorCode: 0});
        }
        //便携开关状态
        if (c.command == '7370') {
            log4j.info('短按')
            var _json = {
                type: 'command',
                gatewayId: gatewayId,
                data: {
                    addr: deviceId,
                    command: '7370',
                    para: ''
                },
                method: 'huanten'
            };
            var d = JSON.stringify(_json);
            push(d, {});
            //return res.json({
            //    errorCode: 0
            //})
            return cb(null, {errorCode: 0});
        }
        if (c.command == '6c70') {
            var _json = {
                type: 'command',
                gatewayId: gatewayId,
                data: {
                    addr: deviceId,
                    command: '6c70',
                    para: ''
                },
                method: 'huanten'
            };
            var d = JSON.stringify(_json);
            push(d, {});
            //return res.json({
            //    errorCode: 0
            //})
            return cb(null, {errorCode: 0});
        }
        //智能开关状态确认
        if (c.command == '7273') {
            var button_seq = c.para.substring(0, 2);
            var isOn = pad(((parseInt((c.para.substring(3, 4)).toString(16), 16)).toString(2)), 4).substring(1, 4);
            var value = {
                value: isOn
            }
            //回复状态
            var buttoncer = {
                type: 'command',
                gatewayId: gatewayId,
                data: {
                    addr: deviceId,
                    command: '7273',
                    para: button_seq
                },
                method: 'huanten'
            }
            var _buttoncer = JSON.stringify(buttoncer);
            push(_buttoncer, value);
            //return res.json({
            //    errorCode: 0
            //})
            return cb(null, {errorCode: 0});
        }
        //询问时间
        if (c.command == '7174') {
            //大小端转换
            var __header = new Buffer('FFFF', 'hex');
            var _midd = swapBytes(new Buffer((Math.round(new Date().getTime() / 1000)).toString(16), 'hex'));
            var _para = Buffer.concat([__header, _midd]);
            var certia = {
                type: 'command',
                gatewayId: gatewayId,
                data: {
                    addr: deviceId,
                    command: '6174',
                    para: _para.toString('hex')
                },
                method: 'huanten'
            };
            var d = JSON.stringify(certia);
            push(d, {});
            //return res.json({
            //    errorCode: 0
            //})
            return cb(null, {errorCode: 0});
        }
        //窗帘位置汇报
        if (c.command == '4d64') {
            var curtain_loca = c.para.substring(0, 2);
            var curtain_seq = c.para.substring(2, 4);
            var curtain_on = c.para.substring(12, 14);
            var value = {
                curtain_loca: curtain_loca,
                curtain_seq: curtain_seq,
                curtain_on: curtain_on
            }
            //状态不为50时回复
            if (curtain_loca != '50') {
                var curtain_ma = {
                    type: 'command',
                    gatewayId: gatewayId,
                    data: {
                        addr: deviceId,
                        command: '4d61',
                        para: curtain_seq
                    },
                    method: 'huanten'
                }
                var loca_crutai = JSON.stringify(curtain_ma);
                push(loca_crutai, value);
                //return res.json({
                //    errorCode: 0
                //})
                return cb(null, {errorCode: 0});

            } else {
                //记录窗帘state
                //02转为2
                if (curtain_on.substring(0, 1) == 0) {
                    curtain_on = parseInt(curtain_on.substring(1, 2), 16);
                }
                value.curtain_on = curtain_on;
                //回复
                var curtain_ok = {
                    type: 'command',
                    gatewayId: gatewayId,
                    data: {
                        addr: deviceId,
                        command: '4d61',
                        para: curtain_seq
                    },
                    method: 'huanten'
                }
                var curtain__on = JSON.stringify(curtain_ok);
                push(curtain__on, value);
                //return res.json({
                //    errorCode: 0
                //})
                return cb(null, {errorCode: 0});
            }
        }

    } else {
        if (c.type == 'sushi') {
            var seq = c.values.substring(0, 2);
            var doorcer = {
                type: 'command',
                gatewayId: gatewayId,
                data: {
                    addr: deviceId,
                    command: '6461',
                    para: seq
                },
                method: 'huanten'
            }
            var _doorcer = JSON.stringify(doorcer);
            //client.write(_doorcer+'$$$');
            //添加到deviceList
            console.log('in driver sushi values:'+ c.values);
            var value_door = pad((parseInt((c.values.substring(2, 3)).toString(16), 16).toString(2)), 4).substring(0, 1);
            console.log('in driver sushi parse values:'+ value_door);

            var value = {
                value_door: value_door
            }
            //var message = {
            //    type: 'door',
            //    value: value_door,
            //    deviceId: deviceId
            //}
            pushsense(_doorcer, value);
            //if (double != value_door) {
            //    pushmessage(message);
            //    double = value_door;
            //}

            //return res.json({
            //    errorCode: 0
            //})
            return cb(null, {errorCode: 0});

        } else {
            var criteria = {
                type: c.type,
                value: c.values,
                deviceId: deviceId
            };
            var a = {
                method: 'sense'
            }
            var _a = JSON.stringify(a);
            pushsense(_a, criteria);
            //return res.json({
            //    errorCode: 0
            //})
            return cb(null, {errorCode: 0});
        }
    }
}

function pad(num, n) {
    var i = (num + "").length;
    while (i++ < n) num = "0" + num;
    return num;
}
//大小端转换
function swapBytes(buffer) {
    var l = buffer.length;
    if (l & 0x01) {
        //return null;
        if (l == 1) {
            return buffer;
        }
        l = l + 1;

    }
    var mid = l / 2;
    for (var i = 0; i < mid; i += 1) {
        var a = buffer[i];
        buffer[i] = buffer[l - i - 1];
        buffer[l - i - 1] = a;
    }
    return buffer;
}