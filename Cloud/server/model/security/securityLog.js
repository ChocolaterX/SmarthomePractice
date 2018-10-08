/**
 * <copyright file="securityLog.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>3/7/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var securityLogSchema = new Schema({
    type: Number,       //1：门磁，2：红外感应；3：门锁；4：摄像头
    gatewayMac: String,   		//网关物理地址
    securityDeviceMac: String,
    state: Number,
    securityDevice: {type: Schema.ObjectId, ref: 'SecurityDevice'},
    user: {type: Schema.ObjectId, ref: 'User'}, 		//
    createdTime: Date, 	//创建时间
    updatedTime: Date  //更新时间
});

securityLogSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

securityLogSchema.index({mac: 1, createdTime: -1});

mongoose.model('SecurityLog', securityLogSchema);
