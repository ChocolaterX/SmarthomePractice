/**
 * Created by liyang on 2015-6-5.
 */
var assert = require("assert");
var myApp = require('../server.js');
var request = require('supertest');
var should = require('should');
var request1 = request(myApp);

describe('#sense()', function () {
    var token = null;
    var logUser = { loginName: 'pjf', password: '123456'};
    before(function(done) {
        request1
            .post('/user/login')
            .send(logUser)
            .end(function(err, res) {
                token = res.body.userToken; // Or something
                done();
            });
    });
    describe('#test create',function(){
        it.skip('test create test',function(done){
            var body={

                //sensorId:'58ec90b2d51661aebabf90a9',
                //startTime: 1433728239559+28800000,
                //endTime: 1433728239559+60*60*1000+28800000,
                //step: 80*1000
            };
            request1
                .post('/service/sense/testCreate')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(2000000)
                .end(function(req, res){
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);

                    done();
                })
        })

    })






    describe('#query',function(){
        it.skip('query/now/air test',function(done){
            var body={

                sensorId:'58ec90b2d51661aebabf90a9',
                //startTime: 1433728239559+28800000,
                //endTime: 1433728239559+60*60*1000+28800000,
                //step: 80*1000
            };
            request1
                .post('/service/sense/query/now/air')
                .set({'Authorization': 'Bearer ' + token})
                .send(body)
                .expect(200)
                .end(function(req, res){
                    console.log(res.body);
                    parseFloat(res.body.errorCode).should.equal(0);

                    done();
                })
        })

        it('aggregate test',function(done){
            var body={
                sensorId:'58ec90b2d51661aebabf90a9',
                //startTime:(Date.now()-24*60*60*1000),
                //endTime:Date.now(),
                //startTime: new Date('2017-4-14').getTime(),
                //endTime: new Date('2017-4-15').getTime(),
                condition: 30
            };
            request1
                .post('/service/sense/query/history/air')
                .set({'Authorization': 'Bearer ' + token})
                . send(body)
                .expect(200)
                .end(function(req, res){
                    console.log(res.body);
                    console.log(res.body.senses);
                    parseFloat(res.body.errorCode).should.equal(0);

                    done();
                })
        })
    })
})