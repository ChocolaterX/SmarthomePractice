const net = require('net');
const validator = require('validator');

const config = require('../config/config');
const securityDeviceModule = require('../server/service/device/securityDevice');

//**************
//全局变量
let Clients = [];           //已连接的客户端
//以下三个Console变量的格式为[{gatewayMac,instructions[string,string]},{}]
let ConsoleOfControl = [];      //分别存储每个网关的控制台消息
let ConsoleOfSecurity = [];
let ConsoleOfNetworking = [];

//设备心跳包格式为[{gatewayMac, devices[string, string]},{}],其中string为单条指令+状态+商品号
let devicesHeartbeat = [];
//*************

/**
 * 向网关发送写指令
 * @param instruction   String形式的指令
 * 控制命令的长度为25 byte
 */
exports.writeInstruction = instruction => {
    console.log('write instruction');
    console.log('instruction:' + instruction);
    // console.log('instruction length:' + instruction.length);

    //let buf = new Buffer(25);
    let length = Math.floor(instruction.length / 2);
    let buf = new Buffer(Math.floor(instruction.length / 2));
    //buf.write('FC0015000120202020200801100100124B000FF6AA36080018', 0, 25, 'hex');
    //buf.write('FC0015000120202020200801100100124B000FF6AA36080119', 0, 25, 'hex');

    // DeprecationWarning: Buffer() is deprecated due to security and usability
    // issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(),
    // or Buffer.from() methods instead.

    buf.write(instruction, 0, length, 'hex');

    for (let i = 0; i < Clients.length; i++) {
        Clients[i].write(buf);
    }
    if (Clients.length === 0) {
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

/**
 * 获取心跳包的设备
 * @param gateways
 */
exports.getDevicesFromHeartbeat = (gateways) => {
    let response;
    let devices = [];
    for (let i = 0; i < gateways.length; i++) {
        for (let j = 0; j < devicesHeartbeat.length; j++) {
            if (devicesHeartbeat[j].gatewayMac === gateways[i].mac) {
                devices.push(...devicesHeartbeat[j].devices);
                break;
            }
        }
    }
    response = {
        errorCode: 0,
        devices
    };
    return response;
};

/**
 * 服务器获取网关的消息之后将该指令推送到相应的变量
 * 包括：控制设备控制台，安防设备控制台，设备心跳包
 * @param instruction   单条指令
 */
function recordInstruction(instruction) {
    let gatewayMac = instruction.substr(10, 12);
    let gatewayExists = false;
    let tempConsoleItem = {};       //如当前不存在，则用此变量保存一条console项
    let tempInstructions = [];

    //网关连接
    if (instruction.substring(0, 6) === 'FC000C') {

    }

    //控制设备反馈
    else if (instruction.substring(0, 6) === 'FC0016' || instruction.substring(0, 6) === 'FC0015') {
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

    //安防设备消息
    else if (instruction.substring(0, 6) === 'FC0018') {
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

    //心跳包，长度不定
    else {
        let index = 30;         //心跳包第一个设备的下标
        let devices = [];       //String array eg:'005043c9a339556c 01010e00'
        let tempDevicesHeartbeatItem;

        while (index < instruction.length-24) {
            devices.push(instruction.substr(index, 24));
            index = index + 24;
        }

        for (let i = 0; i < devicesHeartbeat.length; i++) {
            if (devicesHeartbeat[i].gatewayMac === gatewayMac) {
                gatewayExists = true;
                devicesHeartbeat[i].devices = devices;
            }
        }
        if (!gatewayExists) {
            tempDevicesHeartbeatItem = {
                gatewayMac,
                devices
            };
            devicesHeartbeat.push(tempDevicesHeartbeatItem);
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

        let instructions = [];
        let instruction = data.toString();
        instruction = instruction.toUpperCase();
        //解析多条指令并在一起的情况
        if (instruction.lastIndexOf('FC') !== 0) {
            let secondIndex = 1;
            let substring = '';
            while (instruction.lastIndexOf('FC') !== 0) {
                secondIndex = instruction.indexOf('FC', 1);
                substring = instruction.substring(0, secondIndex);
                instructions.push(substring);
                instruction = instruction.substring(secondIndex);
            }
            instructions.push(instruction);
        }
        else {
            instructions.push(instruction);
        }

        // console.log(instructions);

        for (let i = 0; i < instructions.length; i++) {
            recordInstruction(instructions[i]);

            /**
             * 判断从网关传来的数据类型
             * 长度0C：网关连接确认
             * 长度15：控制设备命令应答
             * 长度16：控制设备状态变化上报
             * 长度18：门磁状态，红外感应状态
             * 其他长度：心跳包
             */
            if (instructions[i].substring(0, 6) === 'FC000C') {
                // console.log('网关连接:  ' + Date());
            }
            if (instructions[i].substring(0, 6) === 'FC0015') {

            }
            if (instructions[i].substring(0, 6) === 'FC0016') {

            }
            if (instructions[i].substring(0, 6) === 'FC0018') {
                if (instructions[i].substring(24, 26) === '30') {            //报警设备
                    if (instructions[i].substring(46, 50) === '010D') {           //门磁
                        //fc0018 000130eb1f03d0dd03 3002 005043c903246e27 01 0402 0102 52  旧版
                        //fc0018 000120202030300803 3002 005043c903243996 01 010d 0102 5c  门磁打开
                        //fc0018 000120202030300803 3002 005043c903243996 01 010d 0002 5d  门磁关闭
                        //fc0018 000120202030300803 3002 005043c9a339556c 01 010e 0101 77  红外
                        //fc0018 000120202030300803 3002 005043c9a339556c 01 010e 0001 76

                        console.log('门磁指令');
                        securityDeviceModule.formatInstruction(instructions[i]).then(response => {
                            console.log(response.message);
                        }, err => {
                            console.log(err);
                        });
                    }
                    else if (instruction.substring(46, 50) === '010E') {
                        console.log('红外感应指令');
                        securityDeviceModule.formatInstruction(instructions[i]).then(response => {
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

        }


    });

    //add set client keep alive
    client.setKeepAlive(true);

    client.setTimeout(2 * 60 * 1000, function () {
        client.end("Connection: close\r\n\r\n");
        client.destroy();
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