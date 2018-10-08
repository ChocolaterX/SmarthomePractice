/**
 * Created by Administrator on 2017-4-21.
 */
var schedule = require('node-schedule');
var sense = require('./sense');
function scheduleCronstyle(){

    var start=9-1
    var end=10-1
    //var time='* * '+start+'-'+end+' * * *'

    var time='*/1 * * * *'


    console.log('run testSense')




    schedule.scheduleJob(time, function(){

        sense.create('58ec90b2d51661aebabf90a9',parseInt(Math.random()*100),'temperature')




        console.log('scheduleCronstyle:' + new Date());
    });
}

scheduleCronstyle();