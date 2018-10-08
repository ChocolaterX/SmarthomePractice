/**
 * <copyright file="securityDevice.js" company="Run">
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

var securityDeviceSchema = new Schema({
    name: String,       //设备名称，管理员添加时该字段可为空
    type: Number,       //1：门磁，2：红外感应；3：门锁；4：摄像头
    mac: String,   		//物理地址
    addedTime: Date, 	//认证时间
    user: {type: Schema.ObjectId, ref: 'User'}, 		//如果为null，则表示为尚未被注册使用
    createdTime: Date, 	//创建时间
    updatedTime: Date,  //更新时间
    state: {},   //设备的当前状态，根据不同的设备state里面的字段不一样  备注：设备认证时必须给予对应设备的初始状态
    url: String
});

securityDeviceSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

securityDeviceSchema.index({mac: 1, createdTime: -1});

mongoose.model('SecurityDevice', securityDeviceSchema);
