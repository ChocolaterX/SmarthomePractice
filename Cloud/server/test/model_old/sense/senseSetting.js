

/**
 * Created by pjf on 2017-3-30.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var senseSettingSchema = new Schema({
    user : {type:Schema.ObjectId,ref:'User'},
    type: Number,                 // 1 温度，2湿度，3空气质量，4光照，5烟雾
    sensor : {type:Schema.ObjectId,ref:'Sensor'},
    value: Number,
    condition: Boolean,  //true代表大于，false代表小于
    send: Boolean,
    sendStartTime: Number,//Date,
    sendEndTime: Number,//Date,
    createdTime: Date,
    updatedTime: Date
});
senseSettingSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

senseSettingSchema.index({sendStartTime:-1,device:1});

mongoose.model('SenseSetting', senseSettingSchema);