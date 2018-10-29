const asyncModule = require('async');
const validator = require('validator');
var userModel = require('../../model/user');

//用户登录
exports.login = async (ctx) => {
    let {username, password} = ctx.request.body;
    let response = {};
    username = validator.trim(username);
    password = validator.trim(password);
    let userEntity = {
        username,
        password
    };

    return new Promise((resolve, reject) => {
        //参数验证
        if (username == '' || password == '') {
            response = {
                errorCode: 600,
                message: '用户名/密码格式有误'
            };
        }

        userModel.findOne(userEntity, function (err, result) {
            if (err) {
                console.log('数据库查询用户异常');
                reject(err);
            }
            else if (result) {
                console.log('数据库查询用户成功');
                response = {
                    errorCode: 0,
                    message: '登录成功',
                    user: result
                };
                resolve(response);
            }
            else {
                console.log('用户名或密码错误');
                response = {
                    errorCode: 600,
                    message: '用户名或密码错误'
                };
                resolve(response);
            }
        });
    });

};

exports.logout = async (ctx) => {
    return new Promise((resolve, reject) => {

    });
};

function insert() {
    let userEntity = new userModel({
        username: 'lisi',
        password: 'abcdefg',
        userNumber: '1800125001'
    });

    userEntity.save(function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(result);
        }
    })

}

function retrieve() {
    let userEntity = {
        'username': 'zhangsan'
    };
    userModel.find(userEntity, function (err, result) {
        console.log(console.log(result));
    });
}

// insert();
// retrieve();
