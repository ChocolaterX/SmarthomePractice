/**
 * Created by chenkangfu on 2015/5/20.
 */
var assert = require("assert");
var myApp = require('../server.js');
var request = require('supertest');
var should = require('should');

var request1 = request(myApp);
//var request2 = request('http://127.0.0.1:3000');

describe('#admin()', function () {

    var token = null;
    // var logUser = { loginName: 'admin@huasys.com', password: 'huasysadmin'};      //超管
    var logUser = {loginName: 'admin', password: 'admin'};      //一般管理
    before(function (done) {
        request1
            .post('/admin/login')
            .send(logUser)
            .end(function (err, res) {
                // console.log(res.body);
                token = res.body.adminToken; // Or something
                done();
            });
    });

//管理员
    describe('#userList()', function () {
        it.skip('userList test', function (done) {
            var body = {
                loginName: '1',          //可选参数
                // pageIndex:'',
                // pageSize:''

            };
            request1
                .post('/service/admin/userList')
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


    describe('#userInfo()', function () {
        it.skip('userInfo test', function (done) {
            var body = {
                userId: '58de05b91cfc5d304b6809c3'

            };
            request1
                .post('/service/admin/userInfo')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })
    })


    describe('#userPWD()', function () {
        it.skip('userPWD test', function (done) {
            var body = {
                userId: '58e4a04135b25470634217ad'

            };
            request1
                .post('/service/admin/userPWD')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })

    })

    describe('#userLock()', function () {
        it.skip('userLock test ', function (done) {
            var body = {
                userIds: ['58dde7639715263c423d56b7', '58dde902e2b207a44204b845', '58ddf420bb4a1fb047c302ed']
            };
            request1
                .post('/service/admin/userLock')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })
    })
    describe('#userUnlock()', function () {
        it.skip('userUnlock test ', function (done) {
            var body = {
                userIds: ['58dde7639715263c423d56b7', '58dde902e2b207a44204b845', '58ddf420bb4a1fb047c302ed']
            };
            request1
                .post('/service/admin/userUnlock')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })
    })

    describe('#userDelete()', function () {
        it.skip('userDelete test ', function (done) {
            var body = {
                userIds: ['58dde7639715263c423d56b7', '58dde902e2b207a44204b845', '58ddf420bb4a1fb047c302ed']
            };
            request1
                .post('/service/admin/userDelete')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })
    })


//超管


    describe('#create()', function () {
        it.skip('create test ', function (done) {
            var body = {

                loginName: 'test6',
                password: '12345678',
                email: 'test6@163.com'

            };
            request1
                .post('/service/admin/create')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })
        it.skip(' email null test ', function (done) {
            var body = {
                loginName: 'test1',
                email: '',
                password: 'zhanglei'
            };
            request1
                .post('/service/admin/create')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(1220);
                    done();
                })
        })

        it.skip(' password null test ', function (done) {
            var body = {
                loginName: 'test1',
                email: 'leizhang@huasys.com',
                password: null
            };
            request1
                .post('/service/admin/create')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(1214);
                    done();
                })
        })

    })

    describe('#list()', function () {
        it.skip('list test ', function (done) {
            var body = {
                //pageIndex:'',
                //pageSize:'',
                //loginName:'1'          //启用则为单独查询，不用则查询所有
            };
            request1
                .post('/service/admin/list')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })
    })


    describe('#delete()', function () {
        it.skip('delete test ', function (done) {
            var body = {
                adminIds: ['58e49b41864415a02ae6c170', '58e49b4dd43fd22c6496190d', '58e49b550ef684c81f81ca7d']
            };
            request1
                .post('/service/admin/delete')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })
    })


    describe('#update()', function () {
        it('update test ', function (done) {
            var body = {
                adminId: '58e49b41864415a02ae6c170',
                email: '',
                password: '123456'


            };
            request1
                .post('/service/admin/update')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        })
    })
})
