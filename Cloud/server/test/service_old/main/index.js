/**
 * Created by leizhang on 2015/2/25.
 */

var express = require('express');
var router = express.Router();
var user = require('./user');
var admin = require('./admin');
var region = require('./region');
//user
/**
 * 以下红色被注释的方法路径见SmartHome\trunk\cloud\config\routes.js
 */
//router.post('/user/login',user.login);
//router.post('/user/create',user.create);
//router.get('/user/logout',user.logout);
/** **********************************************************/
router.post('/user/resetPassword', user.resetPassword);
router.get('/user/info', user.info);
router.post('/user/update', user.update);

//admin
/**
 * 以下红色被注释的方法路径见SmartHome\trunk\cloud\config\routes.js
 */
//router.post('/admin/login',admin.login);
//router.post('/admin/logout',admin.logout);
/** **********************************************************/

//管理员
router.post('/admin/userList', admin.userList);
router.post('/admin/userInfo', admin.userInfo);
router.post('/admin/userPWD', admin.userPWD);
router.post('/admin/userDelete', admin.userDelete);   //未完成   将与用户相关的表删除（列如：用户设备表、情景模式表等）
router.post('/admin/userLock', admin.userLock);
router.post('/admin/userUnlock', admin.userUnlock);

//超管
router.post('/admin/create', admin.create);
router.post('/admin/list', admin.list);
router.post('/admin/delete', admin.delete);
router.post('/admin/update', admin.update);


//region
router.post('/main/region/create', region.createRegion);
router.post('/main/region/update', region.updateRegion);
router.post('/main/region/list/get', region.getRegionList);
router.post('/main/region/delete', region.deleteRegion);

//router.post('/user/delete', Log.useLog,rolecontrol.can('access manager userManage api'),user.delete);
//router.get('/user/info',Log.useLog,user.info);
//router.post('/user/list', Log.useLog,rolecontrol.can('access manager userRead api'),user.list);
//router.post('/user/lock', Log.useLog,rolecontrol.can('access manager userManage api'),user.lock);
//router.post('/user/unlock',Log.useLog,rolecontrol.can('access manager userManage api'), user.unlock);
//
////router.post('/user/update',Log.useLog,rolecontrol.can('access admin api'), user.updateRoles);
//router.post('/user/reset/password', Log.useLog, user.resetPwd);
//
//
////preference
//router.post('/preference/put', Log.useLog, preference.put);
//router.get('/preference/get/all', Log.useLog, preference.getAll);
//router.get('/preference/get/:key/key', Log.useLog, preference.getByKey);
//router.get('/preference/message/receive', preference.receive);
//router.get('/preference/message/rejection', preference.rejection);
//
//
////manager
//router.post('/manager/create', Log.useLog, rolecontrol.can('access admin api'), manager.create);
//router.post('/manager/list', Log.useLog, rolecontrol.can('access admin api'), manager.list);
//router.post('/manager/info', Log.useLog, manager.info);
//
//router.post('/manager/updateRoles', Log.useLog, rolecontrol.can('access admin api'), manager.updateRoles);
//router.post('/manager/defaultPWD', Log.useLog,rolecontrol.can('access manager userManage api'),Log.useLog, manager.defaultPWD);

module.exports = router;

