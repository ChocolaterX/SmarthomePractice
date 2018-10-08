/**
 * Created by pjf on 2017-4-17.
 */
var config = require('../../../config/config');
var mongoose = require('../../cloud_db_connect');
var Schema = mongoose.Schema;

var entranceSchema = new Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    device : {type:Schema.ObjectId,ref:'Device'},
    state: Number,     //0表示关门，1表示开门
    type:Boolean,     //正常或异常
    createdTime: Date


});


entranceSchema.index({createdTime:-1,device:1});

mongoose.model('Entrance', entranceSchema);

