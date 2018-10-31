const controlDeviceModel = require('../../model/controlDevice');

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


createControlDevice('gateway001', 0);
createControlDevice('gateway002', 0);
createControlDevice('curtain001', 1);
createControlDevice('curtain002', 1);
createControlDevice('socket', 2);
createControlDevice('socket', 2);
createControlDevice('switch', 3);
createControlDevice('switch', 3);
