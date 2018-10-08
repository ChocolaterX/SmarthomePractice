/**
 * <copyright file="actionTest.js" company="Run">
 * Copyright (c) 2017-2018 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>3/29/2018</date>
 * <summary>
 *  。
 * </summary>
 */

var assert = require("assert");
var myApp = require('../server.js');
var request = require('supertest');
var should = require('should');

var request1 = request(myApp);
//var request2 = request('http://127.0.0.1:3000');

describe('#action()', function () {

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

    describe('#action binding', function () {
        it.skip('create action binding test ', function (done) {
            var body = {
                number: 5,
                type: 3,
                //deviceId: '5a5705a51ece58036c133ad8',
                //command: 'TurnOn'
                //sceneId: '5abc8e9403c64f1a101df1cb'
                infraredCommandId: '5acaf9d4bb234e1e4cf9fc11'
            };
            request1
                .post('/service/action/binding/create')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('update action binding test ', function (done) {
            var body = {
                actionBindingId: "5ae19843a17ec51f8cbb63cf",
                number: 2,
                type: 1,
                deviceId: '5a5705a51ece58036c133ad8',
                command: 'TurnOffLeft'
                //sceneId: '5abc8e9403c64f1a101df1cb'
                //infraredCommandId: '5acaf9d4bb234e1e4cf9fc11'
            };
            request1
                .post('/service/action/binding/update')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('get action binding list test ', function (done) {
            var body = {};
            request1
                .post('/service/action/binding/list/get')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('get action binding detail test ', function (done) {
            var body = {
                actionBindingId: '5ac9e0abb0ec73318884dbe4'
            };
            request1
                .post('/service/action/binding/detail/get')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('delete action binding test ', function (done) {
            var body = {
                actionBindingId: '5abd9de768d1dd1580031e8a'
            };
            request1
                .post('/service/action/binding/delete')
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
    describe('#run ', function () {
        it.skip('run test ', function (done) {
            var body = {
                binding: '22关键词21231234111111'
            };
            request1
                .post('/service/action/run')
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