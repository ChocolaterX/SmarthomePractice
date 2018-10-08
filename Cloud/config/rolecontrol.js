/**
 * Created by tianci on 2015/5/28.
 */

var ConnectRoles = require('connect-roles');
var mongoose = require('../server/cloud_db_connect');
//var Role = mongoose.model('Role');
var User = mongoose.model('User');
var rolecontrol = new ConnectRoles({
    failureHandler: function (req, res, action) {
        // optional function to customise code that runs when
        // user fails authorisation
        var accept = req.headers.accept || '';
        res.status(403);
        if (~accept.indexOf('html')) {
            res.render('access-denied', {action: action});
        } else {
            res.send('Access Denied - You don\'t have permission to: ' + action);
        }
    }
});

//admin role api
rolecontrol.use('access admin api', function (req) {
    if (req.user && req.user.current.roles.indexOf('admin') > -1) {
        return true;
    }
});

//normal role api
rolecontrol.use('access normal api', function (req) {
    if (req.user && req.user.current.roles.indexOf('normal') > -1) {
        return true;
    }
});

//manager role api

//用户模块查看
rolecontrol.use('access manager userRead api', function (req) {

    if (req.user && (req.user && req.user.current.roles.indexOf('admin') > -1||req.user.role.authority.userRead||req.user.role.authority.userManage)){
        return true;
    }
});

//用户模块管理（查、增、改、删、及其他）
rolecontrol.use('access manager userManage api', function (req) {

    if (req.user && req.user.current.roles.indexOf('admin') > -1||req.user.role.authority.userManage) {
        return true;
    }
});

//家庭模块查看
rolecontrol.use('access manager homeRead api', function (req) {

    if (req.user && (req.user && req.user.current.roles.indexOf('admin') > -1||req.user.role.authority.homeRead||req.user.role.authority.homeManage)){
        return true;
    }
});

//家庭模块管理（查、增、改、删、及其他））
rolecontrol.use('access manager homeManage api', function (req) {

    if (req.user && req.user.current.roles.indexOf('admin') > -1||req.user && req.user.role.authority.homeManage) {
        return true;
    }
});

//设备模块查看（查、二维码、搜索)
rolecontrol.use('access manager deviceRead api', function (req) {

    if (req.user && (req.user && req.user.current.roles.indexOf('admin') > -1||req.user.role.authority.deviceRead||req.user.role.authority.deviceManage)){
        return true;
    }
});

//设备模块管理（查、二维码、添加设备、删除设备、修改设备）
rolecontrol.use('access manager deviceManage api', function (req) {

    if (req.user && req.user && req.user.current.roles.indexOf('admin') > -1||req.user.role.authority.deviceManage) {
        return true;
    }
});

//控制流坐标图查看
rolecontrol.use('access manager flowDiagram api', function (req) {

    if (req.user && req.user && req.user.current.roles.indexOf('admin') > -1||req.user.role.authority.flowDiagram){
        return true;
    }
});

//控制流列表查看
rolecontrol.use('access manager flowList api', function (req) {

    if (req.user && req.user && req.user.current.roles.indexOf('admin') > -1||req.user.role.authority.flowList) {
        return true;
    }
});

//日志列表查看
rolecontrol.use('access manager logList api', function (req) {

    if (req.user && req.user && req.user.current.roles.indexOf('admin') > -1||req.user.role.authority.logList){
        return true;
    }

});

//应用市场模块查看
rolecontrol.use('access manager appRead api', function (req) {

    if (req.user && (req.user && req.user.current.roles.indexOf('admin') > -1||req.user.role.authority.appRead||req.user.role.authority.appManage)) {
        return true;
    }
});

//应用市场模块管理
rolecontrol.use('access manager appManage api', function (req) {

    if (req.user && req.user && req.user.current.roles.indexOf('admin') > -1 || req.user.role.authority.appManage) {
        return true;
    }
});




module.exports = rolecontrol;