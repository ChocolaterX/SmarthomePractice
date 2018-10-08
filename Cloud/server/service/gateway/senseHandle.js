/**
 * Created by liyang on 2015-8-19.
 */
var mongoose = require('../../cloud_db_connect');
var Sense = require('../sense/sense');
var Entrance = require('../entrance/entrance');
var Device = mongoose.model('Device');
var Gateway = require('./gateway');
var jishu=0;
var double = 3;

exports.handle = function(ack,cb){
    var c = ack.data;
    var gatewayId = ack.gatewayId;
    var deviceId = c.addr;
    var value = c.values;
    var type = c.type;
    if(c.type == 'sushi'){
        //console.log(c);
        var seq = c.values.substring(0, 2);
        // console.log(seq);
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
        var value_door = pad((parseInt((c.values.substring(2, 3)).toString(16),16).toString(2)),4).substring(0, 1);

        Device.findOneAndUpdate({mac: deviceId}, {$set:{
            state: {
                'door': value_door
            }}
        })
            .populate('home', 'user')
            .exec(function (err, doc) {
                if(err){
                    return cb(null,'the door magnet is not exist');
                }else if(!doc){
                    return cb(null,'the door magnet is not exist');
                }
                var doorId = doc._id;
                //添加到sense
                var criteria_door = {
                    type: 'door',
                    value: value_door,
                    deviceId: doorId
                };
                //回复指令
                Gateway.command(gatewayId,_doorcer);

                //push到用户
                var _content;
                if(value_door==1){
                    _content='门磁打开'
                }
                if(value_door==0){
                    _content ='门磁关闭'
                }
                if(double!=value_door){
                    jishu++;
                    console.log('门磁统计次数为  '+jishu);
                    Entrance.localCreate(criteria_door, function (err, result) {
                        console.log(result)
                    });
                    double = value_door;
                    var criteria = {
                        type: 'door',
                        value: value_door,
                        to: doc.home.user
                    };
                    var _json = {
                        seq :_doorcer+'$$$',
                        message : criteria
                    }
                    return cb(null,criteria)
                }

            })
    }else{
        var criteria = {
            type: type,
            value: value,
            deviceId: deviceId
        };
        //call sense.create
        Sense.localCreate(criteria, function (err, result) {
            return cb(null,criteria);
        })
    }
}

function pad(num, n) {
    var i = (num + "").length;
    while(i++ < n) num = "0" + num;
    return num;
}