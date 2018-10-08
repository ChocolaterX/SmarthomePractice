/**
 * Created by liyang on 2015-9-2.
 */
var mongoose = require('../../../../cloud_db_connect');
var Sense = require('../../../sense/sense');
var Scene =require('../../../scene/scene');
var Gateway = require('../../gateway');
var Device = mongoose.model('Device');
var log4j = require('log4js').getLogger();

exports.handle = function(parameter,cb){
    log4j.info('commandHandle:'+parameter+typeof(parameter));
    log4j.info('commandHandle _json:'+parameter._json+typeof(parameter._json));
    //var _json = JSON.parse(req.body._json);
    var _json = JSON.parse(parameter._json);
    //var value = req.body.value;
    var value = parameter.value;
    var method = _json.method;
    var　deviceId = _json.data.addr;

    if (method == 'huanten') {
        //状态确认
        if (_json.data.command == '6173') {
            log4j.info('收到灯泡！！！！！！！')
            var lightOn = value.lightOn;
            var intensity = value.intensity;
            var hue = value.hue;
            Gateway.command(_json.gatewayId,JSON.stringify(_json));
            Device.findOneAndUpdate({mac: _json.data.addr}, {$set:{
                state: {
                    'on': lightOn,
                    'intensity': intensity,
                    'hue': hue
                }}
            }, function (err, doc) {
                if(err){
                   return cb(err,null);

                }else if(!doc){
                    return cb(null,{message:'no device in db'});
                }
                log4j.info('灯泡状态确认完毕');

                return cb(null,{errorCode:0});
            })

        }
        //便携开关状态
        if(_json.data.command == '7370'){
            var　deviceId = _json.data.addr;
            log4j.info('便携开关：'+deviceId);
            Device.findOne({mac:deviceId},function(err,doc){
                if(err){

                    return cb(err,null);
                }else if(!doc){

                    return cb(null,{message:'no device in db'});
                }
                if(doc.extend&&doc.extend.short&&doc.extend.short!==''){
                    var senceId = doc.extend.short;
                    Scene.localrun(senceId,function(err_in,doc_in){
                        if(doc_in=='error'){
                            //return client.write('localrun is failure')
                            //return res.json({
                            //    message:'no scene in db'
                            //})
                            return cb(null,{message:'no scene in db'});
                        }else{
                            //return res.json({
                            //    errorCode:0
                            //})
                            return cb(null,{errorCode:0})
                        }
                    })
                }else{
                    //return res.json({
                    //    errorCode:0
                    //})
                    return cb(null,{errorCode:0});
                }

            })
        }
        if(_json.data.command == '6c70'){
            var　deviceId = _json.data.addr;
            Device.findOne({mac:deviceId},function(err,doc){
                if(err){
                    //return res.json({
                    //    errorCode:500,
                    //    message:err.message
                    //})
                    return cb(err,null);
                }else if(!doc){
                    //return client.write('the Portable switch is not exist')
                    //return res.json({
                    //    message:'no device in db'
                    //})
                    return cb(null,{message:'no device in db'})
                }
                if(doc.extend&&doc.extend.long&&doc.extend.long!==''){
                    var senceId = doc.extend.long;
                    Scene.localrun(senceId,function(err_in,doc_in){
                        if(doc_in=='error'){
                            //return res.json({
                            //    message:'no scene in db'
                            //})
                            return cb(null,{message:'no scene in db'})
                        }else{
                            //return res.json({
                            //    errorCode:0
                            //})
                            return cb(null,{errorCode:0});
                        }
                    })
                }else{
                    //return res.json({
                    //    errorCode:0
                    //})
                    return cb(null,{errorCode:0});
                }

            })
        }
        //智能开关状态确认
        if(_json.data.command == '7273'){
            var　deviceId = _json.data.addr;
            var isOn = value.value;
            _json.data.command = '6173';
            log4j.info('收到智能开关-----');
            Gateway.command(_json.gatewayId,JSON.stringify(_json));
            //状态录入数据库
            Device.findOneAndUpdate({mac: deviceId}, {'state.button':isOn},function (err, doc) {
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
                //return res.json({
                //    errorCode:0
                //})
                return cb(null,{errorCode:0});
            })
        }
        //询问时间
        if (_json.data.command == '6174') {
            Gateway.command(_json.gatewayId,JSON.stringify(_json));
            //return res.json({
            //    errorCode:0
            //})
            return cb(null,{errorCode:0});
        }
        //窗帘位置汇报
        if (_json.data.command == '4d61') {
            var curtain_loca = value.curtain_loca;
            var curtain_seq = value.curtain_seq;
            var curtain_on = value.curtain_on;
            //状态不为50时回复
            if (curtain_loca != '50') {
                Gateway.command(_json.gatewayId,JSON.stringify(_json));
                //return res.json({
                //    errorCode:0
                //})
                return cb(null,{errorCode:0});
            } else {
                //记录窗帘state
                //02转为2
                Device.findOneAndUpdate({mac: deviceId}, {$set:{
                    state: {
                        'curtain': curtain_on
                    }}
                }, function (err, doc) {
                    if(err){
                        //return res.json({
                        //    errorCode:500,
                        //    message:err.message
                        //})
                        return cb(err,null);
                    }else if(!doc){
                        //return client.write('the curtain is not exist');
                        //return res.json({
                        //    message:'no device in db'
                        //})
                        return cb(null,{message:'no device in db'});
                    }
                })
                //回复
                Gateway.command(_json.gatewayId,JSON.stringify(_json));
                //return res.json({
                //    errorCode:0
                //})
                return cb(null,{errorCode:0});

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