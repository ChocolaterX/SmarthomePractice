const router = require('koa-router')();
const userService = require('../server/service/main/user');

router.prefix('/user');

router.get('/', async function (ctx, next) {
    ctx.body = 'this is a users response!'
});

router.post('/login', async (ctx, next) => {
    console.log('router: /user/login');
    await userService.login(ctx).then(response => {
        if (response.errorCode === 0) {
            // console.log('\n1\n');
            if (!!(ctx.session)) {
                // console.log('\n2\n');
                let user = response.user;
                let session = {user};
                // console.log(user);
                // console.log(session);
                ctx['session'] = session;
                // console.log(ctx.session);
            }
        }
        // console.log('\n3\n');
        // console.log(ctx);
        // console.log('\n3.5\n');
        // console.log(ctx.session);
        // console.log('\n4\n');
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.get('/logout', async (ctx, next) => {
    console.log('router: /user/logout');
    await userService.logout(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

router.get('/info', async (ctx, next) => {
    console.log('router: /user/info');
    await userService.info(ctx).then(response => {
        ctx.body = response;
    }, err => {
        ctx.body = err;
    });
});

module.exports = router;
