/**
 * <copyright file="soundKeyword.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>2/22/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var soundKeywordSchema = new Schema({
    keyword: String,
    user: {type: Schema.ObjectId, ref:'User'},
    type: Number,           //1:设备控制，2：情景模式，3：红外控制
    device: {type: Schema.ObjectId, ref:'Device'},
    command: String,
    scene: {type: Schema.ObjectId, ref:'Scene'},
    infraredCommand: {type: Schema.ObjectId, ref: 'InfraredCommand'},
    createdTime: Date, 	//创建时间
    updatedTime: Date  //更新时间
});

soundKeywordSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

soundKeywordSchema.index({createdTime: -1});

mongoose.model('SoundKeyword', soundKeywordSchema);

