// var config = require('../../../config/config');
var mongoose = require('../db_connect');
// var crypto = require('crypto');
var Schema = mongoose.Schema;

var securityDeviceSchema = new Schema({
    name: String,       //设备名称，管理员添加设备时该字段可为空
    type: Number,       //1：门磁，2：红外感应；3：门锁；4：摄像头
    mac: String,        //物理地址
    addedTime: Date,    //认证时间
    user: {type: Schema.ObjectId, ref: 'User'}, //如果为null，则表示为尚未被注册使用。
    //gateway: {type: Schema.ObjectId, ref: 'Device'},
    //showComponent: Boolean,
    createdTime: Date, //创建时间
    updatedTime: Date,  //最后一次更新时间
    state: String   //设备的当前状态，根据不同的设备state里面的字段不一样  备注：设备认证时必须给予对应设备的初始状态
});

securityDeviceSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

// securityDeviceSchema.index({mac: 1, createdTime: -1});

// mongoose.model('securityDevice', securityDeviceSchema);

module.exports = mongoose.model('securityDevice', securityDeviceSchema);