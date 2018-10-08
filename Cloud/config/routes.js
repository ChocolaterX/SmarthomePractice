/**
 * Created by tianci on 2015/5/4.
 */
var express = require('express'),
    jwt = require('express-jwt'),       //json web token
    config = require('./config');
var userAuth = require('../server/service/userAuth');
var user = require('../server/service/main/user');
var admin = require('../server/service/main/admin');
var services = require('../server/services');
var rolecontrol = require('./rolecontrol');

var jwtCheck = jwt({
    secret: config.jwt.secret
});

module.exports = function (app) {
    // expose req to views
    app.use(function (req, res, next) {
        res.locals.req = req;
        next();
    });

    //account auth control, no need to be jwt checked
    //user
    app.post('/user/create', user.create);
    app.post('/user/login', user.login);
    app.get('/user/logout', user.logout);

    //admin
    app.post('/admin/login', admin.login);
    app.get('/admin/logout', admin.logout);


    app.post('/user/changePassword', userAuth.changePassword);
    app.post('/user/changeName', userAuth.changeName);
    app.post('/user/forgetPassword', userAuth.forgetPassword);
    app.get('/user/info', userAuth.info);
    app.get('/user/forgetReset', userAuth.forgetReset);
    app.post('/user/forget', userAuth.forget);

    //services
    app.use('/service', jwtCheck);
    app.use('/service', rolecontrol.middleware());

    services.services(app);
    app.use('/service', function (req, res, next) {
        return res.json({
            errorCode: -1,
            message: 'Bad request'
        });
    });


    app.use(function (req, res, next) {
        res.status(404);

        // respond with html page
        if (req.accepts('html')) {
            res.render('404', {url: req.url});
            return;
        }

        // respond with json
        if (req.accepts('json')) {
            res.send({error: 'Not found'});
            return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
    });

    /// error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            if (err.status) {
                res.status(err.status);
                return res.json({
                    errorCode: err.status,
                    message: err.message
                });
            }

            else {
                res.status(500);
                return res.json({
                    errorCode: 500,
                    message: err.message
                });
            }
        });
    }

    // production error handler
    // no stacktraces leaked to user
    else {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.json({
                errorCode: err.status || 500
            });
        });
    }
};