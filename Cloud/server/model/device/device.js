/**
 * <copyright file="device.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>11/20/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var deviceSchema = new Schema({
    name: String,        //设备名称，管理员添加设备时该字段可为空
    type: Number,       //0:网关，1：窗帘，2：插座；3：开关；4：空调
    mac: String,   //物理地址
    addedTime: Date, //认证时间
    user: {type: Schema.ObjectId, ref: 'User'}, //如果为null，则表示为尚未被注册使用。
    //gateway: {type: Schema.ObjectId, ref: 'Device'},
    //region: {type: Schema.ObjectId, ref: 'Region'},    //区域
    showComponent: Boolean,
    createdTime: Date, //创建时间
    updatedTime: Date,  //最后一次更新时间
    state: String   //设备的当前状态，根据不同的设备state里面的字段不一样  备注：设备认证时必须给予对应设备的初始状态
});

deviceSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

deviceSchema.index({mac: 1, createdTime: -1});

mongoose.model('Device', deviceSchema);