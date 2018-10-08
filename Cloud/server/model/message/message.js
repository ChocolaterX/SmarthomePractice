/**
 * Created by leizhang on 2015/8/5.
 */

var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    to: {type: Schema.ObjectId, ref: 'User'}, //消息目的地
    content: String, //消息内容
    read: Boolean, //是否已读
    performed: {type: String, default: ''},//操作过的action.name
    removed: Boolean, //是否删除
    readTime:{type: Date}, //读取时间
    actions: [{	//动作数组
        name: String, //动作名称
        url: String, //动作执行的地址
        method: String,//发送请求的地址
        parameters: String //参数，json形式。
    }],
    createdTime: {type: Date}, //消息创建时间
    lastUpdatedTime: {type: Date}
});

MessageSchema.pre('save', function(next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.lastUpdatedTime = Date.now();
    next();
});

MessageSchema.index({to:1});
MessageSchema.index({to:1,read:-1,lastUpdatedTime:-1});
mongoose.model('Message', MessageSchema);