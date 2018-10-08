/**
 * <copyright file="setting.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>12/12/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var settingSchema = new Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    doorInductionAlarm: Boolean,
    infraredInductionAlarm: Boolean,
    lockAlarm: Boolean,
    airAlarm: Boolean,
    airCriticalValueHigh: Number,
    humidityAlarm: Boolean,
    humidityCriticalValueHigh: Number,
    humidityCriticalValueLow: Number,
    illuminationAlarm: Boolean,
    illuminationCriticalValueHigh: Number,
    smokeAlarm: Boolean,
    smokeCriticalValueHigh: Number,
    temperatureAlarm: Boolean,
    temperatureCriticalValueHigh: Number,
    temperatureCriticalValueLow: Number,
    createdTime: Date,
    updatedTime: Date
});

settingSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    next();
});

settingSchema.index({createdTime: -1});
mongoose.model('Setting', settingSchema);



