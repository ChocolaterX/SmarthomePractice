/**
 * Created by pjf on 2017-3-30.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var illuminationSchema = new Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    sensor : {type:Schema.ObjectId,ref:'Sensor'},

    value: Number,
    createdTime: Date
});

illuminationSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

illuminationSchema.index({serverTime:-1,interfaceType:1,device:1});

mongoose.model('Illumination', illuminationSchema);