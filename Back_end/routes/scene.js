const router = require('koa-router')();

router.prefix('/scene');

router.get('/', function (ctx, next) {
    ctx.body = 'this is a scene response!'
});

router.get('/add', function (ctx, next) {
    ctx.body = 'this is a scene add response'
});

module.exports = router;
