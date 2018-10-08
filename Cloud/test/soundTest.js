/**
 * <copyright file="soundTest.js" company="Run">
 * Copyright (c) 2017-2018 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>2/26/2018</date>
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

describe('#sound()', function () {

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

    describe('#sound keyword', function () {
        it.skip('create sound keyword test ', function (done) {
            var body = {
                keyword: '关键词666',
                type: 3,
                //deviceId: '5a5705a51ece58036c133ad8',
                //command: 'turnon'
                //sceneId: '5a781c9b873f5819a07c8991',
                infraredCommandId: '5acaf9d4bb234e1e4cf9fc11'
            };
            request1
                .post('/service/sound/keyword/create')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('update sound keyword test ', function (done) {
            var body = {
                soundKeywordId: "5afbf5897aba7b16147a9e7d",
                //soundCommandId: "5837f76c3da27138476605c2",
                type:3,
                keyword: "关键词555",
                //deviceId: '5a5705a51ece58036c133ad8',
                //command: 'turnon'
                //sceneId: '5a781c9b873f5819a07c8991',
                infraredCommandId: '5acaf9d4bb234e1e4cf9fc11'
            };
            request1
                .post('/service/sound/keyword/update')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('get sound keyword list test ', function (done) {
            var body = {};
            request1
                .post('/service/sound/keyword/list/get')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('get sound keyword list test ', function (done) {
            var body = {
                soundKeywordId: '5abdd95d194197154c6a1211'
            };
            request1
                .post('/service/sound/keyword/detail/get')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('delete sound keyword test ', function (done) {
            var body = {
                soundKeywordId: '5a93cb3407805e1ff0e73bc6'
            };
            request1
                .post('/service/sound/keyword/delete')
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
        it('run test ', function (done) {
            var body = {
                content: '起床'
            };
            request1
                .post('/service/sound/run')
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