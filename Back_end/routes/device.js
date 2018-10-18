const router = require('koa-router')();
const controlDevice = require('../server/service/device/controlDevice');
// const securityDevice = require('../server/service/device/securityDevice');

router.prefix('/device');

router.get('/', function (ctx, next) {
    ctx.body = 'this is a device response!'
});

router.get('/control/add', async function (ctx, next) {
    controlDevice.addDevice('data', (message) => {
        ctx.body = message;
    });
    // ctx.body = 'this is a control device add response';
});

module.exports = router;
