/**
 * Created by Administrator on 2017-3-30.
 */
/**
 * Created by pjf on 2017-4-17.
 */
var mongoose = require('../../cloud_db_connect');

var User = mongoose.model('User');
var UserDevice = mongoose.model('UserDevice');
var Entrance = mongoose.model('Entrance');
var EntranceSetting = mongoose.model('EntranceSetting');

var log4j = require('log4js').getLogger();
var validator = require('validator');
var async = require('async');

//推送设置
exports.send = function (req,res) {
    var userId = req.user.current._id;




    var send=req.body.send;


    var sendStartTime = parseInt(req.body.sendStartTime, 10);
    var sendEndTime = parseInt(req.body.sendEndTime, 10);



    if (!userId) {
        return res.json({
            errorCode: 1305,
            message: '无法取得当前登录用户，请重新登录'
        });
    }



    var criteria={

    };


    if (send) {
        criteria['send']=send;

        if(!sendStartTime||!sendEndTime){
            return res.json({
                errorCode: 1300,
                message:'未设置开始或结束时间'
            });
        }else if(sendStartTime>=sendEndTime){
            return res.json({
                errorCode: 1300,
                message:'开始时间不得大于等于结束时间'
            });

        } else{
            criteria['sendStartTime']=sendStartTime;
            criteria['sendEndTime']=sendEndTime
        }

    }else{
        criteria['send']=send;
    }

    EntranceSetting.findOneAndUpdate({user:userId}, criteria,function (err, result) {
        if (err) {
            return res.json({
                errorCode: 500,
                message:err.message
            });
        }
        else if (!result) {
            return res.json({
                errorCode: 1500,
                message:'门磁推送关联不存在'
            });

        }
        else {
            return res.json({
                errorCode: 0,
                entranceSettingId:result._id
            });
        }
    });


}

//查看推送设置
exports.list = function (req,res) {
    var userId = req.user.current._id;


    if (!userId) {
        return res.json({
            errorCode: 1305,
            message: '无法取得当前登录用户，请重新登录'
        });
    }


    var criteria = {
        user: userId
    };

    EntranceSetting.findOne(criteria)
        .exec(function (err, result) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            } else if (!result) {
                return res.json({
                    errorCode: 1300,
                    message: "未找到门磁设备对应的推送设置"
                });
            } else {
                return res.json({
                    errorCode: 0,
                    result: result
                });
            }
        })
}
