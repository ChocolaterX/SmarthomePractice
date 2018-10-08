/**
 * <copyright file="admin.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>11/23/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var mongoose = require('../../cloud_db_connect');
var User = mongoose.model('User');
var Admin = mongoose.model('Admin');
var validator = require('validator');
var config = require('../../../config/config');
//var log4j = require('log4js').getLogger();
var jwt = require('jsonwebtoken');
var async = require('async');
var emailExp = config.constants.emailExp;
var phoneExp = config.constants.phoneExp;
var passwordExp = config.constants.passwordExp;
var self = this;

//创建管理员账户
exports.create = function (req, res) {

    var loginName = req.body.loginName;
    var email = req.body.email;
    var password = req.body.password;

    if (!loginName) {
        return res.json({
            errorCode: 1102,
            message: '账号格式不正确'
        });
    }


    if (!email) {
        return res.json({
            errorCode: 1108,
            message: '邮箱为空'
        });
    }
    if (!emailExp.test(email)) {
        return res.json({
            errorCode: 1107,
            message: '邮箱格式不正确。'
        })
    }
    if (!password) {

        return res.json({
            errorCode: 1105,
            message: '密码为空'
        });
    }
    if (!passwordExp.test(password)) {
        return res.json({
            errorCode: 1103,
            message: '密码格式不正确。'
        })
    }

    var criteria = {

        loginName: loginName,
        email: email,
        password: password,
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


    Admin.count(findLoginName, function (in_err1, loginNameCount) {
        if (in_err1) {
            return res.json({
                errorCode: 500,
                message: in_err1.message
            });
        }
        if (loginNameCount > 0) {

            return res.json({
                errorCode: 1101,
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
                        errorCode: 1106,
                        message: '邮箱已被注册'
                    });
                } else {
                    var admin = new Admin(criteria);
                    admin.save(function (err) {
                        log4j.debug('save[' + admin + "]");
                        if (err) {
                            log4j.error('it fails to save the admin');
                            log4j.error(err);
                            return res.json({
                                errorCode: 500,
                                message: err.message
                            });
                        }
                        else {
                            log4j.info('Create admin success.');
                            return res.json({
                                errorCode: 0,
                                adminId: admin._id
                            });
                        }
                    });
                }
            });
        }

    })
}


//管理员登录
exports.login = function (req, res) {


    var loginName = req.body.loginName;
    var password = req.body.password;

    if (!loginName || !password) {

        return res.json({
            errorCode: 101,
            message: "账号或密码为空"
        })
    }

    //admin
    if (config.admin.user && config.admin.user.email == loginName &&
        config.admin.user.password == password) {
        var admin = {
            id: null,
            name: 'SUPER',
            email: config.admin.user.email,
            roles: ['admin']
        };
        return res.json({
            errorCode: 0,
            admin: admin,
            timeout: config.jwt.expiresInMinutes,
            adminToken: createToken(admin)
        });
    } else {

        var query = {
            loginName: loginName,
            removed: false
        }


        Admin.findOne(query)

            .exec(function (err, admin) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    })
                }
                else {

                    if (!admin || !admin.authenticate(password)) {
                        return res.json({
                            errorCode: 102,
                            message: "账号不存在或密码不正确"
                        })


                    } else {
                        return res.json({
                            errorCode: 0,
                            admin: admin,
                            timeout: config.jwt.expiresInMinutes,
                            adminToken: createToken(admin),

                        });


                    }

                }


            });


    }


};


//管理员登出
exports.logout = function (req, res) {
    return res.json({
        errorCode: 0
    });
}


//获取用户个人信息(管理员)
exports.userInfo = function (req, res) {
    var userId = req.body.userId;

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
                    errorCode: 1109,
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


//查看用户列表（管理员）
exports.userList = function (req, res) {

    var loginName = req.body.loginName;
    var pageIndex = validator.toInt(req.body.pageIndex) >= 0 ? validator.toInt(req.body.pageIndex) : 0;
    var pageSize = validator.toInt(req.body.pageSize) >= 0 ? validator.toInt(req.body.pageSize) : 10;


    var criteria = {
        removed: false
    }
    if (loginName) {
        criteria['loginName'] = new RegExp(loginName);
    }

    User.count(criteria, function (err, count) {
        User.find(criteria, null, {
            sort: {updatedTime: -1},
            skip: (pageIndex * pageSize),
            limit: pageSize
        }, function (err, users) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            }
            else if (!users) {
                return res.json({
                    errorCode: 1212,
                    message: '用户不存在'
                });
            }
            else {
                return res.json({
                    errorCode: 0,
                    totalRecords: count,
                    users: users
                });
            }
        });
    });
};


//重置用户密码（管理员）
exports.userPWD = function (req, res) {

    var userId = req.body.userId;
    var defaultPWD = '123456';
    var criteria = {
        _id: userId,
        removed: false
    }

    User.findOne(criteria, function (err, user) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
        else if (!user) {
            return res.json({
                errorCode: 1109,
                message: '用户不存在'
            });
        }
        else {

            var hashed_password;

            hashed_password = user.encryptPassword(defaultPWD);

            User.update(criteria, {'hashed_password': hashed_password}, {multi: true}, function (err, count) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                if (count) {
                    return res.json({
                        errorCode: 0,
                        message: '重置密码成功'
                    });
                } else {
                    return res.json({
                        errorCode: 500,
                        message: '重置密码失败'
                    });
                }
            });


        }
    });
}


//冻结用户（管理员）
exports.userLock = function (req, res) {

    var criteria;
    var __count;

    criteria = {'_id': {$in: req.body.userIds}};
    __count = req.body.userIds.length;

    User.count(criteria, function (err_in, count) {
        if (err_in) {
            return res.json({
                errorCode: 500,
                message: err_in.message
            });
        }
        if (count < __count) {
            return res.json({
                errorCode: 1109,
                message: '用户不存在'
            });
        } else {
            User.update(criteria, {$set: {locked: 2}}, {multi: true}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                else {
                    return res.json({
                        errorCode: 0
                    });
                }
            });
        }
    });
};


//解冻用户（管理员）
exports.userUnlock = function (req, res) {
    var criteria;
    var __count;
    criteria = {'_id': {$in: req.body.userIds}};
    __count = req.body.userIds.length;


    User.count(criteria, function (err_in, count) {
        if (err_in) {
            return res.json({
                errorCode: 500,
                message: err_in.message
            });
        }
        if (count < __count) {
            return res.json({
                errorCode: 1109,
                message: '用户不存在'
            });
        } else {
            User.update(criteria, {$set: {locked: 0}}, {multi: true}, function (err) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                else {
                    return res.json({
                        errorCode: 0
                    });
                }
            });
        }
    });
};


//删除用户（管理员）
//未完成  //将与用户相关的表删除（列如：用户设备表、情景模式表等）
exports.userDelete = function (req, res) {
    var criteria = {'_id': {$in: req.body.userIds}};
    var __count = req.body.userIds.length;

    async.waterfall([
        //检查已选定的用户是否已经被删除
        function (callback) {
            User.count(criteria, function (err, count) {
                if (err) {
                    callback({
                            errorCode: 500,
                            message: error.message
                        },
                        null);
                }
                if (count < __count) {
                    callback({
                            errorCode: 1109,
                            message: '用户不存在'
                        },
                        null);

                } else {
                    callback(null);
                }
            })
        },
        //将用户的removed设置成true
        function (callback) {
            User.update(criteria, {$set: {removed: true}}, {multi: true}, function (err) {
                if (err) {
                    callback({
                            errorCode: 500,
                            message: error.message
                        },
                        null);

                } else {
                    callback(null);
                }
            })
        },
        //将与用户相关的表删除（列如：用户设备表、情景模式表等）


    ], function (error, result) {
        if (error) {

            if (error.errorCode) {
                return res.json({
                    errorCode: error.errorCode,
                    message: error.message
                });
            } else {
                return res.json({
                    errorCode: 500,
                    message: error.message
                });
            }

        } else {

            return res.json({
                errorCode: 0

            });
        }
    })


}


//查看管理员列表（超管用）
exports.list = function (req, res) {

    var loginName = req.body.loginName;
    var pageIndex = validator.toInt(req.body.pageIndex) >= 0 ? validator.toInt(req.body.pageIndex) : 0;
    var pageSize = validator.toInt(req.body.pageSize) >= 0 ? validator.toInt(req.body.pageSize) : 10;


    var criteria = {
        removed: false
    }
    if (loginName) {
        criteria['loginName'] = new RegExp(loginName);
    }

    Admin.count(criteria, function (err, count) {
        Admin.find(criteria, null, {
            sort: {updatedTime: -1},
            skip: (pageIndex * pageSize),
            limit: pageSize
        }, function (err, admins) {
            if (err) {
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            }
            else if (!admins) {
                return res.json({
                    errorCode: 1109,
                    message: '用户不存在'
                });
            }
            else {
                return res.json({
                    errorCode: 0,
                    totalRecords: count,
                    admins: admins
                });
            }
        });
    });
};

//删除管理员（超管用）
exports.delete = function (req, res) {
    var criteria = {'_id': {$in: req.body.adminIds}};
    var __count = req.body.adminIds.length;
    Admin.count(criteria, function (err, count) {
        if (err) {
            return res.json({
                errorCOde: 500,
                message: err.message
            });
        }
        if (count < __count) {
            return res.json({
                errorCode: 1109,
                message: '用户不存在'
            });
        } else {

            Admin.update(criteria, {$set: {removed: true}}, {multi: true}, function (err) {
                if (err) {

                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                else {
                    return res.json({
                        errorCode: 0,
                        adminIds: req.body.adminIds
                    });

                }
            });
        }
    });


}

//修改管理员账号信息（超管）
exports.update = function (req, res) {
    var adminId = req.body.adminId;
    var password = req.body.password;
    var email = req.body.email;
    var criteria = {
        _id: adminId,
        removed: false
    };

    var updateCriteria = {};


    if (email) {
        if (!emailExp.test(email)) {
            return res.json({
                errorCode: 1107,
                message: '邮箱格式不正确。'
            })
        } else {
            updateCriteria['email'] = email;
        }
    }


    if (password && (!passwordExp.test(password))) {
        return res.json({
            errorCode: 1103,
            message: '密码格式不正确。'
        })
    }

    Admin.findOne(criteria, function (err, admin) {
        if (err) {
            return res.json({
                errorCode: 500,
                message: err.message
            });
        }
        else if (!admin) {
            return res.json({
                errorCode: 1109,
                message: '用户不存在'
            });
        }
        else {
            var hashed_password;
            if (password) {

                hashed_password = admin.encryptPassword(password);

                updateCriteria['hashed_password'] = hashed_password;
            }

            Admin.update(criteria, updateCriteria, {multi: true}, function (err, count) {
                if (err) {
                    return res.json({
                        errorCode: 500,
                        message: err.message
                    });
                }
                if (count) {
                    return res.json({
                        errorCode: 0,
                        adminId: adminId,
                        message: '修改管理员信息成功'
                    });
                } else {
                    return res.json({
                        errorCode: 500,
                        message: '修改管理员信息失败'
                    });
                }
            });


        }
    });
}


function createToken(admin) {
    return jwt.sign({current: admin}, config.jwt.secret, {expiresIn: 60 * 60 * 24});
};