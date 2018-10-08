var express = require('express');
var router = express.Router();
//var b = require('./wget');
//var message = require('./messageHandle');
//var commandHandleimpl = require('./commandHandleimpl');
//var senseHandleimpl = require('./senseHandleimpl');
//var messageHandle = require('./messageHandle')
//var Log = require('../log/log');
var gateway = require('./gateway');
var gatewayTransmit = require('./gatewayTransmit')

//router.get('/gateway', b.abc);
//router.get('/md', b.makemd5);
//router.get('/update', b.comm);
//router.get('/version', b.getVersion);
//router.post('/commandHandle',commandHandleimpl.handle);
//router.post('/senseHandle',senseHandleimpl.handle);

//router.post('/messageHandle',messageHandle.handle);

module.exports = router;