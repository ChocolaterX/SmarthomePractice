/**
 * Created by liyang on 2015-5-25.
 */

var express = require('express');
var router = express.Router();

var device = require('./device');
var gateway = require('./gateway');
var deviceAdmin = require('./deviceAdmin');
var gatewayAdmin = require('./gatewayAdmin');
var userDevice = require('./userDevice');
var userLog = require('../log/userLog');
var adminLog = require('../log/adminLog');
var command = require('./command');

var multer = require('multer');
var config = require('../../../config/config');
var upload = multer({dest: config.local.uploads});

/**
 * 管理员方法
 */
router.post('/admin/gateway/create', gatewayAdmin.createGateway);
//router.post('/admin/gateway/update', gatewayAdmin.updateGateway);
router.post('/admin/gateway/list/get', gatewayAdmin.getGatewayList);
router.post('/admin/gateway/delete', gatewayAdmin.deleteGateway);

router.post('/admin/device/create', deviceAdmin.createDevice);
//router.post('/admin/device/update', deviceAdmin.updateDevice);
router.post('/admin/device/list/get', deviceAdmin.getDeviceList);
router.post('/admin/device/delete', deviceAdmin.deleteDevice);
//router.post('/admin/device/qrcode/get', deviceAdmin.getDeviceQrcode);

/**
 * 公用方法
 */

/**
 * 用户方法
 */
router.post('/gateway/add', gateway.addGateway);
router.post('/gateway/update', gateway.updateGateway);
router.post('/gateway/list/get', gateway.getGatewayList);
router.post('/gateway/delete', gateway.deleteGateway);

router.post('/device/add', device.addDevice);
router.post('/device/update', device.updateDevice);
router.post('/device/list/get', device.getDeviceList);
router.post('/device/detail/get', device.getDeviceDetail);
router.post('/device/delete', device.deleteDevice);

router.post('/device/command', device.command);

module.exports = router;