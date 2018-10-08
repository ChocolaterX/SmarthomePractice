/**
 * <copyright file="telecontroller.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>4/2/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var telecontrollerSchema = new Schema({
    name: String,        //遥控器名称
    user: {type: Schema.ObjectId, ref: 'User'},     //非空
    showComponent: Boolean,
    createdTime: Date, //创建时间
    updatedTime: Date  //最后一次更新时间
});

telecontrollerSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

telecontrollerSchema.index({createdTime: -1});

mongoose.model('Telecontroller', telecontrollerSchema);