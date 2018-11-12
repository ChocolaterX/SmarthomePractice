//require koa module
const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const cors = require('koa-cors');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const session = require('koa-session');

//require local module
const gateway = require('./gateway/index');

//require router files
const index = require('./routes/index');
const user = require('./routes/user');
const device = require('./routes/device');
const scene = require('./routes/scene');

//require server files
const model = require('./server/model');

// error handler
onerror(app);

//koa-session
app.keys = ['this is keys'];//我理解为一个加密的钥匙，类似一个token
app.use(session({
    key: 'koa:sess', /** cookie的名称，可以不管 */
    maxAge: 60 * 60 * 1000, /** (number) maxAge in ms (default is 1 days)，cookie的过期时间，这里表示2个小时 */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
}, app));

// middlewares
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));
app.use(cors());

app.use(views(__dirname + '/views', {
    extension: 'pug'
}));


// logger
app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});

// routes
app.use(index.routes(), index.allowedMethods());
// app.use(user.routes(), user.allowedMethods());
// app.use(device.routes(), device.allowedMethods());
// app.use(scene.routes(), scene.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

module.exports = app;
