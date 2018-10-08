var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var SceneSchema = new Schema({
    name: String,
    user: {type: Schema.ObjectId, ref: 'User'},
    type: Number,    //1：手动模式 2：自动情景模式
    executeTime: Date,
    repeat: [],
    autorun: Boolean,    //是否按照executeTime和repeat自动触发。
    commands: [{
        device: {type: Schema.ObjectId, ref: 'Device'},
        command: String
    }],
    createdTime: Date,
    updatedTime: Date
});

SceneSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

SceneSchema.index({home: 1});
SceneSchema.index({home: 1, name: 1});
mongoose.model('Scene', SceneSchema);