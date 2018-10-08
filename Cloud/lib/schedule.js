//var Agenda = require('agenda');
var config = require('../config/config');

//var agenda = new Agenda({db: { address: config.cloud.db, collection: 'agendaJobs' }});

/**
 * start agenda
 */
//exports.start = function(){
//	agenda.start();
//};

/**
 * stop agenda
 */
//exports.stop = function(){
//	agenda.stop();
//};

/**
 * schedule a job, auto trigger is on by default
 *
 * @param {Number} [required] ss: second, range: [0, 59]
 * @param {Number} [required] mm: minute, range: [0, 59]
 * @param {Number} [required] hh: hour, range: [0, 23]
 * @param {String} [required] key: the key of the job, for index
 * @param {Object} [required] repeat: such as repeat[5]=true stands for job repeat every Friday
 * @param {Function} [required] jobfunc: execute function when job is triggered, jobfunc(job, done);
 * @param {Function} [required] cb: cb(err), fails; cb(null), success;
 * @api public
 */
//exports.schedule = function(ss, mm, hh, repeat, key, jobfunc, cb){
//	//check param type
//	if(!isInt(ss) || !isInt(mm) || !isInt(hh) ||
//		!key || typeof(key) !='string' ||
//		!repeat || typeof(repeat) != 'object' ||
//		!jobfunc || typeof(jobfunc) != 'function'){
//		return cb(new Error('Bad parameter format.'));
//	}
//	//check param range
//	if(ss<0||ss>59 || mm<0||mm>59 || hh<0||hh>23){
//		return cb(new Error('Bad parameter format.'));
//	}
//
//	//format trigger time
//	var cronTime = ''+ss+' '+mm+' '+hh+' * * ';
//	var flag = false;
//	for(var i = 1; i <= 7; i++){
//		if(repeat[i] == true){
//			if(flag){
//				cronTime = cronTime+',';
//			}
//			flag = true;
//			cronTime = cronTime+i;
//		}
//	}
//
//	//check if job[key] exists
//	agenda.jobs({'name': key}, function(err, jobs){
//		if(err || (jobs && jobs.length>0)){
//			return cb(new Error('Job with key['+key+'] already exists.'));
//		}
//
//		//define jobs
//		agenda.define(key, jobfunc);
//
//		//schedule once
//		if(!flag){
//			var date = new Date();
//			date.setHours(hh);
//			date.setMinutes(mm);
//			date.setSeconds(ss);
//			//if date<Date(), set as tomorrow
//			if(date < (new Date())){
//				date.setDate(date.getDate()+1);
//			}
//			agenda.schedule(date, key, {'key': key});
//			//agenda.start();
//			return cb(null);
//		}
//		else{
//			agenda.every(cronTime, key, {'key': key});
//			//agenda.start();
//			return cb(null);
//		}
//	});
//
//};

/**
 * cancel a job
 *
 * @param {String} [required] key: the key of the job, for index
 * @param {Function} [required] cb: cb(err), fails; cb(null), success;
 * @api public
 */
//exports.cancel = function(key, cb){
//	if(!key || typeof key != 'string'){
//		return cb(new Error('Bad parameter format.'));
//	}
//
//	agenda.cancel({'name':key}, function(err, num){
//		if(err){
//			return cb(err);
//		}
//		else if(!num){
//			return cb(new Error('No job with key['+key+'] exists.'));
//		}
//		else{
//			return cb(null);
//		}
//	});
//};

/**
 * query a job by key
 *
 * @param {String} [required] key: the key of the job, for index
 * @param {Function} [required] cb(err, job)
 * @api public
 */
//exports.query = function(key, cb){
//	if(!key || typeof key != 'string'){
//		return cb(new Error('Bad parameter format.'));
//	}
//
//	agenda.jobs({'name':key}, function(err, jobs){
//		if(err){
//			return cb(err);
//		}
//		else if(!jobs || !jobs.length || !jobs.length < 1){
//			return cb(null, null);
//		}
//		else{
//			return cb(null, jobs[0]);
//		}
//	});
//};

function isInt(n){
    return Number(n) === n && n % 1 === 0;
};