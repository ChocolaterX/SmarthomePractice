/**
 * <copyright file="admin.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>11/14/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
    loginName: String,         //注册、登陆使用账号
    email: String,             //邮箱
    salt: String,              //盐
    hashed_password: String,   //加密后密码
    removed: Boolean,
    createdTime: Date,
    updatedTime: Date
});

/**
 * Virtuals
 */
adminSchema
    .virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._password
    });

/**
 * Validations
 */

var validatePresenceOf = function (value) {
    return value && value.length;
};

adminSchema.path('hashed_password').validate(function (hashed_password) {
    return hashed_password.length;
}, 'Password cannot be blank');

/**
 * Pre-save hook
 */
adminSchema.pre('save', function (next) {
    if (!this.createdTime) this.createdTime = Date.now();
    this.updatedTime = Date.now();
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.password)) {
        next(new Error('Invalid password'));
    } else {
        next();
    }
});

/**
 * Methods
 */

adminSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */

    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */

    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */

    encryptPassword: function (password) {
        if (!password) return '';
        var encrypted;
        try {
            encrypted = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
            return encrypted;
        } catch (err) {
            return '';
        }
    }
};


adminSchema.index({email: 1});
adminSchema.index({email: 1, removed: -1, updatedTime: -1});
mongoose.model('Admin', adminSchema);