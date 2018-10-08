var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var deviceSchema = new Schema({
    name: String,        //设备名称，管理员添加设备时该字段可为空
    type: Number,       //1为智能灯泡，2为智能窗帘，3为智能开关
    mac: String,   //物理地址地址
    addedTime: Date, //认证时间
    //user: {type: Schema.ObjectId, ref: 'User'}, //如果为null，则表示为尚未被注册使用。
    createdTime: Date, //创建时间
    updatedTime: Date,  //最后一次更新时间
    state: {}   //设备的当前状态，根据不同的设备state里面的字段不一样，
                // 设备为灯泡时：{on：（0表示关，1表示开）intensity（0-255）：hue：（0-255）};
                //设备为窗帘时，{curtain:(0-15)};
                //设备为智能开关时,{button:(0表示关，1表示开)}
                //备注：设备认证时必须给予对应设备的初始状态
});

deviceSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

deviceSchema.index({mac: 1, createdTime: -1});

mongoose.model('Device', deviceSchema);