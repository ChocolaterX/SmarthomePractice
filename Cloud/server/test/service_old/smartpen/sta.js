/**
 * Created by Jiang Suyang on 2016-11-18.
 */

var mongoose = require('../../cloud_db_connect');

//model文件
var smartPen = mongoose.model('SmartPen');




var log4j = require('log4js').getLogger();
var log = mongoose.model('Log');

var agenda = require('../../../lib/schedule');
//var Command = require('../device/command');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var config = require('../../../config/config');
var request = require('request');

exports.getList = function (req, res) {

    var homeId=req.user.current.home._id;
    
    smartPen.find({home:homeId},function (err, result) {
        if (err) {
            log4j.error(err);
            return res.json({
                errorCode: 500,
                messsage: err.message
            });
        } else {
            log4j.info('get smartPen list success');
            return res.json({
                errorCode: 0,
                smartpens: result
            });
        }
    });

}


exports.create = function (req, res) {

    var remark=req.body.remark;
    var password=req.body.password;
    var gatewayId=req.body.gatewayId;
    var homeId=req.user.current.home._id;

    if (!remark) {
        log4j.info('remark is empty.')
        return res.json({
            errorCode: 1801,
            message: '设备名为空。'
        })
    }

    if (!password) {
        log4j.info('password is empty.');
        return res.json({
            errorCode: 1802,
            message: '密码为空'
        });
    }
    if (!gatewayId) {
        log4j.info('gateway is empty.');
        return res.json({
            errorCode: 1803,
            message: '网关为空'
        });
    }
    if (!homeId) {
        log4j.info('home is empty.')
        return res.json({
            errorCode: 1804,
            message: '家庭为空。'
        })
    }



    var criteria = {
        remark: remark,
        password: password ,
        gateway: gatewayId,
        home:homeId ,
        createdTime:Date.now(),
        updateTime:Date.now(),
        removed: false,
    };
    smartPen.create(criteria, function (err, result) {
        if (err) {
            log4j.error(err);
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }else{
            return res.json({
                errorCode: 0,

            });
        }

    })

};


exports.update = function (req, res) {
var smartpenId=req.body.smartpenId;
    var remark=req.body.remark;
    var password=req.body.password;
    var criteria={};

    if(remark){
        criteria['remark']=remark;
    }

    if(password){
        criteria['password']=password;
    }

    smartPen.findOneAndUpdate({_id:smartpenId},criteria,null,function(err,results){
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        } else{
            return res.json({
                errorCode: 0,

            });
        }

    })

}

exports.delete = function (req, res) {
    var smartpenId=req.body.smartpenId;

    smartPen.count({_id:smartpenId}, function (err, count) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
        if (count < 0) {
            return res.json({
                errorCode: 1805,
                message: '智能笔不存在'
            });
        } else {

            smartPen.update({_id:smartpenId}, {$set: {removed: true}},function (err) {
                if (err) {
                    log4j.error('it fails to delete smartpen');
                    log4j.error(err);
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                else {
                    log4j.info('delete smartpen success');

                            return res.json({

                                errorCode: 0
                            });

                }
            });
        }
    });
}


