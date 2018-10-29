const router = require('koa-router')();
const userService = require('../server/service/main/user');

router.prefix('/user');

router.get('/', async function (ctx, next) {
    ctx.body = 'this is a users response!'
});

router.post('/login', async (ctx, next) => {
    console.log('router: /user/login');
    await userService.login(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

module.exports = router;
