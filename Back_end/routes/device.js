const router = require('koa-router')();

router.prefix('/device');

router.get('/', function (ctx, next) {
    ctx.body = 'this is a device response!'
});

router.get('/control/add', function (ctx, next) {
    ctx.body = 'this is a control device add response'
});

module.exports = router;
