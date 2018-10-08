var config = require('./config/config');
var express = require('express');
var path = require('path');
//var logger = require('morgan');       //express日志组件
//var compression = require('compression');     //gzip
//var favicon = require('static-favicon');    //请求网页的logo，已停用
var cookieParser = require('cookie-parser');
//var multer = require('multer');     //文件上传中间件
var bodyParser = require('body-parser');
//var serveStatic = require('serve-static');  //静态文件服务器
var flash = require('connect-flash');   //存储信息的特殊区域

// bootstrap models
require('./server/models.js');
//网关
//require('./server/service/gateway/gateway.js');
//require('./server/service/logtest/logtest.js');

var cors = require('cors');//跨域模块


var app = module.exports = express();

app.use(cors());

// logger setup
//app.use(logger('dev'));

// compression middleware
//app.use(compression({threshold: 512}));

// view engine setup
app.set('views', path.join(__dirname, 'server/view'));
app.set('view engine', 'ejs');

//app.use(favicon());

// cookieParser should be above session
//app.use(cookieParser('TaghomeCloud'));
app.use(cookieParser('SmartHomeCloud'));

// multer handles multipart/form-data
//app.use(multer({dest: path.join(__dirname, 'uploads')}));

// bodyParser
//app.use(bodyParser.urlencoded({extended: true}));
//app.use(bodyParser.json());
app.use(bodyParser.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}));


// static files middleware
//app.use(serveStatic(path.join(__dirname, 'public')));

// connect flash for flash messages - should be declared after sessions
app.use(flash());

//临时去除
//var Log = require('./server/service/log/log');

// bootstrap routes
require('./config/routes')(app);



