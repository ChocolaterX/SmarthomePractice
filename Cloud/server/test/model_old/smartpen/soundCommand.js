/**
 * Created by pjf on 2017-3-30.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var soundCommandSchema = new Schema({
    soundName: String,                           //关键字名称
    keyword: String,                             //关键字内容
    category:Number,                             //操作对应的设备类型(待定)
    command :String,                             //详细操作命令
    belong:	Number,		                        //当此字段值为0时，代表此语音操作关键字为默认操作关键字，所有用户均可使用此操作关键字；
                                                //当此字段的值为1时，代表此语音操作关键字为用户自定义添加的关键字
    smartpen: {type:Schema.ObjectId,ref:'SmartPen'}, //语音关键字所属的smartpenId；如果该关键字是默认语音操作关键字则此值为空
    user: {type: Schema.ObjectId, ref: 'User'},      //语音关键字所属的用户Id；如果该关键字是默认语音操作关键字则此值为空

    removed:Boolean,
    createdTime: Date,
    updatedTime: Date


});
soundCommandSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

soundCommandSchema.index({createdTime: -1});


mongoose.model('SoundCommand', soundCommandSchema);