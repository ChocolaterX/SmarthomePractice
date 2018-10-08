/**
 * Created by pjf on 2017-3-30.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var soundDeviceSchema = new Schema({
    soundName: String,                           //关键字名称
    keyword: String,                             //关键字内容
    category:Number,                             //操作对应的设备类型(待定)
    device: {type:Schema.ObjectId,ref:'Device'}, //即该关键字绑定的设备ID
    smartpen: {type:Schema.ObjectId,ref:'SmartPen'}, //语音关键字所属的smartpenId；如果该关键字是默认语音操作关键字则此值为空
    user: {type: Schema.ObjectId, ref: 'User'},      //语音关键字所属的用户Id；如果该关键字是默认语音操作关键字则此值为空
    removed:Boolean,
    createdTime: Date,
    updatedTime: Date


});

soundDeviceSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});
soundDeviceSchema.index({createdTime: -1});


mongoose.model('SoundDevice', soundDeviceSchema);