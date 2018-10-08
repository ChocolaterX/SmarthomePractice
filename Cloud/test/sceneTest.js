var assert = require("assert");
var myApp = require('../server.js');
var request = require('supertest');
var should = require('should');
var request1 = request(myApp);

describe('#scene()', function () {
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
    describe('#scene crud test()', function () {
        it.skip('create scene test ', function (done) {
            var body = {
                name: '测试真实控制情景模式',
                type: 1,
                //executeTime: '1351843990250',
                //repeat: ['true', 'true', 'false', 'false', 'false', 'true', 'true'],
                //autorun: true,
                commands: [
                    {
                        device: '5a1682f81654ef17907f4cc6',
                        command: 'Open'
                    },
                    {
                        device: '5a5705a51ece58036c133ad8',
                        command: 'TurnOn'
                    }
                ]
            };
            request1
                .post('/service/scene/create')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('update scene test ', function (done) {
            var body = {
                sceneId: '5a794c32e6fbce224c3aee09',
                name: '手动改自动',
                type: 2,
                executeTime: 1433728239559,
                repeat: ['true', 'true', 'false', 'false', 'false', 'true', 'true'],
                autorun: true,
                commands: [
                    {
                        device: '5a1688543efefc286cffd63d',
                        command: '00'
                    },
                    {
                        device: '5a1688379985b72838240892',
                        command: 'Off'
                    }
                ]
            };
            request1
                .post('/service/scene/update')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('get scene list test ', function (done) {
            var body = {
                condition: 2
            };
            request1
                .post('/service/scene/list/get')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it('get scene detail test ', function (done) {
            var body = {
                sceneId: '5abc8e9403c64f1a101df1cb'
            };
            request1
                .post('/service/scene/detail/get')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('delete scene test ', function (done) {
            var body = {
                sceneId: '5a44a1cb1e79f4167cb6ceeb'
            };
            request1
                .post('/service/scene/delete')
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
    describe('#scene run test()', function () {
        it.skip('run scene test ', function (done) {
            var body = {
                sceneId: '5abc8e9403c64f1a101df1cb'
            };
            request1
                .post('/service/scene/run')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('turnon scene autorun test ', function (done) {
            var body = {
                sceneId: '5a794aa1d881a41d6c6fa729',
                autorun: 'true'
            };
            request1
                .post('/service/scene/autorun/set')
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