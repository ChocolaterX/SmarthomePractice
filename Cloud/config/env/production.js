/**
 * Expose
 */
var path = require('path');
module.exports = {
  cloud: {
        /* mongodb */
        db: 'mongodb://10.43.101.29/taghome2_dev',  //develop
        //db: 'mongodb://10.43.101.29/taghome2_pro',  //production
        socketPort: 5009
    },

    jwt: {
        secret: 'taghome_version_2',
        //expiresInMinutes: 7*24*60
        expiresInMinutes: 5
    },

    view:{
        welcome: path.join(__dirname, '../../server/view/welcomeMail.html'),
        forget: path.join(__dirname, '../../server/view/forgetMail.html')
    },

    driver: {
        rootpath: path.join(__dirname, '../../driver')
    },

    admin: {
        user: {
            email: 'admin@huasys.com',
            password: 'huasysadmin'
        }
    },

    constants:{
        baseUrl:'http://127.0.0.1:5201',

        postmark : "d60b6196-23a1-493a-bbb2-28622d20495e",

        recoveryPasswordDue: 60*60*1000,

        forgetPasswordDue: 60*60*1000,

        lockLoginDue: 2*60*60*1000,

        phoneExp:/^1\d{10}$/,

        idCardExp:/(^\d{15}$)|(^\d{17}([0-9]|X)$)/,

        nameExp : /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,

        emailExp : /([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?$/i,

        passwordExp : /^[a-zA-Z]\w{5,20}$/
    },

    local: {
        /* uploads */
        uploads: path.join(__dirname, '../../uploads'),
        /* storage */
        storage: path.join(__dirname, '../../storage'),
    },

    field:{
        icon:'icon',
        preview:'preview',
        driver: 'driver'
    },
    jpush:{
        appKey: '23ede232ef4275ad5428e0ea',
        masterSecret: '5e163eac21f361470b317414',
        title:'GreenOrbs智能家居',
        temperature:40,
        temperatureContent:'当前环境气温过高',
        doorCloseContent:'门磁关闭',
        doorOpenContent:'门磁打开',
        humidity:45,
        humidityContent:'当前环境湿度过大',
        gasdetection:15,
        gasdetectionContent:'当前环境有害气体超标'
    }

};
