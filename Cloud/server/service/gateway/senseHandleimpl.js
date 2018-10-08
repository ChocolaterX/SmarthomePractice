/**
 * Created by liyang on 2015-8-19.
 */
var mongoose = require('../../cloud_db_connect');
var Sense = require('../sense/sense');
var Device = mongoose.model('Device');
var Gateway = require('./gateway');
var double = 3;

exports.handle = function(req,res){
    var _json = JSON.parse(req.body._json);
    var value = req.body.value;
    var value_door = value.value_door;
    if(_json.method=='huanten'){

        Device.findOneAndUpdate({mac: _json.data.addr}, {$set:{
            state: {
                'door': value_door
            }}
        })
            .populate('home', 'user')
            .exec(function (err, doc) {
                if(err){
                    return res.json({
                        errorCode:500,
                        message:err.message
                    })
                }else if(!doc){
                    return res.json({
                        message:'no device in db'
                    })
                }
                var doorId = doc._id;
                //添加到sense
                var criteria_door = {
                    type: 'door',
                    value: value_door,
                    deviceId: doorId
                };
                //回复指令
                Gateway.command(_json.gatewayId,JSON.stringify(_json));
                if(double!=value_door){
                    Sense.localCreateRaw(criteria_door, function (err, result) {
                        console.log(result)
                    });
                    double = value_door;
                    return res.json({
                        errorCode:0
                    })
                }

            })
    }else if(_json.method=='sense'){
        var criteria = {
            type: value.type,
            value: value.value,
            deviceId: value.deviceId
        };
        //call sense.create
        Sense.localCreate(criteria, function (err, result) {
            return res.json({
                errorCode:0
            })
        })
    }
}

function pad(num, n) {
    var i = (num + "").length;
    while(i++ < n) num = "0" + num;
    return num;
}