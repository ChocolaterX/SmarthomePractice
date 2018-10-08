/**
 * <copyright file="scene.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>12/6/2017</date>
 * <summary>
 *  。
 * </summary>
 */

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
    showComponent: Boolean,
    createdTime: Date,
    updatedTime: Date
});

SceneSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

SceneSchema.index({user: 1});
//SceneSchema.index({home: 1, name: 1});
mongoose.model('Scene', SceneSchema);