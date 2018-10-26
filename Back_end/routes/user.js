const router = require('koa-router')();
const userService = require('../server/service/main/user');

router.prefix('/user');

router.get('/', async function (ctx, next) {
    ctx.body = 'this is a users response!'
});

router.post('/login', async function (ctx, next) {
    console.log('router: /user/login');
    await userService.login(ctx).then(function (response) {
        // console.log('resolve response:');
        // console.log(response);
        ctx.body = response;
    }, function (err) {
        console.log('reject');
        ctx.body = err;
    });
});

router.get('/bar', async function (ctx, next) {
    ctx.body = 'this is a users/bar response'
});

module.exports = router;
