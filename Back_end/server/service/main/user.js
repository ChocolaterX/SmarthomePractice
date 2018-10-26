import async from 'async'

var userModel = require('../../model/user');



// exports.login = async (ctx, callback) => {
exports.login = async (ctx) => {
    let {username, password} = ctx.request.body;
    let response = {};
    let userEntity = {
        username,
        password
    };


    return new Promise((resolve, reject) => {



        /*userModel.findOne(userEntity, function (err, result) {
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
        });*/
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
