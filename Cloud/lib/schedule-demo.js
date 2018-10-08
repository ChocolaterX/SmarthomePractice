
var agenda = require('./schedule');

agenda.start();	//should be called in server.js
//jobs should be re-constructed each time when server is restarted according to database

var jobfunc = function(job, done){
	var data = job.attrs.data;
	console.log('in jobfunc: '+data.key);
	done();
};

agenda.cancel('call me jack', function(err){
	if(err){
		console.log('cancel fails');
	}
	//trigger at 17:25:00 in every Tuesday and Wednesday
	agenda.schedule(0, 25, 17, {2:true, 3:true}, 'call me jack', jobfunc, function(err){
		console.log('in schedule callback, err:'+err);
	});
});
