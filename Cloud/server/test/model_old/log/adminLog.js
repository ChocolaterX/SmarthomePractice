/**
 * Created by pjf on 2017-3-30.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;


var adminLogSchema = new Schema({
    admin: {type: Schema.ObjectId, ref: 'Admin'},
    url: String,
    type: Number,                                      //区分控制方法和非控制方法
    content: String,                                 //实际用户操作的内容
    errorCode: String,
    createdTime: Date
});


adminLogSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    next();
});

//adminLogSchema.statics = {
////日志的录入
//    log: function (content) {
//        this.create(content, function (err, log) {
//        });
//    }
//};

adminLogSchema.index({errorCode: 1, url: 1, createTime: -1});

mongoose.model('AdminLog', adminLogSchema);
