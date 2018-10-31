// var config = require('../../../config/config');
var mongoose = require('../db_connect');
// var crypto = require('crypto');
var Schema = mongoose.Schema;

var controlDeviceSchema = new Schema({
    name: String,        //设备名称，管理员添加设备时该字段可为空
    type: Number,       //0:网关，1：窗帘，2：插座；3：开关；
    mac: String,   //物理地址
    addedTime: Date, //认证时间
    user: {type: Schema.ObjectId, ref: 'User'}, //如果为null，则表示为尚未被注册使用。
    //gateway: {type: Schema.ObjectId, ref: 'Device'},
    //region: {type: Schema.ObjectId, ref: 'Region'},    //区域
    //showComponent: Boolean,
    createdTime: Date, //创建时间
    updatedTime: Date,  //最后一次更新时间
    state: String   //设备的当前状态，根据不同的设备state里面的字段不一样  备注：设备认证时必须给予对应设备的初始状态
});

controlDeviceSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

// controlDeviceSchema.index({mac: 1, createdTime: -1});

// mongoose.model('ControlDevice', controlDeviceSchema);

module.exports = mongoose.model('ControlDevice', controlDeviceSchema);