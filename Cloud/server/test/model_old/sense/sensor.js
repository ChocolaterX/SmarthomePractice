/**
 * Created by pjf on 2017-3-30.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var sensorSchema = new Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    interfaceType: Number,    //设备接口类型,  例如：串口；zigbee
    type:Number,             //传感器类型              1 温度，2湿度，3空气质量，4光照，5烟雾
    mac: String,
    name: String,           //传感器的名称
    createdTime: Date,
    updatedTime: Date
});

sensorSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});


sensorSchema.index({serverTime:-1,interfaceType:1,device:1});

mongoose.model('Sensor', sensorSchema);