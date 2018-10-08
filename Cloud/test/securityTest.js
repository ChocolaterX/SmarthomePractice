/**
 * <copyright file="securityTest.js" company="Run">
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

describe('security test()', function () {
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

    describe('security device test', function () {
        it('add test', function (done) {
            var body = {
                mac: '0000000000000011',
                name: '门锁'
            };
            request1
                .post('/service/security/device/add')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('update test ', function (done) {
            var body = {
                securityDeviceId: '5a8fab703fa21e1c7495284a',
                name: '摄像头'
            };
            request1
                .post('/service/security/device/update')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('get list test ', function (done) {
            var body = {};
            request1
                .post('/service/security/device/list/get')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('delete test ', function (done) {
            var body = {
                securityDeviceId: '5a8fab78163c921bb4a597d4'
            };
            request1
                .post('/service/security/device/delete')
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
    describe('security log test', function () {
        it.skip('get log list test ', function (done) {
            var body = {
                //securityDeviceId: '5a9e555b3cff35139419e30d'
                securityDeviceId:'5a9e55725fa2b42150bf8fc6'
            };
            request1
                .post('/service/security/log/list/get')
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
