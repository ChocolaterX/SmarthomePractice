/**
 * Created by Lei Yang on 2015/4/25.
 */

var mongoose = require('../cloud_db_connect');
var UserModel = mongoose.model('User');
//var Role= mongoose.model('Role');
var postmark = require("postmark");
var fs = require('fs');
var async = require('async');
var config = require('../../config/config');
//var log = require('log4js').getLogger();
var randomstring = require("randomstring");
var jwt     = require('jsonwebtoken');


var nameExp = config.constants.nameExp;
var emailExp = config.constants.emailExp;
var passwordExp = config.constants.passwordExp;

var self = this;

var postmarkClient = new postmark.Client(config.constants.postmark);

exports.signup = function (req, res) {

    try {
        var email = req.body.email;
        var password = req.body.password;
        var roles = [];
        /*
        if(req.body.role === 'admin'){
            roles.push('admin');
        } else {
            roles.push('normal');
        }
        */
        roles.push('admin');

        log.debug('sigup['+email+"]");

        if(!emailExp.test(email)){
            //log.info('the email is invalid.')
            return res.json({
                errorCode: 106,
                message:'invalid email'
            })
        }

        if(!passwordExp.test(password)){
            //log.info('the password is invalid.')
            return res.json({
                errorCode:107,
                message:'invalid password'
            });
        }

        async.waterfall([
            //判断邮箱是否已经注册
            function(callback){
                //log.debug('check the mail');
                UserModel.findOne({email:email},function(err,user){
                    if(err){
                        log.error(err);
                        callback({errorCode:500},null);
                    }else if(user){
                        log.error('the email exists.');
                        callback({errorCode:110},null);
                    }else{
                        callback(null);
                    }
                })
            },
            //创建用户
            function(callback){
                //log.debug('add the new user.');
                var user = new UserModel({
                    email: email,
                    password: password,
                    roles: roles
                });

                user.save(function (err) {
                    if (err) {
                        log.error('it fails to save the user');
                        log.error(err);
                        callback({errorCode:500});
                    } else {
                        callback(null,user);
                    }
                });
            }
        ],function(error,result){
            if(error) {
                //log.error('it fails to sigup the user');
                //log.error(error);
                if(error.errorCode){
                    return res.json({errorCode:error.errorCode});
                }else{
                    return res.json({errorCode:500,message:error.message});
                }

            }else{
                //log.debug('successfully signup a user');
                res.json({errorCode:0, user: result});
            }
        })

        //log.debug('end singup user.');

    }catch(e){
        return res.json({
            errorCode:500,
            message:"Server error."
        });
    }
};


exports.info = function(req, res){
    var token = req.query.userToken;

    jwt.verify(token, config.jwt.secret, function(err, decoded){
        if(err){
            return res.json({
                errorCode: 500,
                message: err.message
            })
        }

        return res.json({
            errorCode: 0,
            user: decoded.current,
            timeout: Math.floor((decoded.exp-Date.now()/1000)/60),
            userToken: token
        });
    });
};


/**
 * 通过邮件和密码对用户进行验证
 * @param key 用户邮箱或手机号
 * @param password 用户密码
 * @param callback callback(error, user)，error不为空则为验证失败，为空为验证成功且user为找到的用户信息
 */
exports.validate = function(key, password, callback){

    var query = key.indexOf('@')<0?{'phone':key}:{'email':key};

    UserModel.findOne(query, function (err, user) {
        if (err) {
            return callback({
                errorCode:500,
                message: err.message
            });
        }

        if (!user||(user&&user.removed==true)) {
            return callback({
                errorCode:102,
                message: '账户不存在'
            });
        }

        if(user.locked == 2){
            return callback({
                errorCode: 108,
                message: '账户已被锁定'
            });
        }



        //与上次登录的时间差
        var diff = new Number(Date.now()-user.lastLoginTime);

        if(user.locked == 1){   //temperally locked

            if(diff < config.constants.lockLoginDue){
                return callback({
                    errorCode: 104,
                    message: '密码错误次数过多，账户已被临时锁定'
                });
            }
        }

        user.lastLoginTime = Date.now();

        if (!user.authenticate(password)) {
            //密码错误增加错误次数
            if(diff < config.constants.lockLoginDue){
                user.loginFailCount = user.loginFailCount+1;
                if(user.loginFailCount >= 5){
                    user.locked = 1;
                }
            }else{
                //如果超过2小时重新记录错误登录的次数
                user.loginFailCount = 1;
                user.locked = 0;
            }

            user.save(function(err_in){
                if(err_in) {
                    return callback({
                        errorCode: 500,
                        message: err_in.message
                    });
                }else{
                    return callback({
                        errorCode: 103,
                        message: '密码错误'
                    });
                }
            });
        } else {
            user.locked = 0;
            user.loginFailCount = 0;

            user.save(function(err_in){
                if(err_in){
                    return callback({
                        errorCode: 500,
                        message: err_in.message
                    });
                }else {
                    return callback(null, user);
                }
            });
        }
    });

}


exports.login = function (req, res) {
    try{
        console.log(req.body);
        
        var logName = req.body.username;
        var password = req.body.password;

        if(!logName || !password){
            log.error('login fails, because empty log name or password.');
            return res.json({
                errorCode:101
            })
        }

        log.debug('login['+logName+"]");

        //admin
        if(config.admin.user && config.admin.user.email == logName &&
            config.admin.user.password == password){
            var user = {
                id:null,
                name: 'SUPER',
                email: config.admin.user.email,
                roles: ['admin']
            };
            return res.json({
                errorCode: 0,
                user: user,
                timeout: config.jwt.expiresInMinutes,
                userToken: createToken(user)
            });
        }

        //db user
        else{
            self.validate(logName, password, function(error, user){
                if(error){
                    log.error(error);
                    res.json(error);
                }else{
                    //log in token manage
                    var query = logName.indexOf('@')<0?{'phone':logName}:{'email':logName};
                    UserModel.findOne(query)
                        .select('_id email phone home roles userRole')
                        .populate('home', '_id name location')
                        .exec(function(err, sim_user){
                            UserModel.update(query, {$set: {loginSuccTime: Date.now()}}, function (err) {
                                if(err){
                                    log.debug('set user last Succ time fail: '+err);
                                }
                            });

                            Role.findById(sim_user.userRole.roleId, function (err, role) {  //查找当前用户的角色
                                            if (err) {
                                                return res.json({
                                                    errorCode: 500,
                                                    message: err.message
                                                });
                                            }




                            return res.json({
                                errorCode: 0,
                                user: sim_user,
                                role:role,
                                timeout: config.jwt.expiresInMinutes,
                                userToken: createToken(sim_user,role),

                            });
                            });
                    });
                }
            });
        }

    }catch(e){
        log.error(e);
        res.json({
            errorCode: 500,
            message: e.message
        });
    }
};

exports.logout = function(req, res){
    return res.json({
        errorCode: 0
    });
}


exports.changePassword = function(req, res){

    try{
        var id = req.body.userId;
        var oldPassword = req.body.oldpass;
        var newPassword = req.body.newpass;

        log.debug('change password['+id+"]");

        self.validate(id,oldPassword,function(error, user){
            if(error){
                res.json(error);
            }else{
                user.password = newPassword;
                user.save(function(err_in){
                    if (err_in) {
                        log.error(err_in);
                        res.json({
                            errorCode:500,
                            message: err_in.message
                        });
                    } else{
                        res.json({
                            errorCode:0,
                            user: user
                        });
                    }
                });
            }
        })
    }catch(e){
        log.error(e);
        res.json({errorCode:500});
    }
};

exports.changeName = function(req, res){
    try{
        var id = req.body.userId;
        var newname = req.body.newname;
        var password = req.body.password;

        log.debug('change username['+id+']['+newname+']');

        if(!nameExp.test(newname)){
            log.debug('the new name invalid.')
            return res.json({
                errorCode: 105,
                message: '用户名不合法'
            });
        }

        self.validate(id,password,function(error,user){
            if(error){
                log.error(error);
                res.json(error);
            }else{
                user.name = newname;
                user.save(function(err_in){
                    if (err_in) {
                        return res.json({
                            errorCode: 500,
                            message: err_in.message
                        });
                    } else{
                        return res.json({
                            errorCode: 0
                        });
                    }
                });
            }
        })

    }catch(e){
        log.error(e);
        res.json({errorCode:500});
    }
};

exports.forgetPassword = function(req, res){
    try{
        var email = req.body.email;
        log.debug('forget password and goting to recovery it.['+email+"]");
        UserModel.findOne({email: email}, function (err, user) {

            log.debug('forget password:['+email+"]");

            if(err){
                log.error(err);
                return res.json({errorCode:500});
            }else if(!user){
                log.debug('the user does not exist.');
                return res.json({errorCode:102})
            }else{

                //判断是否已经重新找回密码
                if(user.forget){
                    var interval = Date.now()-user.forget.createdTime;
                    if(interval<config.constants.recoveryPasswordDue){
                        res.json({errorCode:113});
                        return;
                    }
                }

                user.forget.token = randomstring.generate(10);
                user.forget.createdTime = new Date();
                user.locked = 0;
                user.save(function(err){
                    if(err){
                        log.error('it fails to save the forget token.');
                        res.json({errorCode:500});
                    }else{
                        fs.readFile(config.view.forget, 'utf8',function(err, forget) {
                            forget = forget.replace(/_TOKEN_/,user.forget.token)
                                .replace(/_EMAIL_/,user.email).replace(/_CLOUD_/,config.constants.baseUrl);
                            if(err) {
                                log.error('it fails to read forget template, because '+error.message);
                                res.json({errorCode:500});
                            } else{
                                postmarkClient.sendEmail({
                                    "From": "team@huasys.com",
                                    "To": user.email,
                                    "Subject": "重置广电宜家密码",
                                    "HtmlBody": forget
                                }, function(error, success) {
                                    if(error) {
                                        log.error("Unable forget mail, because " + error.message);
                                        res.json({errorCode:500});
                                    }else{
                                        log.debug("Delivery forget mail to "+user.email);
                                        res.json({errorCode:0});
                                    }
                                });
                            }
                        });

                    }
                });

            }
        });

    }catch(e){
        log.error(e);
        res.json({errorCode:500});
    }


};

exports.forgetReset=function(req,res){
    var email = req.body.email;
    var forgetToken = req.body.forgetToken;



    if(!email || !forgetToken){
        return res.json({
            errorCode:404,
            message:'找回密码出错，待重置的邮箱或令牌不能为空'
        });
    }

    UserModel.findOne({email:email},function(err,user){
        if(err){
            return res.json({
                errorCode:500,
                message:err.message
            });
        }else if(!user){
            return res.json({
                errorCode:404,
                message:'找回密码出错，待重置的邮箱不存在'
            });
        }else{

            if(!user.forget){
                return res.json({
                    errorCode:404,
                    message:'未请求找回密码'
                });
            }

            var interval = Date.now()-user.forget.createdTime;

            console.log('interval:'+interval);
            console.log('due:'+config.constants.recoveryPasswordDue);
            if(interval >0 && interval < config.constants.recoveryPasswordDue ){
                if(user.forget.token === forgetToken){
                    return res.json({
                        errorCode:0,
                        email:email,
                        forgetToken:forgetToken
                    });
                }else{
                    return res.json({
                        errorCode:404,
                        message:'安全令牌不正确'
                    });

                }
            }else{
                return res.json({
                    errorCode:404,
                    message:'找回密码的安全令牌已过期，请重新申请找回密码。'
                });
            }
        }
    })
}

exports.forget=function(req,res){
    var email = req.body.email;
    var forgetToken = req.body.forgetToken;
    var password = req.body.password;
    console.log(email);


    if(!config.constants.passwordExp.test(password)){
        return res.json({
            errorCode:404,
            message:'密码不符合规定，请后退重新设置密码。'
        });
    }

    log.debug('reset the password['+email+"]");
    UserModel.findOne({email:email},function(err,user){
        if(err){
            return res.json({
                errorCode:404,
                message:'系统内部错误请稍后重试。'
            });

        }else if(!user){
            return res.json({
                errorCode:404,
                message:'用户的邮箱不存在。'
            });

        }else{
            if(!user.forget){
                return res.json({
                    errorCode:404,
                    message:'密码找回的令牌不正确。'
                });
            }
            var interval = Date.now()-user.forget.createdTime;
            if( interval >0 && interval < config.constants.recoveryPasswordDue ){
                if(user.forget.token === forgetToken){
                    user.password = password;
                    user.forgetPassword = null;
                    user.save(function(err){
                        if(err){
                            return res.json({
                                errorCode:404,
                                message:'保存新密码错误，请稍后重试。'
                            });

                        }else{
                            return res.json({
                                errorCode:0
                            });
                        }
                    });
                }else{
                    return res.json({
                        errorCode:404,
                        message:'密码找回的令牌不正确。'
                    });

                }
            }else{
                return res.json({
                    errorCode:404,
                    message:'密码找回的令牌已失效，请重新找回密码。'
                });

            }
        }

    })


}

exports.changePasswordByForget = function(email,forgetToken, newPassword){

    try{

        var email = req.body.email;
        var forgetToken = req.body.forgetToken;
        var newPassword = req.body.newPassword;

        if(!passwordExp.test(newPassowrd)){
            return res.json({errorCode:107});
        }

        UserModel.findOne({email:email},function(err,user){
            if(err){
                log.error("cannot find the user through email");
                res.json({errorCode:500});
            }else if(!user){
                res.json({errorCode:102});
            }else{
                var interval = Date.now-res.forgetPassword.createdTime;
                if(res.forgetPassword && interval >0 && interval < 20*60*1000 ){
                    if(res.forgetPassword.token === forgetToken){
                        user.passowrd = newPassword;
                        user.forgetPassword = null;
                        use.save(function(err){
                            if(err){
                                res.json({errorCode:500});
                            }else{
                                res.json({errorCode:0});
                            }
                        });
                    }else{
                        res.json({errorCode:112});
                    }
                }else{
                    res.json({errorCode:111});
                }
            }
        })

    }catch(e){
        log.error(e);
        res.json({errorCode:500});
    }
};


function createToken(user,role) {
  return jwt.sign({current: user,role:role}, config.jwt.secret, { expiresInMinutes: config.jwt.expiresInMinutes });
};
