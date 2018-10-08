/**
 * Expose
 */

var path = require('path');

module.exports = {
    cloud: {
        /* mongodb */
        db: 'mongodb://192.168.10.152:27017/smarthome',
        //db:'mongodb://localhost/smarthome',
        socketPort: 7702
    },

    jwt: {
        secret: 'smarthome',
        expiresInMinutes: 60 * 24 * 7
    },

    view: {
        welcome: path.join(__dirname, '../../server/view/welcomeMail.html'),
        forget: path.join(__dirname, '../../server/view/forgetMail.html')
    },

    driver: {
        rootpath: path.join(__dirname, '../../driver'),
        gatewayDriver: path.join(__dirname, '../../server/service/gateway/driver')
    },

    admin: {
        user: {
            email: 'admin',
            password: 'admin'
        }
    },

    constants: {
        baseUrl: 'http://127.0.0.1:5201',

        postmark: "41079a12-e90c-46e8-bba8-d7e402af2a1c",

        recoveryPasswordDue: 60 * 60 * 1000,

        forgetPasswordDue: 60 * 60 * 1000,

        lockLoginDue: 2 * 60 * 60 * 1000,

        phoneExp: /^1\d{10}$/,

        idCardExp: /(^\d{15}$)|(^\d{17}([0-9]|X)$)/,

        nameExp: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,

        emailExp: /([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?$/i,

        passwordExp: /^[a-zA-Z0-9]\w{5,20}$/,

        gatewayLogKey: 'huasys.taghome.gatewaykey'
    },

    local: {
        /* uploads */
        uploads: path.join(__dirname, '../../uploads'),
        /* storage */
        storage: path.join(__dirname, '../../storage'),
    },

    field: {
        icon: 'icon',
        preview: 'preview',
        driver: 'driver'
    },
    jpush: {
        appKey: '47b9ae7e08c06fa6dab44d12',
        masterSecret: '87f9642b66d880f2a4e10da2',
        title: 'GreenOrbs智能家居',
        temperature: 40,
        temperatureContent: '当前环境气温过高',
        doorCloseContent: '门磁关闭',
        doorOpenContent: '门磁打开',
        humidity: 45,
        humidityContent: '当前环境湿度过大',
        gasdetection: 15,
        gasdetectionContent: '当前环境有害气体超标'
    }
};
