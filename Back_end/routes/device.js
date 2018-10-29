const router = require('koa-router')();
const controlDeviceService = require('../server/service/device/controlDevice');
const securityDeviceService = require('../server/service/device/securityDevice');

router.prefix('/device');

router.get('/', (ctx, next) => {
    ctx.body = 'this is a device response!'
});

router.post('/control/create', async (ctx, next) => {
    await controlDeviceService.create(ctx).then(response => {
    }, err => {
    });
});

router.get('/control/list/retrive', async (ctx, next) => {
    await controlDeviceService.retrievalList(ctx).then(response => {
    }, err => {
    });
});

router.post('/control/update', async (ctx, next) => {
    await controlDeviceService.update(ctx).then(response => {
    }, err => {
    });
});

router.post('/control/delete', async (ctx, next) => {
    await controlDeviceService.delete(ctx).then(response => {
    }, err => {

    });
});

router.post('/control/command', async (ctx, next) => {
    await controlDeviceService.command(ctx).then(response => {
    }, err => {
    });
});

router.post('/control/instruction', async (ctx, next) => {
    await controlDeviceService.command(ctx).then(response => {
    }, err => {
    });
});

module.exports = router;
