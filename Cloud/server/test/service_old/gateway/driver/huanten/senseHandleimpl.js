/**
 * Created by liyang on 2015-8-19.
 */
var mongoose = require('../../../../cloud_db_connect');
var Sense = require('../../../sense/sense');
var Message = require('../../../message/message');
var Entrance = require('../../../entrance/entrance');
var Device = mongoose.model('Device');
var Sensor = mongoose.model('Sensor');
var SenseSetting = mongoose.model('SenseSetting');
var Gateway = require('../../gateway');
var double = 3;
var log4j = require('log4js').getLogger();

exports.handle = function(parameter,cb){
    //var _json = JSON.parse(req.body._json);
    var _json = JSON.parse(parameter._json);
    //var value = req.body.value;
    var value = parameter.value;
    var value_door = value.value_door;
    if(_json.method=='huanten'){

        log4j.info('method:huanteng, sushi data!');

        Device.findOneAndUpdate({mac: _json.data.addr}, {$set:{
            state: {
                'door': value_door
            }}
        })
            .populate('home', 'user')
            .exec(function (err, doc) {
                if(err){
                    //return res.json({
                    //    errorCode:500,
                    //    message:err.message
                    //})
                    return cb(err,null);
                }else if(!doc){
                    //return res.json({
                    //    message:'no device in db'
                    //})
                    return cb(null,{message:'no device in db'});
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
                    Entrance.localCreate(criteria_door, function (err, result) {
                        log4j.info('sushi data create successfully:'+result);
                    });
                    double = value_door;
                    //return res.json({
                    //    errorCode:0
                    //})
                    return cb(null,{errorCode:0});
                }

            })
    }else if(_json.method=='sense'){
        log4j.info('method:sense, sense data!');
        var criteria = {
            type: value.type,
            value: value.value,
            deviceId: value.sensorId
        };



        pushSenseSetting(value.type, value.value, value.sensorId);


        Sense.localCreate(criteria, function (err, result) {
            //return res.json({
            //    errorCode:0
            //})
            if(err){
                return cb(err,null);
            }
            log4j.info('sense data create successfully:'+result);
            return cb(null, {errorCode:0});
        })
    }
}

function pad(num, n) {
    var i = (num + "").length;
    while(i++ < n) num = "0" + num;
    return num;
}







//根据感应器报警执行推送
function pushSenseSetting(type, value, sensorId, cb) {


    async.waterfall([

        //查询感应器所属用户
        function (callback) {
            Sensor.findOne({_id: sensorId}, function (err, result) {

                if (err) {
                    return cb(err)
                } else if (!result) {
                    return cb(null, '该感应器不存在')
                } else {
                    var userId = result.user;
                    callback(null, userId);
                }

            })

        },


        //查询该家庭是否有感知数据报警
        function (userId, callback) {

            var senseSettingTemp = {
                user: userId
            };

            //type 1 温度，2湿度，3空气质量，4光照，5烟雾
            var pushType;
            if (type == 'temperature') {
                senseSettingTemp['type'] = 1;
                pushType='湿度'
            } else if (type == 'humidity') {
                senseSettingTemp['type'] = 2;
                pushType='温度'
            } else if (type == 'air') {
                senseSettingTemp['type'] = 3;
                pushType='空气质量'
            } else if (type == 'smoke') {
                senseSettingTemp['type'] = 4;
                pushType='光照'
            } else if (type == 'illumination') {
                senseSettingTemp['type'] = 5;
                pushType='烟雾'
            } else {
                return cb(null, '传感数据类型不正确')

            }
            console.log('===============senseSettingTemp===================')
            console.log(senseSettingTemp)
            console.log('===============senseSettingTemp===================')

            SenseSetting.find(senseSettingTemp, function (err, senseSetting) {
                if (err) {
                    return cb(err)
                } else if (senseSetting.length > 0) {
                    for (var i = 0; i < senseSetting.length; i++) {
                        //先判断是否执行
                        if (senseSetting[i].send) {
                            //判断设定的是大于还是小于

                             var content;
                            //condition为true=大于,且实际值大于设定值----执行
                            if (senseSetting[i].condition && value > senseSetting[i].value) {
                                content=pushType+'大于'+senseSetting[i].value;
                                Message.senseLocalCreate(userId,content);

                                callback();
                            }
                            //condition为false=小于,且实际值小于设定值----执行

                            if (!senseSetting[i].condition && value < senseSetting[i].value) {
                                content=pushType+'小于'+senseSetting[i].value;
                                Message.senseLocalCreate(userId,content);


                                callback();
                            }
                        }

                        else {
                            callback();
                        }
                    }

                } else {
                    callback();


                }
            })

        },


    ], function (callback) {
        return cb(null,{errorCode:0});
    });


}
//根据感应器报警执行设备（保留，未完成）
function runSenseSetting(type, value, gatewayId, cb) {


    async.waterfall([

        //查询网关所属家庭
        function (callback) {
            Sensor.findOne({_id: gatewayId}, function (err, result) {

                if (err) {
                    return cb(err)
                } else if (!result) {
                    return cb(null, '该网关不存在')
                } else {
                    var homeId = result.home
                    callback(null, homeId);
                }

            })

        },


        //查询该家庭是否有感知数据报警
        function (homeId, callback) {

            var senseSettingTemp = {
                home: homeId
            };

            //type 1 温度，2湿度，3空气质量，4 CO2

            if (type == 'temperature') {
                senseSettingTemp['type'] = 1
            } else if (type == 'humidity') {
                senseSettingTemp['type'] = 2
            } else if (type == 'gasdetection') {
                senseSettingTemp['type'] = 3
            } else if (type == 'co2') {
                senseSettingTemp['type'] = 4
            } else {
                return cb(null, '传感数据类型不正确')

            }
            console.log('===============senseSettingTemp===================')
            console.log(senseSettingTemp)
            console.log('===============senseSettingTemp===================')

            SenseSetting.find(senseSettingTemp, function (err, senseSetting) {
                if (err) {
                    return cb(err)
                } else if (senseSetting.length > 0) {
                    for (var i = 0; i < senseSetting.length; i++) {
                        //先判断是否执行
                        if (senseSetting[i].send) {
                            //判断设定的是大于还是小于


                            //condition为true=大于,且实际值大于设定值----执行
                            if (senseSetting[i].condition || value > senseSetting[i].value) {

                                if (senseSetting[i].deviceReal.length > 0) {
                                    runDeviceReal(senseSetting[i]);
                                }




                                callback();
                            }
                            //condition为false=小于,且实际值小于设定值----执行

                            if (!senseSetting[i].condition || value < senseSetting[i].value) {

                                if (senseSetting[i].deviceReal.length > 0) {
                                    runDeviceReal(senseSetting[i]);
                                }

                                callback();
                            }
                        }

                        else {
                            callback();
                        }
                    }

                } else {
                    callback();


                }
            })

        },


    ], function (callback) {
        return cb
    });


}
function runDeviceReal(senseSetting) {
    var deviceId;
    var command;

    var i = -1;

    function run() {
        i++;
        if (i < senseSetting.deviceReal.length)

            setTimeout(function () {
                deviceId = senseSetting.deviceReal[i].device;
                command = senseSetting.deviceReal[i].command;

                DeviceList.findById(deviceId)
                    .populate('meta', 'category')
                    .exec(function (err, result) {
                        if (err) {
                            //return cb(err)
                        } else {
                            var command_array = [];
                            var category = result.meta.category;

                            //智能开关command为“100，010，001”，需拆分为数组
                            if (category == 7) {
                                command_array = command.split(',');


                                for (var i = 0; i < command_array.length; i++) {
                                    Command.commandScene(command_array[i], deviceId);
                                }
                            }
                            else {
                                Command.commandScene(command, deviceId);
                            }
                        }

                    })

                run()
            }, 500);
    }

    run()
}

