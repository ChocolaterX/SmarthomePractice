/**
 * Created by pjf on 2017-3-30.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var entranceSettingSchema = new Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    send: Boolean,
    sendStartTime: Date,
    sendEndTime: Date
});


entranceSettingSchema.index({sendStartTime:-1,device:1});

mongoose.model('EntranceSetting', entranceSettingSchema);

