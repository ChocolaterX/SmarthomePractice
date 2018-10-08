/**
 * Created by pjf on 2017-3-30.
 */

var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;


var userDeviceSchema = new Schema({
    device: {type: Schema.ObjectId, ref: 'Device'},
    user: {type: Schema.ObjectId, ref: 'User'},
    gateway: {type: Schema.ObjectId, ref: 'Gateway'},
    region: {type: Schema.ObjectId, ref: 'Region'},    //区域
    createdTime: Date,
    updatedTime: Date
});

userDeviceSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

userDeviceSchema.index({createdTime: -1, device: 1});

mongoose.model('UserDevice', userDeviceSchema);