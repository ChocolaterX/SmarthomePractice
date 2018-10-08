/**
 * Created by leizhang on 2015/8/5.
 */

var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    directUser: {type: Schema.ObjectId, ref: 'User'},  //消息目的地，个人id
    content: String,                                   //消息内容
    type: Number,                                      //区分推送消息的类型  温湿度，空气质量
    createdTime: Date                                  //消息创建时间
});

MessageSchema.pre('save', function(next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.lastUpdatedTime = Date.now();
    next();
});

MessageSchema.index({to:1});
MessageSchema.index({to:1,read:-1,lastUpdatedTime:-1});
mongoose.model('Message', MessageSchema);