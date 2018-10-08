/**
 * Created by pjf on 2017-3-30.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var regionSchema = new Schema({
    name: String,
    user: {type: Schema.ObjectId, ref: 'User'},
    order: Number,         //排列顺序
    createdTime: Date,
    updatedTime: Date
});

regionSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});


regionSchema.index({createdTime: -1, updatedTime: -1});

mongoose.model('Region', regionSchema);
