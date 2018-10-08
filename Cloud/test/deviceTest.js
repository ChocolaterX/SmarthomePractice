/**
 * <copyright file="deviceTest.js" company="Run">
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

var assert = require("assert");
var myApp = require('../server.js');
var request = require('supertest');
var should = require('should');
var request1 = request(myApp);

describe('#device()', function () {
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

    describe('#device()', function () {
        it.skip('add device test ', function (done) {
            var body = {
                mac: '00124B000E916ECB',
                name: '可用红外遥控器'
            };
            request1
                .post('/service/device/add')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('update device test ', function (done) {
            var body = {
                deviceId: '5ad6f8c11051d01e74938fbd',
                name: '空调2222',
            };
            request1
                .post('/service/device/update')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('get device list test ', function (done) {
            var body = {
            };
            request1
                .post('/service/device/list/get')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('get device detail test ', function (done) {
            var body = {
                deviceId: '5a5705a51ece58036c133ad8'
            };
            request1
                .post('/service/device/detail/get')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('delete device test ', function (done) {
            var body = {
                deviceId: '5a1688929038eb0494df43fc'
            };
            request1
                .post('/service/device/delete')
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

    describe('#command()', function () {
        it.skip('device command test ', function (done) {
            var body = {};
            request1
                .post('/service/device/command')
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
