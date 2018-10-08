/**
 * Created by leizhang on 2015/8/25.
 */

var express = require('express');
var router = express.Router();
var message = require('./message');
var Log = require('../log/log');
//user
router.post('/message/create', Log.useLog, message.create);
router.get('/message/:messageId/get', Log.useLog, message.get);
router.post('/message/count', Log.useLog, message.count);
router.post('/message/find', Log.useLog, message.find);
router.post('/message/:messageId/perform', Log.useLog, message.perform);
router.get('/message/:messageId/read', Log.useLog, message.read);
router.get('/message/unread',Log.useLog,message.unread);
router.get('/message/:messageId/remove', Log.useLog, message.remove);


module.exports = router;