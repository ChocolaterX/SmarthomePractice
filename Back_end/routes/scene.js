const router = require('koa-router')();
const sceneService = require('../server/service/scene/scene');

router.prefix('/scene');

router.get('/', function (ctx, next) {
    ctx.body = 'this is a scene response!'
});

router.post('/create', async (ctx, next) => {
    console.log('router: /scene/create');
    await sceneService.create(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.get('/list/retrieval', async (ctx, next) => {
    console.log('router: /scene/list/retrieval');
    await sceneService.retrievalList(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.post('/detail/retrieval', async (ctx, next) => {
    console.log('router: /scene/detail/retrieval');
    await sceneService.retrievalDetail(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.post('/update', async (ctx, next) => {
    console.log('router: /scene/update');
    await sceneService.update(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.post('/delete', async (ctx, next) => {
    console.log('router: /scene/delete');
    await sceneService.delete(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.post('/run', async (ctx, next) => {
    console.log('router: /scene/run');
    await sceneService.run(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

module.exports = router;
