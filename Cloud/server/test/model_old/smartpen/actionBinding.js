/**
 * Created by pjf on 2017-3-29.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var actionBindingSchema = new Schema({
    user: {type:Schema.ObjectId,ref:'User'},
    action: {type:Schema.ObjectId,ref:'ActionFeature'},
    bindType:Number,                                         //1代表设备控制，2代表情景模式
    device: {type:Schema.ObjectId,ref:'Device'},
    deviceCommand:String,                                     //设备操作命令
    scene : {type:Schema.ObjectId,ref:'Scene'},               //情景模式ID
    removed:Boolean,
    createdTime: Date,
    updatedTime: Date

});

actionBindingSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

actionBindingSchema.index({createdTime: -1});

mongoose.model('ActionBinding', actionBindingSchema);