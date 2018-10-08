var fs = require('fs');
var md5 = require('md5');
var path = require('path');
var mongoose = require('../../cloud_db_connect');
var homeDevice = mongoose.model('HomeDevice');

//获取文件
exports.abc=function(req,res){
    var version = explorer(function(err,doc){
        fs.readdir(path.join(__dirname,'../../../systemfile/'+doc+''), function(err, files){
            var stream = fs.createReadStream(path.join(__dirname,'../../../systemfile/'+doc+'/'+files[0]+'')) ;
            stream.pipe(res) ;
        });
    })
}


//获取md5
exports.makemd5=function(req,res){
    var version = explorer(function(err,doc){
        fs.readdir(path.join(__dirname,'../../../systemfile/'+doc+''), function(err, files){
            fs.readFile(path.join(__dirname,'../../../systemfile/'+doc+'/'+files[0]+''), function(err, buf) {
                return res.end(md5(buf));
            });
        });
    })
    /*fs.readFile(path.join(__dirname,'../../../systemfile/1.0.0/gatewaySystem_v1.0.0.tar.gz'), function(err, buf) {
        return res.end(md5(buf));
    });*/
}
//获取最高版本
exports.getVersion = function(req,res){
    var version = explorer(function(err,doc){
        return res.end(doc);
    })
}

var gateway = require('../gateway/gateway');
exports.comm = function (req, res) {
    console.log('发送更新命令');
    var gateways = [];
    homeDevice.find({},function(err,homedevice){
        if(err){
            return res.end('update failure')
        }else{

            for(var i = 0;i<homedevice.length;i++){
                for(var j=0;j<homedevice[i].gateway.length;j++){
                    gateways.push(homedevice[i].gateway[j]);
                    pushtogateway(homedevice[i].gateway[j].deviceId);
                }
            }
            console.log(gateways.length);
            return res.end('success');
        }
    });
}
function pushtogateway(gatewayId){
    var gatewayId = gatewayId;
    var centeria = {
        type: 'update',
        gatewayId: gatewayId,
        data: {},
        method: 'system'
    }
    var d = JSON.stringify(centeria);
    //传达数据
    gateway.command(gatewayId, d);
}

function explorer(cb){
    var paths = path.join(__dirname,'../../../systemfile');
    var sum={};
    var number=0;
    var max;
    fs.readdir(paths, function(err, files){
        //err 为错误 , files 文件名列表包含文件夹与文件
        if(err){
            console.log('error:\n' + err);
            return;
        }
        for(var i =0;i<files.length;i++){
            var a = files[i].split('.');
            sum[''+i+'']=0;
            sum[''+i+''] = a[0]*100+a[1]*10+a[2]*1+sum[''+i+''];
            if(sum[''+i+'']>number){
                number = sum[''+i+''];
                max = i;
            }
        }
        return cb(null,files[max]);
    });
}

