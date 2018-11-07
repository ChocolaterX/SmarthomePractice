const controlDeviceModel = require('../../model/controlDevice');
const securityDeviceModel = require('../../model/securityDevice');

function createControlDevice(mac, type) {
    let controlDeviceEntity = new controlDeviceModel({
        mac,
        type
    });

    controlDeviceEntity.save((err) => {
        if (err) {
            console.log(`err: ${err}`);
        }
        else {
            console.log(`设备 ${mac} 插入成功`);
        }
    });
}

function createSecurityDevice(mac, type) {
    let securityDeviceEntity = new securityDeviceModel({
        mac,
        type
    });

    securityDeviceEntity.save((err) => {
        if (err) {
            console.log(`err: ${err}`);
        }
        else {
            console.log(`设备 ${mac} 插入成功`);
        }
    });
}


// createControlDevice('gateway001', 0);
// createControlDevice('gateway002', 0);
// createControlDevice('curtain001', 1);
// createControlDevice('curtain002', 1);
// createControlDevice('socket', 2);
// createControlDevice('socket', 2);
// createControlDevice('switch', 3);
// createControlDevice('switch', 3);

createSecurityDevice('door001',1);
createSecurityDevice('door002',1);
createSecurityDevice('door003',1);
createSecurityDevice('infrared001',2);
createSecurityDevice('infrared002',2);
createSecurityDevice('infrared003',2);
createSecurityDevice('lock',3);
createSecurityDevice('lock',3);
createSecurityDevice('lock',3);

