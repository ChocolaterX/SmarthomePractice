/**
 * Created by leizhang on 2015/5/18.
 */

var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;


var userLogSchema = new Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    url: String,
    type: Number,                                      //区分控制方法和非控制方法
    device: {type: Schema.ObjectId, ref: 'Device'},     //涉及到操作设备时有deviceId，不涉及时没有
    deviceCommand: String,
    errorCode: String,
    content: String,                                 //实际用户操作的内容  userName+将+device.name+调节到+deviceCommand
    createdTime: Date
});

userLogSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    next();
});

//userLogSchema.statics = {
////日志的录入
//    log: function (content) {
//        this.create(content, function (err, log) {
//        });
//    }
//};

userLogSchema.index({deviceId: 1, createTime: -1});

mongoose.model('UserLog', userLogSchema);



