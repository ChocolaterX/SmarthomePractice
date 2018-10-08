var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var gatewaySchema = new Schema({
    name: String,        //设备名称，管理员添加设备时该字段可为空
    mac: String,   //物理地址
    password: String,  //设备网关密码，目前只支持网关
    addedTime: Date, //添加到家庭的时间
    user: {type: Schema.ObjectId, ref: 'User'},      //所属用户
    createdTime: Date, //管理员添加该设备的时间
    updatedTime: Date  //最后一次更新时间
});

gatewaySchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

gatewaySchema.index({mac: 1, createdTime: -1});

mongoose.model('Gateway', gatewaySchema);





