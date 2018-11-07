// var config = require('../../../config/config');
var mongoose = require('../db_connect');
// var crypto = require('crypto');
var Schema = mongoose.Schema;

var sceneSchema = new Schema({
    name: String,
    user: {type: Schema.ObjectId, ref: 'User'},
    // type: Number,    //1：手动模式 2：自动情景模式
    // executeTime: Date,
    // repeat: [],
    // autorun: Boolean,    //是否按照executeTime和repeat自动触发。
    commands: [{
        device: {type: Schema.ObjectId, ref: 'ControlDevice'},
        command: String
    }],
    showComponent: Boolean,
    createdTime: Date,
    updatedTime: Date
});

sceneSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

// controlDeviceSchema.index({mac: 1, createdTime: -1});

// mongoose.model('ControlDevice', sceneSchema);

module.exports = mongoose.model('Scene', sceneSchema);