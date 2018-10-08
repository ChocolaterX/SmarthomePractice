/**
 * Created by Administrator on 2017-3-30.
 */
var express = require('express');
var router = express.Router();
var entrance = require('./entrance');
var entranceSetting = require('./entranceSetting');


//entrance
//router.post('/door/localCreate',entrance.localCreate);
router.post('/door/queryDoor',entrance.queryDoor);

//测试门磁消息存入数据库
router.post('/door/createTest',entrance.createTest);


//entranceSetting
router.post('/door/setting/send',entranceSetting.send);
router.post('/door/setting/list',entranceSetting.list);


module.exports = router;