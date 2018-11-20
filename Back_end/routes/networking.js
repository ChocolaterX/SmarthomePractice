const router = require('koa-router')();
// const controlDeviceService = require('../server/service/device/controlDevice');
// const securityDeviceService = require('../server/service/device/securityDevice');
// const commandService = require('../server/service/device/command');
const networkingService = require('../server/service/networking/networking');

router.prefix('/networking');

router.get('/', (ctx, next) => {
    ctx.body = 'this is a networking response!'
});

/*
 * networking
  */
router.get('/gateway/list/retrieval', async (ctx, next) => {
    console.log('router: /networking/gateway/list/retrieval');
    await networkingService.retrievalGatewayList(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.post('/open', async (ctx, next) => {
    console.log('router: /networking/open');
    await networkingService.open(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.get('/device/list/retrieval', async (ctx, next) => {
    console.log('router: /networking/device/list/retrieval');
    await networkingService.retrievalDeviceList(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.post('/device/delete', async (ctx, next) => {
    console.log('router: /networking/device/delete');
    await networkingService.delete(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

module.exports = router;