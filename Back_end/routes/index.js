const router = require('koa-router')();
const service = require('../server/service');
const user = require('./user');
const device = require('./device');
const scene = require('./scene');

router.get('/', async (ctx, next) => {
    await ctx.render('index', {
        title: 'Hello Koa 2!'
    })
});

router.use(user.routes(), user.allowedMethods());
router.use(device.routes(), device.allowedMethods());
router.use(scene.routes(), scene.allowedMethods());

// router.get('/string', async (ctx, next) => {
//     ctx.body = 'koa2 string';
// });
//
// router.get('/json', async (ctx, next) => {
//     ctx.body = {
//         title: 'koa2 json'
//     }
// });

module.exports = router;
