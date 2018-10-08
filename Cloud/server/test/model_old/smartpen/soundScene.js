/**
 * Created by pjf on 2017-3-30.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;
var soundSceneSchema = new Schema({
    soundName: String,		//关键字名称

    scene: {type:Schema.ObjectId,ref:'Scene'},		//Ref Scene，语音关键字绑定的情景模式ID：2为智能窗帘，3为智能灯泡，7为智能墙面开关；

    home: {type:Schema.ObjectId,ref:'Home'}, 	//Ref Home，语音关键字所属的用户家庭Id；如果该关键字是默认语音操作关键字则此值为空
    createdTime: Date,       //in minute
    updatedTime: Date,      //in milliseconds
    removed: Boolean


});
soundSceneSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

soundSceneSchema.index({createdTime: -1});


mongoose.model('SoundScene', soundSceneSchema);