var net = require('net');
var fs = require('fs');
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Device = mongoose.model('Device');
var HomeDevice = mongoose.model('HomeDevice');
var User = mongoose.model('User');
var socketServer = net.createServer();
var Sense = require('../sense/sense');
var Scene = require('../scene/scene');
var message = require('../message/message');
var SenseHandle = require('./senseHandle');
var MessageHandle = require('./messageHandle');
var CommandHandle = require('./commandHandle');
var App = mongoose.model('App');
var request = require('request');
var clients = {};           //already authed clients
var unAuthClient = {};      //unauth
var AppManagement = mongoose.model('AppManagement');
var async = require('async');
var needle = require('needle');
var log4j = require('log4js').getLogger();

var config = require('../../../config/config');
var jwt = require('jsonwebtoken');

//引用service/smartpen/smartpen.js中的方法
var smartpen = require('../smartpen/smartpen');


//校验链接是否存在
exports.gatewayOn = function (gatewayId, cb) {
    var client = clients[gatewayId];
    if (client) {
        return cb(null, true);
    }
    return cb(null, false);
};


//控制方法

exports.command = function (gatewayId, command) {
    var client = clients[gatewayId];
    if (client) {
        client.write(command + '$$$');  //TODO format

        //console.log('command:');
        //console.log(command);
        /*下面2个console输出相当于令系统延迟写入数据，勿注释或删除，以免造成默认情景模式失效 */
        //console.log(clients);
        //console.log(clients);
        /*上面2个console输出相当于令系统延迟写入数据，勿注释或删除，以免造成默认情景模式失效 */
        return true;
    }
    return false;
};


//校验网关传过来的数据是否是json对象
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


function isJson(obj) {
    var _json = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    return _json;
}


//自动填充方法，如pad（num，4）表示num不足4位时，自动在num前面填充0，补足四位
function pad(num, n) {
    var i = (num + "").length;
    while (i++ < n) num = "0" + num;
    return num;
}


//大小端转换
function swapBytes(buffer) {
    var l = buffer.length;
    if (l & 0x01) {
        //return null;
        if (l == 1) {
            return buffer;
        }
        l = l + 1;

    }
    var mid = l / 2;
    for (var i = 0; i < mid; i += 1) {
        var a = buffer[i];
        buffer[i] = buffer[l - i - 1];
        buffer[l - i - 1] = a;
    }
    return buffer;
}

//socketServer.on('connection', function (client) {
//    console.log(client.remoteAddress + ':' + client.remotePort);
//    var gate;       //网关ID
//    var double = 3;  //过滤门磁重复信息
//    var jishu = 0;   //计算发送命令次数
//
//    client.on('data', function (data) {
//        var a = data.toString();
//
//        var jsonArray = a.split('$$$');
//        for (var i = 0; i < jsonArray.length; i++) {
//            if (!IsJsonString(jsonArray[i])) {
//                return;
//            }
//            var b = eval("(" + jsonArray[i] + ")");
//            var _type = b.type;
//            gate = b.gatewayId;
//            //验证成功
//            if (clients[gate]) {
//            //if (1 == 1) {
//                var gatewayId = b.gatewayId;
//                var authClient = clients[gatewayId];
//                if (authClient && authClient.remoteAddress == client.remoteAddress && authClient.remotePort == client.remotePort) {
//                //if (1 == 1) {
//                    var c = b.data;
//                    var type = c.type;
//                    var deviceId = c.addr;
//                    //修改后的代码
//                    //根据deviceId得到meta
//                    var criteria = {};
//                    //criteria['$or'] = [{'mac':deviceId},{'_id':deviceId}];
//                    if(deviceId== b.gatewayId){
//                        criteria['_id']=deviceId;
//                    }else{
//                        criteria['mac']=deviceId;
//                    }
//                    DeviceList.findOne(criteria)
//                        .populate('meta', 'manufacturer')
//                        .populate('home', 'user')
//                        .exec(function (err, doc) {
//                            if (err) {
//                                return client.write('error');
//                            } else if(doc&&doc!=null&&doc.home!=null){
//                                AppManagement.findOne({'user':doc.home.user},function(err,app){
//
//                                    if(err){
//                                        return client.write('error');
//                                    } else if(!app){
//                                        return console.log('user['+doc.home.user+'] has not installed any apps yet!');
//                                    }else{
//                                        var _app = [];
//                                        if(app==null){
//                                            return client.write('no trust app');
//                                        }
//                                        for(var i = 0;i<app.apps.length;i++){
//                                            _app.push(app.apps[i].app);
//                                        }
//                                        User.findById(doc.home.user, function (err, user) {
//                                            if(err){
//                                                return client.write('error');
//                                            }else{
//                                                //查找app里面的app字段
//                                                App.find({'type':'third','_id':{$in:_app}},function(err,app_){
//                                                    if(err){
//                                                        return client.write('error');
//                                                    }else{
//                                                        var url = null;
//                                                        var options = {
//                                                            method: 'get',
//                                                            form: {
//                                                                data: b,
//                                                                deviceId: doc._id,
//                                                                gatewayId: b.gatewayId,
//                                                                tooken: createToken(user)
//                                                            }
//                                                        };
//                                                        for(var j=0;j<app_.length;j++){
//                                                            if (app_[j].app.meta == doc.meta.manufacturer) {
//                                                                //request转发app[i].app.htServer.url
//                                                                url = app_[j].app.dataHandler;
//                                                                options['url'] = url;
//                                                                request(options, function (err, resp, body) {
//                                                                });
//                                                            }
//                                                        }
//                                                    }
//                                                });
//                                            }
//                                        })
//                                    }
//                                });
//                            }
//                        })
//                    switch (_type) {
//                        case 'command':
//                            break;
//                        case 'sense':
//                            break;
//                        case 'updatePass':
//                            var _json;
//                            var newPassword = c.newPassword;
//                            DeviceList.findOneAndUpdate({'_id':gate},{'password':newPassword},function(err,device){
//                                if(err){
//                                    _json={
//                                        type: 'updatePass',
//                                        gatewayId: gate,
//                                        data: {
//                                            value:'updatePass failure'
//                                        },
//                                        method:'system'
//                                    }
//                                    var h = JSON.stringify(_json);
//                                    return client.write(h+'$$$')
//                                }else{
//                                    _json={
//                                        type: 'updatePass',
//                                        gatewayId: gate,
//                                        data: {
//                                            flag:'success',
//                                            value:newPassword
//                                        },
//                                        method:'system'
//                                    }
//                                    var a = JSON.stringify(_json);
//                                    console.log('发送成功');
//                                    return client.write(a+'$$$');
//                                }
//                            })
//                            break;
//                        case 'ack':
//                            break;
//
//                    }
//                } else {
//                    var _json = {
//                        type: 'message',
//                        gatewayId: gate,
//                        data: 'auth failure',
//                        method: 'system'
//                    }
//                    var failure = JSON.stringify(_json);
//                    client.write(failure + '$$$');
//                }
//
//            } else {
//                //验证失败
//                var id = b.gatewayId;
//                var pass = b.data.passwd;
//                DeviceList.findById(id, function (err, doc) {
//                    if (err) {
//                        return client.write('error');
//                    } else {
//                        if (doc && doc.password == pass) {
//                            clients[id] = client;
//                        } else {
//                            var _json = {
//                                type: 'message',
//                                gatewayId: gate,
//                                data: 'auth failure',
//                                method: 'system'
//                            }
//                            var failure = JSON.stringify(_json);
//                            client.write(failure + '$$$');
//                        }
//                    }
//                });
//            }
//        }
//    });
//
//	//add set client keep alive
//	client.setKeepAlive(true);
//	//add timeout
//    client.setTimeout(2*60*1000,function(){
//        client.end("Connection: close\r\n\r\n");
//        client.destroy();
//    });
//    //add timeout event
//    client.on('timeout', function(){
//    	client.end();
//    	client.destroy();
//    });
//
//    client.on('end', function (data) {
//        delete clients[gate];     //清理client
//    });
//    client.on('error', function (exc) {
//        console.log("ignoring exception: " + exc);
//        //add end and destroy
//        client.end();
//        client.destroy();
//    });
//});

//旧代码，稍微改动了一下
socketServer.on('connection', function (client) {

    console.log('\nconnection\n');
    //console.log(client);
    //console.log('\n\n');

    log4j.info(client.remoteAddress + ':' + client.remotePort);
    var gate;       //网关ID

    client.on('data', function (data) {

        //console.log(data);

        //将网关传来的数据写入txt文件
        fs.appendFile('smartPenData.txt', data + '\n\n', function (err) {
            if (err) {
                console.log(err);
            }
        });

        var a = data.toString();
        //console.log('a:');
        //console.log(a);
        var jsonArray = a.split('$$$');


        for (var i = 0; i < jsonArray.length; i++) {

            var packet = {};

            if (!IsJsonString(jsonArray[i])) {
                return;
            }
            var b = eval("(" + jsonArray[i] + ")");
            var _type = b.type;

            gate = b.gatewayId;
            //验证成功
            if (clients[gate]) {
                //if (1 == 1) {
                var gatewayId = b.gatewayId;
                console.log();
                var authClient = clients[gatewayId];
                if (authClient && authClient.remoteAddress == client.remoteAddress && authClient.remotePort == client.remotePort) {
                    //if (1 == 1) {

                    //if (b.type === "command") {
                    //    log4j.info('data from gateway whole data:' + require('util').inspect(b));
                    //
                    //}
                    var c = b.data;
                    var type = c.type;
                    var deviceId = c.addr;
                    //根据deviceId得到meta
                    var criteria = {};
                    //criteria['$or'] = [{'mac':deviceId},{'_id':deviceId}];
                    if (deviceId == b.gatewayId) {
                        criteria['_id'] = deviceId;
                    } else {
                        criteria['mac'] = deviceId;
                    }
                    //console.log('device criteria:' + require('util').inspect(criteria));
                    Device.findOne(criteria)
                        .populate('meta', '，')
                        .populate('home')
                        .exec(function (err, doc) {
                            if (err) {
                                log4j.error('DeviceList:' + err.message);
                                return client.write('error');
                            } else if (doc && doc.home) {


                                log4j.info('device exist and device home exist');
                                async.parallel([
                                    function driverHandle() {

                                        //log4j.info(config.driver.gatewayDriver + '/huanten/driver.js');
                                        //目前数据库中数据中的meta.manufacturer比较随意，先不用，直接用字符串huanteng写死，以后可用manufacturer字段创建
                                        var driverisExist = fs.existsSync(config.driver.gatewayDriver + '/huanten/driver.js');
                                        if (driverisExist) {
                                            var driver = require(config.driver.gatewayDriver + '/huanten/driver.js');
                                            driver.execute({
                                                data: b,
                                                deviceId: doc._id,
                                                gatewayId: b.gatewayId
                                            }, function (err, execRes) {
                                                if (err) {
                                                    return log4j.error(err);
                                                } else {
                                                    return log4j.info(execRes);
                                                }
                                            });
                                        } else {
                                            log4j.error('no driver');
                                            return client.write('no driver file');
                                        }
                                    },

                                    function thirdApp() {
                                        AppManagement.findOne({'user': doc.home.user})
                                            .populate('user')
                                            .exec(function (err, app) {
                                                if (err) {
                                                    log4j.error('AppManagement:' + err.message);
                                                    return client.write('error');
                                                } else if (!app) {
                                                    return log4j.info('user[' + doc.home.user + '] has not installed any apps yet!');
                                                } else {
                                                    log4j.info('apps exist');
                                                    if (_type === 'sense' || _type === 'heartbeat') {
                                                        log4j.info("type:" + _type);
                                                        var _app = [];
                                                        if (!(app && app.apps && app.apps.length)) {
                                                            log4j.error('no trust app');
                                                            return client.write('no trust app');
                                                        }
                                                        for (var i = 0; i < app.apps.length; i++) {
                                                            _app.push(app.apps[i].app);
                                                        }
                                                        //查找app里面的app字段
                                                        App.find({
                                                            //'type': 'third',
                                                            'type': 'mobile',
                                                            '_id': {$in: _app}
                                                        }, function (err, app_) {

                                                            log4j.info('in App.find');
                                                            packet.device = JSON.parse(JSON.stringify(doc));//doc.toObject();
                                                            packet.user = JSON.parse(JSON.stringify(app.user));

                                                            //packet.user = app.user.toObject();
                                                            //console.log('packet',packet);

                                                            if (err && !app_) {
                                                                console.log('----APP不存在----')
                                                                return client.write('error');
                                                            } else {
                                                                var url = null;
                                                                var options = {};

                                                                var deviceName;           //门磁名称
                                                                //获取门磁名称
                                                                HomeDevice.findOne({'devices.deviceId': doc._id}, function (err_home, result_home) {

                                                                    if (err) {
                                                                        return res.json({
                                                                            errorCode: 500,
                                                                            message: err.message
                                                                        });
                                                                    } else if (result_home) {
                                                                        for (var i = 0; i < result_home.devices.length; i++) {
                                                                            if ((result_home.devices[i].deviceId).equals(doc._id)) {
                                                                                deviceName = result_home.devices[i].remark;


                                                                                if (_type === 'sense') {


                                                                                    options = {
                                                                                        form: {

                                                                                            sense: b,
                                                                                            packet: packet,
                                                                                            token: createToken(doc.home.user),
                                                                                            remark: deviceName


                                                                                        }
                                                                                    };
                                                                                } else if (_type === 'heartbeat') {
                                                                                    options = {
                                                                                        form: {
                                                                                            sense: b
                                                                                        }
                                                                                    }
                                                                                }

                                                                                //log4j.info('form:------'+JSON.stringify(options.form));

                                                                                //log4j.info('form:------'+app_);


                                                                                //for (var j = 0; j < app_.length; j++) {
                                                                                //app_[j].app和doc.meta应该判断一下吧。。。
                                                                                // if (app_[j].app.meta == doc.meta.manufacturer) {
                                                                                //if(app_[j].type=='mobile'){
                                                                                log4j.info('post data to third app');
                                                                                //request转发app[i].app.htServer.url
                                                                                // url = app_[j].app.dataHandler;
                                                                                url = app_[0].links.upload;
                                                                                // options['url'] = url;
                                                                                var value_door;

                                                                                try {
                                                                                    var temp = b.data;
                                                                                    value_door = pad((parseInt((temp.values.substring(2, 3)).toString(16), 16).toString(2)), 4).substring(0, 1);

                                                                                } catch (err) {
                                                                                    log4j.error('parse error:' + err);
                                                                                    return res.json({
                                                                                        errorCode: 1500,
                                                                                        message: "the value of door parse error! please check your data!"
                                                                                    });
                                                                                }
                                                                                if (options.form.packet.device.state && options.form.packet.device.state.door !== value_door) {
                                                                                    options['url'] = 'http://61.160.106.206:11025/third/sushi';
                                                                                    //options['url'] = url
                                                                                    //options['remark']=deviceName,

                                                                                    //console.log('###############')
                                                                                    //console.log('###############')
                                                                                    //console.log(value_door)
                                                                                    //console.log(options.form.packet.device.state.door)
                                                                                    //console.log('###############')
                                                                                    //console.log('###############')

                                                                                    request.post(options, function (err, resp, body) {
                                                                                        if (err) {
                                                                                            log4j.error("@@@@@@@@@@@@@@@")
                                                                                            log4j.error(err);
                                                                                        }

                                                                                        else {
                                                                                            // console.log('###############')
                                                                                            // console.log('###############')
                                                                                            //// console.log(client._value)
                                                                                            console.log(options)
                                                                                            // console.log('###############')
                                                                                            // console.log('###############')

                                                                                        }

                                                                                    });
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                })
                                                                //}
                                                                //}
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                    }
                                ], function (err, result) {
                                    if (err) {
                                        return log4j.error(err);
                                    }
                                })
                            } else {
                                log4j.info('no device or device no home');
                                //log4j.info('criteria',criteria);
                                return client.write(JSON.stringify(criteria) + 'no device or device no home');
                            }
                        });

                    switch (_type) {
                        //smartpen.analyseActionAndSound();
                        //新建一个type，接收并处理来自网关的smartpen消息
                        case 'action':
                            //{"type":"action","gatewayId":"562f480e0a9a8850787961ed","data":{"instruction":"7e4e544d0a0009efe837f0e220ff96fe44ff97c72a237e4e544d0a0009f0003ad0e088ffa3fe1dff851350237e4e544d0a0009f1d83a78e160ffbafe0bff7467b723"}}$$$
                            var dataFlow = b.data.instruction;
                            var result = smartpen.getActionAndSound(gate, dataFlow);
                            //console.log('\n' + result + '\n');
                            break;
                        case 'command':
                            break;
                        //借用此处的sense来进行调试
                        case 'sense':
                            //console.log('\n\n\n\n\ngatewayId:' + gate + '\n\n\n\n\n');
                            //var dataFlow = '7e4e544d0a0009efe837f0e220ff96fe44ff97c72a23457e4e544d0a0009f0003ad0e088ffa3fe1dff851350237e4e544d0a0009f1d83a78e160ffbafe0bff7467b723';
                            //var dataFlow = '7e4e544d0a00097d5eefe837f0e220ff96fe44ff97c72a23457e4e544d0a00092d5ef0003ad0e088ffa3fe1dff851350237e4e544d0a0009f1d83a78e160ffbafe0bff7467b723';
                            //var result = smartpen.getActionAndSound(gate, dataFlow);
                            //console.log('\n' + result + '\n');
                            break;
                        case 'updatePass':
                            var _json;
                            var newPassword = c.newPassword;
                            Device.findOneAndUpdate({'_id': gate}, {'password': newPassword}, function (err, device) {
                                if (err) {
                                    _json = {
                                        type: 'updatePass',
                                        gatewayId: gate,
                                        data: {
                                            value: 'updatePass failure'
                                        },
                                        method: 'system'
                                    }
                                    var h = JSON.stringify(_json);
                                    return client.write(h + '$$$')
                                } else {
                                    _json = {
                                        type: 'updatePass',
                                        gatewayId: gate,
                                        data: {
                                            flag: 'success',
                                            value: newPassword
                                        },
                                        method: 'system'
                                    }
                                    var a = JSON.stringify(_json);
                                    log4j.info('发送成功:' + a);
                                    return client.write(a + '$$$');
                                }
                            })
                            break;
                        case 'ack':
                            break;

                    }
                    //}
                } else {
                    var _json = {
                        type: 'message',
                        gatewayId: gate,
                        data: 'auth failure',
                        method: 'system'
                    }
                    var failure = JSON.stringify(_json);
                    client.write(failure + '$$$');
                }

            } else {
                //验证失败
                var id = b.gatewayId;
                var pass = b.data.passwd;
                log4j.info('auth failure id:' + id);
                Device.findById(id, function (err, doc) {
                    if (err) {
                        log4j.error('666:' + err);
                        return client.write('error');
                    } else {
                        log4j.info('pass' + pass);
                        if (doc) {
                            log4j.info('password:' + doc.password);
                        }
                        if (doc && doc.password == pass) {
                            console.log('777 add device suss');
                            clients[id] = client;
                        } else {
                            var _json = {
                                type: 'message',
                                gatewayId: gate,
                                data: 'auth failure',
                                method: 'system'
                            }
                            var failure = JSON.stringify(_json);
                            client.write(failure + '$$$');
                        }
                    }
                });
            }
        }
    });

    //add set client keep alive
    client.setKeepAlive(true);
    //add timeout
    client.setTimeout(2 * 60 * 1000, function () {
        client.end("Connection: close\r\n\r\n");
        client.destroy();
    });
    //add timeout event
    client.on('timeout', function () {
        client.end();
        client.destroy();
    });

    client.on('end', function (data) {
        delete clients[gate];     //清理client
    });
    client.on('error', function (exc) {
        log4j.info("ignoring exception: " + exc);
        //add end and destroy
        client.end();
        client.destroy();
    });
});

socketServer.on('listening', function () {
    console.log('Socket server opened on %j', socketServer.address().port);
});

socketServer.on('close', function () {
        console.log('socket server down, restarting...');
        setTimeout(function () {
            socketServer.listen(config.cloud.socketPort);
        }, 1000);
    }
);

socketServer.listen(config.cloud.socketPort);

function createToken(user) {
    return jwt.sign({current: user}, config.jwt.secret, {expiresInMinutes: config.jwt.thirdExpiresInMinutes});
};

