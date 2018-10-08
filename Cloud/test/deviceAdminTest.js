/**
 * <copyright file="deviceAdminTest.js" company="Run">
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

var assert = require("assert");
var myApp = require('../server.js');
var request = require('supertest');
var should = require('should');

var request1 = request(myApp);

describe('#device admin test()', function () {
    var token = null;
    //var logUser = {loginName: 'test', password: '123456'};
    var logUser = {loginName: 'testAdmin', password: '12345678'};
    before(function (done) {
        request1
            .post('/admin/login')
            .send(logUser)
            .end(function (err, res) {
                token = res.body.adminToken; // Or something
                done();
            });
    });

    describe('#device test', function () {
        it.skip('create device test ', function (done) {
            var body = {
                type: 5,
                mac: '00124B000E916ECB'
            };
            request1
                .post('/service/admin/device/create')
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
                pageSize: 5,
                pageIndex: 0
            };
            request1
                .post('/service/admin/device/list/get')
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
                deviceId: '58e5eabcc7aae3d8a978fb75'
            };
            request1
                .post('/service/admin/device/delete')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
    })

});
