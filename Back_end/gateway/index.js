const net = require('net');
const validator = require('validator');

const config = require('../config/config');
const securityDeviceModule = require('../server/service/device/securityDevice');

//全局变量
let Clients = [];           //已连接的客户端
//[{gatewayMac,instructions[string,string]},{}]
let ConsoleOfControl = [];      //分别存储每个网关的控制台消息
let ConsoleOfSecurity = [];
let ConsoleOfNetworking = [];

/**
 * 向网关发送写指令
 * @param instruction   String形式的指令
 * 控制命令的长度为25 byte
 */
exports.writeCommand = instruction => {
    console.log('write command');
    console.log('instruction:' + instruction);
    // console.log('instruction length:' + instruction.length);

    //let buf = new Buffer(25);
    let length = Math.floor(instruction.length / 2);
    //console.log(Math.floor(instruction.length/2));
    let buf = new Buffer(Math.floor(instruction.length / 2));
    //buf.write('FC0015000120202020200801100100124B000FF6AA36080018', 0, 25, 'hex');
    //buf.write('FC0015000120202020200801100100124B000FF6AA36080119', 0, 25, 'hex');
    //FC 0015 0001 202020202008 01 1001 00124B000FF6AA36 0801 19
    //FC 0015 0001 202020303008 01 1001 000D6F000BE63DC4 0101 5A'


    // DeprecationWarning: Buffer() is deprecated due to security and usability
    // issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(),
    // or Buffer.from() methods instead.


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
 * 获取控制台消息
 * @param gateways      网关（数组）
 * @param type          控制台的类型
 */
exports.getConsole = (gateways, type) => {
    let tempConsole;
    let response;
    let consoleResult = [];
    switch (type) {
        case 'control': {
            tempConsole = ConsoleOfControl;
            break;
        }
        case 'security': {
            tempConsole = ConsoleOfSecurity;
            break;
        }
        case 'networking': {
            tempConsole = ConsoleOfNetworking;
            break;
        }
        default : {
            response = {
                errorCode: 1000,
                message: '类型有误'
            }
        }
    }

    for (let i = 0; i < gateways.length; i++) {
        for (let j = 0; j < tempConsole.length; j++) {
            if (validator.trim(tempConsole[j].gatewayMac) === validator.trim(gateways[i].mac)) {
                consoleResult.push(tempConsole[j]);
            }
        }
    }

    response = {
        errorCode: 0,
        consoleResult
    };
    return response;
};

function pushConsole(instruction) {
    let gatewayMac = instruction.substr(10, 12);
    let gatewayExists = false;
    let tempConsoleItem = {};       //如当前不存在，则用此变量保存一条console项
    let tempInstructions = [];

    if (instruction.substring(0, 6) === 'FC000C') {

    }
    if (instruction.substring(0, 6) === 'FC0016' || instruction.substring(0, 6) === 'FC0015') {
        for (let i = 0; i < ConsoleOfControl.length; i++) {
            if (ConsoleOfControl[i].gatewayMac === gatewayMac) {
                gatewayExists = true;
                ConsoleOfControl[i].instructions.push(instruction);
                if (ConsoleOfControl[i].instructions.length > 10) {
                    ConsoleOfControl[i].instructions.splice(0, 1);
                }
            }
        }
        if (!gatewayExists) {
            tempInstructions.push(instruction);
            tempConsoleItem = {
                gatewayMac,
                instructions: tempInstructions
            };
            ConsoleOfControl.push(tempConsoleItem);
        }
    }
    if (instruction.substring(0, 6) === 'FC0018') {
        for (let i = 0; i < ConsoleOfSecurity.length; i++) {
            if (ConsoleOfSecurity[i].gatewayMac === gatewayMac) {
                gatewayExists = true;
                ConsoleOfSecurity[i].instructions.push(instruction);
                if (ConsoleOfSecurity[i].instructions.length > 10) {
                    ConsoleOfSecurity[i].instructions.splice(0, 1);
                }
            }
        }
        if (!gatewayExists) {
            tempInstructions.push(instruction);
            tempConsoleItem = {
                gatewayMac,
                instructions: tempInstructions
            };
            ConsoleOfSecurity.push(tempConsoleItem);
        }
    }

}


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

        //解析多条指令并在一起的情况


        //console.log(Clients);
        let instruction = data.toString();
        instruction = instruction.toUpperCase();
        pushConsole(instruction);
        // console.log('\nconsoleOfcontrol:');
        // console.log(ConsoleOfControl);

        /**
         * 判断从网关传来的数据类型
         * 长度0C：网关连接确认
         * 长度18：门磁状态，红外感应状态
         * 其他长度：心跳包
         */

        // fc000c00012020203030080301010127 网关连接
        //fc000c00012020203030080301010127fc0030000120202030300803010203000d6f000be63dc401005100005043c9a339556c01010ecb005043c90324399601010dc11e
        //心跳包

        if (instruction.substring(0, 6) === 'FC000C') {
            // console.log('网关连接:  ' + Date());
        }
        if (instruction.substring(0, 6) === 'FC0015') {

        }
        if (instruction.substring(0, 6) === 'FC0016') {

        }
        if (instruction.substring(0, 6) === 'FC0018') {
            if (instruction.substring(24, 26) === '30') {            //报警设备
                if (instruction.substring(46, 50) === '010D') {           //门磁
                    //fc0018 000130eb1f03d0dd03 3002 005043c903246e27 01 0402 0102 52  旧版
                    //fc0018 000120202030300803 3002 005043c903243996 01 010d 0102 5c  门磁打开
                    //fc0018 000120202030300803 3002 005043c903243996 01 010d 0002 5d  门磁关闭
                    //fc0018 000120202030300803 3002 005043c9a339556c 01 010e 0101 77  红外
                    //fc0018 000120202030300803 3002 005043c9a339556c 01 010e 0001 76


                    console.log('门磁指令');
                    securityDeviceModule.formatInstruction(instruction).then(response => {
                        console.log(response.message);
                    }, err => {
                        console.log(err);
                    });
                }
                else if (instruction.substring(46, 50) === '010E') {
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