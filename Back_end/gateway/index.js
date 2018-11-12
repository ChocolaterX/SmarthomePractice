const net = require('net');

const config = require('../config/config');
const securityDeviceModule = require('../server/service/device/securityDevice');

//全局变量
let Clients = [];           //已连接的客户端
let infraredCommand = '';       //考虑一下什么时候清零

/**
 * 向网关发送写指令
 * @param instruction   String形式的指令
 * @param type   指令格式，包括device, infrared
 * 控制命令的长度为25
 */
exports.writeCommand = function (instruction) {
    console.log('\nwrite command\n');
    console.log('instruction:' + instruction);
    console.log('instruction length:' + instruction.length);

    //let buf = new Buffer(25);
    let length = Math.floor(instruction.length / 2);
    //console.log(Math.floor(instruction.length/2));
    let buf = new Buffer(Math.floor(instruction.length / 2));
    //buf.write('FC0015000120202020200801100100124B000FF6AA36080018', 0, 25, 'hex');
    //buf.write('FC0015000120202020200801100100124B000FF6AA36080119', 0, 25, 'hex');
    //FC 0015 0001 202020202008 01 1001 00124B000FF6AA36 0801 19
    //FC 0015 0001 202020303008 01 1001 000D6F000BE63DC4 0101 5A'
    buf.write(instruction, 0, length, 'hex');
    //client.write(buf);
    //console.log(Clients[0]);
    //console.log('\n\n');
    //console.log(Clients);
    //console.log('\n\n');
    //if (Clients[0]) {
    //    Clients[0].write(buf);
    //}
    //else {
    //    console.log('当前未连接网关');
    //}
    for (let i = 0; i < Clients.length; i++) {
        Clients[i].write(buf);
    }
    if (Clients.length == 0) {
        console.log('当前未连接网关');
    }
};

/**
 * 建立Socket连接，处理网关传过来的数据、发送控制指令等
 * 数据类型包括：智能笔数据（语音+动作），网关心跳包，网关状态指令
 */
let socketServer = net.createServer();
socketServer.on('connection', function (client) {
    console.log('\non connection\n');
    // console.log(client);

    client.setEncoding("hex");
    //console.log(client);
    //Clients.push(client);
    //Clients = [client];
    let clientTemp;
    if (Clients.length < 3) {
        Clients.push(client);
    }
    if (Clients.length === 3) {
        clientTemp = client;
        Clients[0] = Clients[1];
        Clients[1] = Clients[2];
        Clients[2] = clientTemp;
    }
    //if (Clients.length == 3) {
    //for (let j = 0; j < Clients.length; j++) {
    //    console.log('\n\n');
    //    console.log(Clients[j]);
    //    console.log('\n\n');
    //}
    //}

    //console.log(client);
    //fs.appendFile('clients.txt', client, function (err) {
    //    if (err) {
    //        console.log(err);
    //    }
    //    else {
    //        console.log('\n\n输出新网关\n\n');
    //    }
    //});
    //console.log('\n当前网关数量：' + Clients.length);

    //let exists = false;
    //for (let i = 0; i < Clients.length; i++) {
    //    if (Clients[i] == client) {
    //        console.log('当前客户端已存在');
    //        exists = true;
    //        break;
    //    }
    //}
    //if (!exists) {
    //    Clients.push(client);
    //    fs.appendFile('clients.txt', Clients, function (err) {
    //        if (err) {
    //            console.log(err);
    //        }
    //        else {
    //            console.log('\n\n输出新网关\n\n');
    //        }
    //    });
    //}

    client.on('data', function (data) {
        console.log('server got data from client: ', data.toString());
        //console.log(Clients);
        let instruction = data.toString();

        /**
         * 判断从网关传来的数据类型
         * 长度0C：网关连接确认
         * 长度18：门磁状态，红外感应状态
         * 其他长度：心跳包
         */

        // fc000c00012020203030080301010127 网关连接
        //fc000c00012020203030080301010127fc0030000120202030300803010203000d6f000be63dc401005100005043c9a339556c01010ecb005043c90324399601010dc11e
        //心跳包

        if (instruction.substring(0, 6) === 'fc000c') {
            console.log('网关连接:  ' + Date());
        }
        if (instruction.substring(0, 6) === 'fc0015') {

        }
        if (instruction.substring(0, 6) === 'fc0018') {
            if (instruction.substring(24, 26) === '30') {            //报警设备
                if (instruction.substring(46, 50) === '010d') {           //门磁
                    //fc0018 000130eb1f03d0dd03 3002 005043c903246e27 01 0402 0102 52  旧版
                    //fc0018 000120202030300803 3002 005043c903243996 01 010d 0102 5c  门磁打开
                    //fc0018 000120202030300803 3002 005043c903243996 01 010d 0002 5d  门磁关闭
                    //fc0018 000120202030300803 3002 005043c9a339556c 01 010e 0101 77  红外

                    console.log('门磁指令');
                    securityDeviceModule.formatInstruction(instruction).then(response => {
                        console.log(response.message);
                    }, err => {
                        console.log(err);
                    });
                }
                else if (instruction.substring(46, 50) === '010e') {
                    console.log('红外感应指令');
                    securityDeviceModule.formatInstruction(instruction).then(response => {
                        console.log(response.message);
                    }, err => {
                        console.log(err);
                    });
                }
                else {
                    console.log('fc0018 未知指令');
                }
            }
        }
    });

    //add set client keep alive
    client.setKeepAlive(true);

    client.setTimeout(2 * 60 * 1000, function () {
        client.end("Connection: close\r\n\r\n");
        client.destroy();
        //Clients = [];
    });
    client.on('timeout', function () {
        client.end();
        client.destroy();
        //Clients=[];
    });

    client.on('end', function (data) {
        //delete clients[gate];     //清理client
        console.log('client end.');
        //Clients=[];
    });

    client.on('error', function (exc) {
        client.end();
        client.destroy();
        //Clients=[];
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

socketServer.listen(config.GATEWAY_PORT);


/*let socketServer = net.createServer(function (socket) {
 console.log('client connected');

 socket.setEncoding("hex");
 // 监听客户端的数据
 socket.on('data', function (data) {
 console.log('server got data from client: ', data.toString());
 });

 // 监听客户端断开连接事件
 socket.on('end', function (data) {
 console.log('connection closed');
 });

 //被command.js调用
 let buf = new Buffer(25);
 buf.write('FC0015000120202020200801100100124B000FF6AA36080018', 0, 25, 'hex');
 socket.write(buf);

 //setInterval(function () {
 //    for (let i = 0; i < commandBuffer.length; i++) {
 //        let buf = new Buffer(25);
 //        buf.write(commandBuffer[i], 0, 25, 'hex');
 //        console.log('buffer:');
 //        console.log(buf);
 //        socket.write(buf);
 //    }
 //    commandBuffer = [];
 //}, 2000);


 //发送数据给客户端
 //socket.write('FC0015000120202020200801100100124B000FF6AA36080018');
 //socket.write([0xFC,0x00,0x15,0x00,0x01,0x20,0x20,0x20,0x20,0x20,0x08,0x01,0x10,0x01,0x00,0x12,0x4B,0x00,0x0F,0xF6,0xAA,0x36,0x08,0x00,0x18]);
 //let data = [0xFC, 0x00, 0x15, 0x00, 0x01, 0x20, 0x20, 0x20, 0x20, 0x20, 0x08, 0x01, 0x10, 0x01, 0x00, 0x12, 0x4B, 0x00, 0x0F, 0xF6, 0xAA, 0x36, 0x08, 0x00, 0x18];
 //socket.write(data);

 //测试成功
 //let buf = new Buffer(25);
 //buf.write('FC0015000120202020200801100100124B000FF6AA36080018', 0, 25, 'hex');
 //socket.write(buf);
 });

 socketServer.listen(config.cloud.socketPort, function () {
 console.log('Socket port started on port ' + config.cloud.socketPort);
 });*/

