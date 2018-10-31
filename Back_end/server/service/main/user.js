const asyncModule = require('async');
const validator = require('validator');
const userModel = require('../../model/user');

//用户登录
exports.login = async ctx => {
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
        if (username === '' || password === '') {
            response = {
                errorCode: 600,
                message: '用户名/密码格式有误'
            };
            reject(response);
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

//注销token和session
exports.logout = async ctx => {
    let response = {};
    return new Promise((resolve, reject) => {
        response = {
            errorCode: 0,
            message: '注销成功'
        };
        resolve(response);
    });
};

exports.info = async ctx => {
    let response = {};
    let userId = ctx.request.header.userid;         //header中不区分大小写
    let userEntity = {_id: userId};
    return new Promise((resolve, reject) => {
        userModel.findOne(userEntity, (err, result) => {
            if (err) {
                console.log('数据库查询用户异常');
                reject(err);
            }
            else if (result) {
                response = {
                    errorCode: 0,
                    message: '查询个人信息成功',
                    user: result
                };
                resolve(response);
            }
            else {
                response = {
                    errorCode: 600,
                    message: '未找到当前用户'
                };
                resolve(response);
            }
        });
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
