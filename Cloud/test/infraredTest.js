/**
 * <copyright file="infraredTest.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>4/3/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var assert = require("assert");
var myApp = require('../server.js');
var request = require('supertest');
var should = require('should');
var request1 = request(myApp);

describe('#infrared()', function () {
    var token = null;
    var logUser = {loginName: 'test', password: '12345678'};
    before(function (done) {
        request1
            .post('/user/login')
            .send(logUser)
            .end(function (err, res) {
                token = res.body.userToken; // Or something
                done();
            });
    });

    describe('#telecontroller()', function () {
        it.skip('create telecontroller test ', function (done) {
            var body = {
                name: '测试遥控器'
            };
            request1
                .post('/service/infrared/telecontroller/create')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('update telecontroller test ', function (done) {
            var body = {
                telecontrollerId: '5ac2d7cd4b523c0e904e0e87',
                name: '彩灯遥控器2'
            };
            request1
                .post('/service/infrared/telecontroller/update')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('get telecontroller list test ', function (done) {
            var body = {};
            request1
                .post('/service/infrared/telecontroller/list/get')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('delete telecontroller test ', function (done) {
            var body = {
                telecontrollerId: '5ac430a5b0ec73318883a382'
            };
            request1
                .post('/service/infrared/telecontroller/delete')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
    });

    describe('#infrared command()', function () {
        it.skip('create command test ', function (done) {
            var body = {
                telecontrollerId: '5ac2d79b4be9790fecb4de29',
                name: '关闭'
            };
            request1
                .post('/service/infrared/command/create')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('update command test ', function (done) {
            var body = {
                infraredCommandId: '5ac2e20f2cefc10c80dfde90',
                name: '打开'
            };
            request1
                .post('/service/infrared/command/update')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('get command list test ', function (done) {
            var body = {
                telecontrollerId: '5ac2d79b4be9790fecb4de29'
            };
            request1
                .post('/service/infrared/command/list/get')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('delete command test ', function (done) {
            var body = {
                infraredCommandId: '5ac2e1b056a4121be4db22b2'
            };
            request1
                .post('/service/infrared/command/delete')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });

        it.skip('start simulate test ', function (done) {
            var body = {
                infraredMac: '00124B000E916ECB'
            };
            request1
                .post('/service/infrared/command/simulate/start')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('confirm command test ', function (done) {
            var body = {
                infraredCommandId: '5ac2e20f2cefc10c80dfde90'
            };
            request1
                .post('/service/infrared/command/simulate/confirm')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('execute command test ', function (done) {
            var body = {
                infraredCommandId: '5ac2e20f2cefc10c80dfde90'
            };
            request1
                .post('/service/infrared/command/execute')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
    });


});
