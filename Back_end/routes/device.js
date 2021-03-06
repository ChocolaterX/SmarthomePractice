const router = require('koa-router')();
const controlDeviceService = require('../server/service/device/controlDevice');
const securityDeviceService = require('../server/service/device/securityDevice');
const commandService = require('../server/service/device/command');

router.prefix('/device');

router.get('/', (ctx, next) => {
    ctx.body = 'this is a device response!'
});

/*
 * control device
 * contains: create, retrieval, update, delete, command control, instruction control
 */
router.post('/control/create', async (ctx, next) => {
    console.log('router: /control/create');
    await controlDeviceService.create(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.get('/control/list/retrieval', async (ctx, next) => {
    console.log('router: /control/retrieval');
    await controlDeviceService.retrievalList(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.post('/control/update', async (ctx, next) => {
    console.log('router: /control/update');
    await controlDeviceService.update(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.post('/control/delete', async (ctx, next) => {
    console.log('router: /control/delete');
    await controlDeviceService.delete(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.post('/control/command', async (ctx, next) => {
    console.log('router: /control/command');
    await commandService.command(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.post('/control/instruction', async (ctx, next) => {
    console.log('router: /control/instruction');
    await commandService.instruction(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.get('/control/console', async (ctx, next) => {
    console.log('router: /control/console');
    await controlDeviceService.console(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

/*
 * security device
 * contains: create, retrieval, update, delete, command control, instruction control
 */
router.post('/security/create', async (ctx, next) => {
    console.log('router: /security/create');
    await securityDeviceService.create(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.get('/security/list/retrieval', async (ctx, next) => {
    console.log('router: /security/list/retrieval');
    await securityDeviceService.retrievalList(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.post('/security/update', async (ctx, next) => {
    console.log('router: /security/update');
    await securityDeviceService.update(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.post('/security/delete', async (ctx, next) => {
    console.log('router: /security/delete');
    await securityDeviceService.delete(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

// router.post('/security/command', async (ctx, next) => {
//     console.log('router: /security/command');
//     await securityDeviceService.command(ctx).then(response => {
//         ctx.body = response;
//     }, err => {
//         ctx.body = err;
//     });
// });

// router.post('/security/instruction', async (ctx, next) => {
//     console.log('router: /security/instruction');
//     await securityDeviceService.instruction(ctx).then(response => {
//         ctx.body = response;
//     }, err => {
//         ctx.body = err;
//     });
// });

router.get('/security/console', async (ctx, next) => {
    console.log('router: /security/console');
    await securityDeviceService.console(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

module.exports = router;
