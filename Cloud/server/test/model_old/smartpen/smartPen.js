/**
 * Created by pjf on 2016-11-15.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var smartPenSchema = new Schema({
    smartpenName: String,             //识别ID
    password:String,
    gateway:{type:Schema.ObjectId,ref:'Device'},          //对应网关ID
    user: {type: Schema.ObjectId, ref:'User'},
    createdTime: Date,       //in minute
    updatedTime: Date,      //in milliseconds
    removed:Boolean


});
smartPenSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});


smartPenSchema.index({createdTime:-1,gateway:1});


mongoose.model('SmartPen', smartPenSchema);
