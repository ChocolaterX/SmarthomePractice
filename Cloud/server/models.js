/**
 * <copyright file="services.js" company="Run">
 * Copyright (c) 2017 All Right Reserved, http: //www.greenorbs.com/
 *  This source is subject to the Run Permissive License.
 *  Please see the License.txt file for more information.
 *  All other rights reserved.
 * </copyright>
 * <author>Suyang Jiang</author>
 * <email>jiangsuyang1111@163.com</email>
 * <date>11/22/2017</date>
 * <summary>
 *  。
 * </summary>
 */

//main
require('./model/main/admin.js');
require('./model/main/region.js');
require('./model/main/user.js');

//device
require('./model/device/device.js');
//require('./model/device/gateway.js');

//scene
require('./model/scene/scene.js');

//security
require('./model/security/securityDevice.js');
require('./model/security/securityLog.js');

//smartpen
require('./model/smartpen/soundKeyword.js');
require('./model/smartpen/actionBinding.js');

//action

//setting
require('./model/setting/setting.js');

//infrared
require('./model/infrared/infraredCommand');
require('./model/infrared/telecontroller');

//log
//require('./model/log/adminlog.js');
//require('./model/log/userlog.js');

//message
//require('./model/message/message.js');

//sense
//require('./model/sense/air.js');
//require('./model/sense/humidity.js');
//require('./model/sense/illumination.js');
//require('./model/sense/smoke.js');
//require('./model/sense/temperature.js');
//require('./model/sense/sensor.js');
//require('./model/sense/senseSetting.js');
//entrance
//require('./model/entrance/entranceSetting.js');
//require('./model/entrance/entrance.js');

//smartpen
//require('./model/smartpen/actionbinding.js');
//require('./model/smartpen/actionfeature.js');
//require('./model/smartpen/smartpen.js');
//require('./model/smartpen/soundcommand.js');
//require('./model/smartpen/sounddevice.js');
//require('./model/smartpen/soundscene.js');