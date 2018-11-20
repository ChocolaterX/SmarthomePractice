const router = require('koa-router')();
// const service = require('../server/service');
const user = require('./user');
// import user from "./user.js"
const device = require('./device');
const scene = require('./scene');
const networking = require('./networking');

router.get('/', async (ctx, next) => {
    await ctx.render('index', {
        title: 'Hello Koa 2!'
    })
});

router.use(user.routes(), user.allowedMethods());
router.use(device.routes(), device.allowedMethods());
router.use(scene.routes(), scene.allowedMethods());
router.use(networking.routes(), networking.allowedMethods());

module.exports = router;
