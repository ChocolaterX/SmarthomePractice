/**
 * <copyright file="services.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>11/21/2017</date>
 * <summary>
 *  。
 * </summary>
 */

//services
exports.services = function (app) {

    //main
    app.use('/service', require('./service/main/index'));

    //device
    app.use('/service', require('./service/device/index'));

    //gateway
    app.use('/service',require('./service/gateway/index'));

    //scene
    app.use('/service', require('./service/scene/index'));

    //security
    app.use('/service', require('./service/security/index'));

    //sense
    //app.use('/service',require('./service/sense/index'));

    //setting
    app.use('/service',require('./service/setting/index'));

    //smartpen
    app.use('/service',require('./service/smartpen/index'));

    //sound
    app.use('/service',require('./service/sound/index'));
    
    //jpush
    //app.use('/service',require('./service/jpush/index'));

    //infrared
    app.use('/service',require('./service/infrared/index'));
	
	//message
    //app.use('/service',require('./service/message/index'));

};