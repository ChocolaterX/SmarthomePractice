/**
 * Created by liyang on 2015-8-19.
 */
var mongoose = require('../../cloud_db_connect');
var Sense = require('../sense/sense');
var Scene =require('../scene/scene');
var Gateway = require('./gateway');
var Device = mongoose.model('Device');
var jishu=0;
var double = 3;
exports.handle = function(ack,cb){
    var c = ack.data;
    var method = ack.method;
    var deviceId = c.addr;
    var gatewayId = ack.gatewayId;
    if (method == 'huanten') {
        //console.log(b);
        //状态确认
        if (c.command == '5269') {
            var lightOn = parseInt(((c.para).substring(3, 4)), 16);
            var intensity = parseInt(((c.para).substring(4, 6)), 16);
            var hue = parseInt(((c.para).substring(6, 8)), 16);
            var para = (c.para).substring(0, 2);
            Device.findOneAndUpdate({mac: deviceId}, {$set:{
                state: {
                    'on': lightOn,
                    'intensity': intensity,
                    'hue': hue
                }}
            }, function (err, doc) {
                if(err){
                    return cb(null,'the light is not exist');
                }else if(!doc){
                    return cb(null,'the light is not exist')
                }
                console.log('灯泡状态确认完毕');
            })
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
            //client.write(d+'$$$');
            return cb(null,d+'$$$');
        }
        //便携开关状态
        if(c.command == '7370'){
            Device.findOne({mac:deviceId},function(err,doc){
                if(err){
                    //return client.write('the Portable switch is not exist')
                    return cb(null,'the Portable switch is not exist')
                }else if(!doc){
                    //return client.write('the Portable switch is not exist')
                    return cb(null,'the Portable switch is not exist')
                }
                var senceId = doc.extend.short;
                Scene.localrun(senceId,function(err_in,doc_in){
                    if(doc_in=='error'){
                        //return client.write('localrun is failure')
                        return cb(null,'localrun is failure')
                    }else{
                        console.log(doc_in);
                    }
                })
            })
        }
        if(c.command == '6c70'){
            Device.findOne({mac:deviceId},function(err,doc){
                if(err){
                    //return client.write('the Portable switch is not exist')
                    return cb(null,'the Portable switch is not exist')
                }else if(!doc){
                    //return client.write('the Portable switch is not exist')
                    return cb(null,'the Portable switch is not exist')
                }
                var senceId = doc.extend.long;
                Scene.localrun(senceId,function(err_in,doc_in){
                    if(doc_in=='error'){
                        //return client.write('localrun is failure')
                        return cb(null,'localrun is failure');
                    }else{
                        console.log(doc_in);
                    }
                })
            })
        }
        //智能开关状态确认
        if(c.command == '7273'){
            var button_seq = c.para.substring(0,2);
            var isOn = pad(((parseInt((c.para.substring(3,4)).toString(16),16)).toString(2)),4).substring(1,4);
            //回复状态
            var buttoncer = {
                type: 'command',
                gatewayId: gatewayId,
                data: {
                    addr: deviceId,
                    command: '6173',
                    para: button_seq
                },
                method: 'huanten'
            }
            var _buttoncer = JSON.stringify(buttoncer);
           // client.write(_buttoncer+'$$$');
            //状态录入数据库
            Device.findOneAndUpdate({mac: deviceId}, {$set:{
                state: {
                    'button': isOn
                }}
            },  function (err, doc) {
                if(err){
                    //return client.write('the button is not exist');
                    return cb(null,'the button is not exist');
                }else if(!doc){
                    //return client.write('the button magnet is not exist');
                    return cb(null,'the button magnet is not exist');
                }
                console.log('button state success');
                return cb(null,_buttoncer+'$$$');
            })
        }
        //门磁
        //if (c.command == '6473') {
        //
        //    var seq = c.para.substring(0, 2);
        //    // console.log(seq);
        //    var doorcer = {
        //        type: 'command',
        //        gatewayId: gatewayId,
        //        data: {
        //            addr: deviceId,
        //            command: '6461',
        //            para: seq
        //        },
        //        method: 'huanten'
        //    }
        //    var _doorcer = JSON.stringify(doorcer);
        //    //client.write(_doorcer+'$$$');
        //    //添加到deviceList
        //    var value_door = pad((parseInt((c.para.substring(2, 3)).toString(16),16).toString(2)),4).substring(0, 1);
        //
        //    DeviceList.findOneAndUpdate({mac: deviceId}, {$set:{
        //        state: {
        //            'door': value_door
        //        }}
        //    })
        //        .populate('home', 'user')
        //        .exec(function (err, doc) {
        //            if(err){
        //                return cb(null,'the door magnet is not exist');
        //            }else if(!doc){
        //                return cb(null,'the door magnet is not exist');
        //            }
        //            var doorId = doc._id;
        //            //添加到sense
        //            var criteria_door = {
        //                type: 'door',
        //                value: value_door,
        //                deviceId: doorId
        //            };
        //            //回复指令
        //            Gateway.command(gatewayId,_doorcer);
        //
        //            //push到用户
        //            var _content;
        //            if(value_door==1){
        //                _content='门磁打开'
        //            }
        //            if(value_door==0){
        //                _content ='门磁关闭'
        //            }
        //            if(double!=value_door){
        //                jishu++;
        //                console.log('门磁统计次数为  '+jishu);
        //                Sense.localCreateRaw(criteria_door, function (err, result) {
        //                    console.log(result)
        //                });
        //                double = value_door;
        //                var criteria = {
        //                    type: 'door',
        //                    value: value_door,
        //                    to: doc.home.user
        //                };
        //                var _json = {
        //                    seq :_doorcer+'$$$',
        //                    message : criteria
        //                }
        //                return cb(null,_json)
        //            }
        //
        //        })
        //}
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
            //client.write(d+'$$$');
            return cb(null,d+'$$$');
        }
        //窗帘上电
        if (c.command == '4d72') {
            var curtain_para = c.para.substring(0, 2);
            var certia_curtain = {
                type: 'command',
                gatewayId: gatewayId,
                data: {
                    addr: deviceId,
                    command: '4d61',
                    para: curtain_para
                },
                method: 'huanten'
            };
            var write_crutain = JSON.stringify(certia_curtain);
            //client.write(write_crutain+'$$$');
            return cb(null,write_crutain+'$$$');
        }
        //窗帘位置汇报
        if (c.command == '4d64') {
            var curtain_loca = c.para.substring(0, 2);
            var curtain_seq = c.para.substring(2, 4);
            var curtain_on = c.para.substring(12, 14);
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
                //client.write(loca_crutai+'$$$');
                return cb(null,loca_crutai+'$$$');
            } else {
                //记录窗帘state
                //02转为2
                if (curtain_on.substring(0, 1) == 0) {
                    curtain_on = parseInt(curtain_on.substring(1, 2), 16);
                }
                Device.findOneAndUpdate({mac: deviceId}, {$set:{
                    state: {
                        'curtain': curtain_on
                    }}
                }, function (err, doc) {
                    if(err){
                        //return client.write('the curtain is not exist');
                        return cb(null,'the curtain is not exist');
                    }else if(!doc){
                        //return client.write('the curtain is not exist');
                        return cb(null,'the curtain is not exist');
                    }
                    console.log('curtain state success');
                })
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
                //client.write(curtain__on+'$$$');
                return cb(null,curtain__on+'$$$');
            }
        }

    }
}

//自动填充方法，如pad（num，4）表示num不足4位时，自动在num前面填充0，补足四位
function pad(num, n) {
    var i = (num + "").length;
    while(i++ < n) num = "0" + num;
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