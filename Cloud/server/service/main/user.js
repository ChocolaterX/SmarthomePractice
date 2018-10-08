/**
 * <copyright file="user.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>11/21/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var User = mongoose.model('User');
var validator = require('validator');
var config = require('../../../config/config');
var jwt = require('jsonwebtoken');
var emailExp = config.constants.emailExp;
var phoneExp = config.constants.phoneExp;
var passwordExp = config.constants.passwordExp;
var self = this;

//创建普通用户账户
exports.create = function (req, res) {
    var loginName = req.body.loginName;
    var email = req.body.email;
    var password = req.body.password;

    if (!loginName) {
        return res.json({
            errorCode: 1202,
            message: '账号格式不正确'
        });
    }
    if (!email) {
        return res.json({
            errorCode: 1208,
            message: '邮箱为空'
        });
    }
    if (!emailExp.test(email)) {
        return res.json({
            errorCode: 1207,
            message: '邮箱格式不正确。'
        })
    }
    if (!password) {

        return res.json({
            errorCode: 1205,
            message: '密码为空'
        });
    }
    if (!passwordExp.test(password)) {
        return res.json({
            errorCode: 1203,
            message: '密码格式不正确。'
        })
    }

    var criteria = {
        loginName: loginName,
        email: email,
        password: password,
        name: null,        //户主名字
        iid: null,          //户主身份证
        address: null,         //地址
        phone: null,           //联系电话
        remark: null,          //备注
        removed: false,
        locked: 0,
        loginFailCount: 0
    };
    var findLoginName = {
        removed: false,
        loginName: loginName
    };

    var findEmail = {
        removed: false,
        email: email
    };

    User.count(findLoginName, function (in_err1, loginNameCount) {
        if (in_err1) {
            return res.json({
                errorCode: 500,
                message: in_err1.message
            });
        }
        if (loginNameCount > 0) {
            return res.json({
                errorCode: 1201,
                message: '账号已被注册'
            });
        } else {
            User.count(findEmail, function (in_err2, emailCount) {

                if (in_err2) {
                    return res.json({
                        errorCode: 500,
                        message: in_err2.message
                    });
                }
                if (emailCount > 0) {

                    return res.json({
                        errorCode: 1206,
                        message: '邮箱已被注册'
                    });
                } else {
                    var user = new User(criteria);
                    user.save(function (err) {
                        if (err) {
                            return res.json({
                                errorCode: 500,
                                message: err.message
                            });
                        }
                        else {
                            return res.json({
                                errorCode: 0,
                                userId: user._id
                            });
                        }
                    });
                }
            });
        }

    })
}

//用户登录
exports.login = function (req, res) {


    var loginName = req.body.loginName;
    var password = req.body.password;

    if (!loginName || !password) {
        return res.json({
            errorCode: 101,
            message: "账号或密码为空"
        })
    }
    var query = {
        loginName: loginName,
        removed: false
    };

    User.findOne(query)
        .exec(function (err, user) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                })
            }
            else {
                //if (!user || !user.authenticate(password)) {
                //    return res.json({
                //        errorCode: 102,
                //        message: "账号不存在或密码不正确"
                //    })
                //
                if (!user) {
                    return res.json({
                        errorCode: 102,
                        message: "账号不存在"
                    })
                }
                else if (!user.authenticate(password)) {
                    return res.json({
                        errorCode: 103,
                        message: "密码不正确"
                    })
                } else {
                    return res.json({
                        errorCode: 0,
                        user: user,
                        timeout: config.jwt.expiresInMinutes,
                        userToken: createToken(user)
                    });
                }
            }
        });
};


//用户登出
//webtoken并未处理
exports.logout = function (req, res) {
    return res.json({
        message: 'logout',
        errorCode: 0
    });
};

//用户重置密码
exports.resetPassword = function (req, res) {
    var userId = req.user.current._id;

    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;

    if (!oldPassword) {
        return res.json({
            errorCode: 1210,
            message: '原密码为空'
        });
    }
    if (!newPassword) {
        return res.json({
            errorCode: 1211,
            message: '新密码为空'
        });
    }
    if (oldPassword == newPassword) {
        return res.json({
            errorCode: 1204,
            message: '原密码与新密码一样'
        });
    }


    User.findById(userId, function (err, user) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
        else if (!user || user.removed == true) {
            return res.json({
                errorCode: 1209,
                message: '用户不存在'
            });
        }

        else {
            if (user.authenticate(oldPassword)) {
                var hashed_password = user.encryptPassword(newPassword);
                User.update({_id: userId}, {$set: {hashed_password: hashed_password}}, function (err, count) {
                    if (err) {
                        return res.json({
                            errorCode: 500,
                            message: err.message
                        });
                    }
                    if (count) {
                        return res.json({
                            errorCode: 0
                        });
                    } else {
                        return res.json({
                            errorCode: 500,
                            message: '修改密码失败'
                        });
                    }
                });
            } else {
                return res.json({
                    errorCode: 103,
                    message: '原密码不正确'
                })
            }

        }
    });
};

//用户个人信息
exports.info = function (req, res) {
    var userId = req.user.current._id;

    var criteria = {
        _id: userId,
        removed: false
    };

    User.findOne(criteria, function (err, user) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        } else {
            if (!user) {
                return res.json({
                    errorCode: 1212,
                    message: "用户不存在"
                });


            } else {
                return res.json({
                    errorCode: 0,
                    user: user
                });
            }
        }
    })


};

//修改用户个人信息
exports.update = function (req, res) {
    var userId = req.user.current._id;

    var name = req.body.name;      //户主名字
    var iid = req.body.iid;       //户主身份证
    var phone = req.body.phone;   //联系电话
    var address = req.body.address;//地址
    var remark = req.body.remark;   //备注

    var criteria = {
        removed: false
    };

    if (name) {
        criteria['name'] = name
    }

    if (iid) {
        criteria['iid'] = iid
    }

    if (phone) {
        criteria['phone'] = phone
    }

    if (address) {
        criteria['address'] = address
    }

    if (remark) {
        criteria['remark'] = remark
    }


    User.findByIdAndUpdate(userId, criteria, function (err, user) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
        else {
            if (!user) {
                return res.json({
                    errorCode: 1212,
                    message: '用户不存在'
                });
            } else {
                return res.json({
                    errorCode: 0,
                    userId: user._id
                });
            }
        }
    })
};


/**
 * 旧版本的token使用的参数与新版本不同
 * 已弃用
 */
//function createToken(user) {
//    return jwt.sign({current: user}, config.jwt.secret, {expiresInMinutes: config.jwt.expiresInMinutes});
//}

function createToken(user) {
    //console.log('\n token');
    //console.log(jwt.sign({current: user}, config.jwt.secret, {expiresIn: 60}))
    return jwt.sign({current: user}, config.jwt.secret, {expiresIn: 60 * 60 * 24 * 7});
}
