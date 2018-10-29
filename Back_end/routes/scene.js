const router = require('koa-router')();
const sceneService = require('../server/service/scene/scene');

router.prefix('/scene');

router.get('/', function (ctx, next) {
    ctx.body = 'this is a scene response!'
});


router.post('/create', async (ctx, next) => {
    await sceneService.create(ctx).then(response => {
    }, err => {
    });
});

router.get('/list/retrive', async (ctx, next) => {
    await sceneService.retrievalList(ctx).then(response => {
    }, err => {
    });
});

router.post('/update', async (ctx, next) => {
    await sceneService.update(ctx).then(response => {
    }, err => {
    });
});

router.post('/delete', async (ctx, next) => {
    await sceneService.delete(ctx).then(response => {
    }, err => {

    });
});

router.post('/command', async (ctx, next) => {
    await sceneService.command(ctx).then(response => {
    }, err => {
    });
});

module.exports = router;
