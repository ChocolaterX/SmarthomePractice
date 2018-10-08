/**
 * <copyright file="scene.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>12/06/2017</date>
 * <summary>
 *  。
 * </summary>
 */

var JPush = require("../lib/JPush/JPush.js");
var client = JPush.buildClient('47b9ae7e08c06fa6dab44d12', '87f9642b66d880f2a4e10da2'); //appKey and Master Secret 

//easy push
client.push().setPlatform(JPush.ALL)
	.setAudience(JPush.ALL)
	.setNotification('Hi, JPush', JPush.ios('ios alert', 'happy', 5))
	.send(function(err, res) {
		if(err) {
			console.log(err.message)
		} else {
			console.log('Sendno: ' + res.sendno)
			console.log('Msg_id: ' + res.msg_id)
		}
	});