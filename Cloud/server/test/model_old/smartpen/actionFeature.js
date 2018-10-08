/**
 * Created by pjf on 2017-3-29.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var actionFeatureSchema = new Schema({
    description: String,            //行为说明/行为名称
    feature:{},                     //行为特征  加速度的三轴分别是：aX, aY,aZ; 陀螺仪的三轴分别是：gX, gY,gZ
    createdTime: Date,       //in minute
    updatedTime: Date,      //in milliseconds
    removed:Boolean


});
actionFeatureSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});


actionFeatureSchema.index({createdTime:-1});


mongoose.model('ActionFeature', actionFeatureSchema);