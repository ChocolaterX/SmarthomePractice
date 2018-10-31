const asyncModule = require('async');
const validator = require('validator');
var userModel = require('../../model/user');
var serucityDeviceModel = require('../../model/securityDevice');

//添加设备
exports.create = async (ctx) => {
    return new Promise((resolve, reject) => {
    });
};

//设备列表
exports.retrievalList = async (ctx) => {
    return new Promise((resolve, reject) => {
    });
};

exports.update = async (ctx) => {
    return new Promise((resolve, reject) => {
    });
};

exports.delete = async (ctx) => {
    return new Promise((resolve, reject) => {
    });
};

//使用控制按钮
exports.command = async (ctx) => {
    return new Promise((resolve, reject) => {
    });
};

//使用指令
exports.instruction = async (ctx) => {
    let instruction = ctx.body.request;
    return new Promise((resolve, reject) => {
    });
};

