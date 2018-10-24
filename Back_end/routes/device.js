const router = require('koa-router')();
const controlDevice = require('../server/service/device/controlDevice');
// const securityDevice = require('../server/service/device/securityDevice');

router.prefix('/device');

router.get('/', function (ctx, next) {
    ctx.body = 'this is a device response!'
});

router.post('/control/add', async function (ctx, next) {
    // console.log('inside /control/add');
    // ctx.body = 'this is a control device add response';
    console.log('/control/add');
    // let {name, number} = ctx.request.body;          //解构
    // console.log(ctx.request.body.name);
    // console.log(ctx.request.body.number);
    await controlDevice.addDevice('data', (message) => {
        ctx.body = message;
    });
    // ctx.body = 'this is a control device add response';
});

module.exports = router;
