/**
 * <copyright file="region.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>11/22/2017</date>
 * <summary>
 *  。
 * </summary>
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
