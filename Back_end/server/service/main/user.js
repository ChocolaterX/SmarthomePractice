var userModel = require('../../model/user');


// exports.login = async (ctx, callback) => {
exports.login = async (ctx) => {
    let {username} = ctx.request.body;
    let response = {};
    let userEntity = {
        username
    };

    //逻辑不够，稍后补充
    return new Promise((resolve, reject) => {
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
                console.log('未找到该用户');
                response = {
                    errorCode: 600,
                    message: '未找到该用户'
                };
                resolve(response);
            }
        });
    });

    //逻辑不够，稍后补充
    /*userModel.findOne(userEntity, function (err, result) {
        if (err) {
            console.log('数据库查询用户异常');
            response = {
                errorCode: 600,
                message: '查找用户异常'
            }
        }
        else if (result) {
            console.log('数据库查询用户成功');
            response = {
                errorCode: 0,
                message: '登录成功'
            }
        }
        else {
            console.log('未找到该用户');
            response = {
                errorCode: 600,
                message: '未找到该用户'
            }
        }

        return new Promise((resolve, reject) => {
            console.log(response);
            if (response.errorCode === 0) {
                resolve(response);
            }
            else {
                reject();
            }
        });
    });*/
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
