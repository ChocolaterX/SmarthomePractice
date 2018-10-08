/**
 * Created by pjf 2017-4-11.
 */
var assert = require('assert');
var myApp = require('../server.js');
var request = require('supertest');
var should = require('should');

var request1 = request(myApp);
//admin
describe('#adminSensor()', function () {

    var token = null;
    //var logUser = {loginName: 'admin@huasys.com', password: 'huasysadmin'};
    //before(function (done) {
    //    request1
    //        .post('/admin/login')
    //        .send(logUser)
    //        .end(function (err, res) {
    //            token = res.body.adminToken; // Or something
    //            done();
    //        });
    //});
    describe('#adminSensor()', function () {
        it.skip('create sensor test ', function (done) {
            var body = {
                mac: 'def1',
                interfaceType: 1,
                type:1
            };
            request1
                .post('/service/sensor/admin/create')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        //it.skip('update sensor test ', function (done) {
        //    var body = {
        //        sensorId: '58ec8faeca70c71ab86f45b0',
        //        name: 'test家庭网关000000'
        //    };
        //    request1
        //        .post('/service/sensor/admin/update')
        //        .set({'Authorization': 'Bearer ' + token})
        //        .send(body)
        //        .expect(200)
        //        .end(function (req, res) {
        //            console.log(res.body);
        //            parseFloat(res.body.errorCode).should.equal(0);
        //            done();
        //        })
        //});
        it.skip('get sensor list test ', function (done) {
            var body = {
                loginName:'p',        //可选参数

                mac:'1',              //可选参数

                //type:1               //可选参数

            };
            request1
                .post('/service/sensor/admin/list')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('delete sensor test ', function (done) {
            var body = {
                sensorId: '58ec90c7e11b03debbe1af48'
            };
            request1
                .post('/service/sensor/admin/delete')
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
//user
describe('#userSensor()', function () {

    var token = null;
    var logUser = {loginName: 'test', password: '123456'};
    before(function (done) {
        request1
            .post('/user/login')
            .send(logUser)
            .end(function (err, res) {
                token = res.body.userToken; // Or something
                done();
            });
    });
    describe('#userSensor()', function () {
        it.skip('create sensor test ', function (done) {
            var body = {
                sensorId: '58ed86fc9a568f10355add2e',       //test1
                //sensorId: '58ec8faeca70c71ab86f45b0',       //test2
                //sensorId: '58ec8fc14823dfa6c1a9f174',       //test3
                //sensorId: '58ec90bec92230eac60aa844',       //test4
                name: 'test1111传感器'
            };
            request1
                .post('/service/sensor/user/create')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('update sensor test ', function (done) {
            var body = {
                sensorId: '58ec90b2d51661aebabf90a9',       //test1
                name: 'test1传感器000000'
            };
            request1
                .post('/service/sensor/user/update')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it('get sensor list test ', function (done) {
            var body = {
                sensorId:'58ed86fc9a568f10355add2e'       //test1
            };
            request1
                .post('/service/sensor/user/list')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function (req, res) {
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);
                    done();
                })
        });
        it.skip('delete sensor test ', function (done) {
            var body = {
                sensorId:'58ec90b2d51661aebabf90a9'      //test1
            };
            request1
                .post('/service/sensor/user/delete')
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