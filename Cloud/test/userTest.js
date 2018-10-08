/**
 * <copyright file="userTest.js" company="Run">
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
//var request2 = request('http://127.0.0.1:3000');

describe('#user()', function () {
    var token = null;
    //var logUser = { loginName: 'test', password: '12345678'};
    var logUser = {loginName: 'admin', password: 'admin'};
    before(function (done) {
        request1
            .post('/user/login')
            .send(logUser)
            .end(function (err, res) {
                //console.log(res.body);
                //console.log('\n\nabc');
                token = res.body.userToken; // Or something
                done();
            });
    });

    describe('#create()', function () {
        it('create test ', function (done) {
            var body = {
                loginName: 'room',
                email: 'room@greenorbs.com',
                password: '12345678'
            };
            request1
                .post('/user/create')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })
    });

    describe('#reset()', function () {
        it.skip('reset test', function (done) {
            var body = {
                oldPassword: '12345678',
                newPassword: '12345678'
            };
            request1
                .post('/service/user/resetPassword ')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })

    });

    describe('#info()', function () {
        it.skip('info test', function (done) {
            request1
                .get('/service/user/info')
                .set({'Authorization': 'Bearer ' + token})
                // .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })
    });

    describe('#update()', function () {
        it.skip('update test ', function (done) {
            var body = {
                name: '测试用户',
                iid:'320282199911110000',
                address:'address',
                phone:'15288888888',
                remark:'无'
            };
            request1
                .post('/service/user/update')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })
    });

    //describe('#delete()', function () {
    //    it.skip('delete test ', function (done) {
    //        var body = {
    //            userIds: 'kangfu@huasys.com'
    //        };
    //        request1
    //            .post('/service/user/delete')
    //            .set({'Authorization': 'Bearer ' + token})
    //            .send(body)
    //            .expect(200)
    //            .end(function (req, res) {
    //                console.log(res.body);
    //                parseFloat(res.body.errorCode).should.equal(0);
    //                done();
    //            })
    //    })
    //})



})
