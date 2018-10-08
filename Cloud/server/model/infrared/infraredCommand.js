/**
 * <copyright file="infraredCommand.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>4/2/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var infraredCommandSchema = new Schema({
    name: String,           //命令命名
    command: String,        //红外命令内容
    telecontroller: {type: Schema.ObjectId, ref: 'Telecontroller'},
    user: {type: Schema.ObjectId, ref: 'User'}, //如果为null，则表示为尚未被注册使用。
    showComponent: Boolean,
    createdTime: Date, //创建时间
    updatedTime: Date  //最后一次更新时间
});

infraredCommandSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

infraredCommandSchema.index({createdTime: -1});

mongoose.model('InfraredCommand', infraredCommandSchema);