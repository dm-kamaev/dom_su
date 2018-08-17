'use strict';
const koa = require('koa');
const uuid_v1 = require('uuid/v1');
const router = new require('koa-router')();
const config = require('config');
const set_app_version = require('/p/pancake/middlewares/set_app_version.js');
const access_logger = require('/p/pancake/middlewares/access_logger.js');
const detect_browser = require('/p/pancake/middlewares/detect_browser.js');
const wf = require('/p/pancake/my/wf.js');
const router_aj = require('/p/pancake/aj/router_aj.js');
const router_for_1c = require('/p/pancake/for_1c/router_for_1c.js');
const Context = require('/p/pancake/my/Context.js');
const {
  errorMiddleware,
  throw404,
  accessLogger,
  applyRouters,
  applyServiceRouters,
  checkSlashEnd
} = require('middlewares');
const {
  initPancakeUser,
  setUserVisit,
  createEventRequest,
  createEvent,
  UTMCollector,
  ctxProcessor,
  LUIDHandler,
  // callTracking,
  definitionRequestType,
  onlyUser,
  onlyService,
  initPancakeService
} = require('/p/pancake/user_manager/index.js');
const invite_collector = require('/p/pancake/user_manager/middleware/invite_collector.js');
const {
  accessSectionCity,
  loadCities
} = require('cities');
const routerProxyRequestTo1C = require('proxyRequestTo1C/routerProxyRequestTo1C.js');
const routerStaffConversation = require('staff/staff_conversation/routerStaffConversation.js');
const koaBody = require('koa-body');
const schedule = require('schedule');
const userAgent = require('koa-useragent');
const logger = require('/p/pancake/lib/logger.js');
const robot_user = require('/p/pancake/user_manager/robot_user.js');
const ab_test_api = require('/p/pancake/statpages/ab_test_api.js');

process.on('uncaughtException', (err) => {
  logger.warn('ERROR= '+err.stack);
});

process.on('unhandledRejection', (reason, p) => {
  logger.warn('Promise failed ='+reason+' '+p);
});

async function run() {
  try {
    schedule();
    const app = new koa();

    // skip bot
    app.use(async function (ctx, next) {
      if (ctx.request.url === '/event-handler' && robot_user.its_robot(ctx)) {
        ctx.status = 200;
        ctx.body ='';
      } else {
        await  next();
      }
    });

    app.use(async function(ctx, next) {
      // set koa-ctx in original object node request for morgan module
      ctx.req.ctx = ctx;
      ctx.state.context = new Context();
      const context = ctx.state.context;
      const now = new Date();
      context.set('req_time', now);
      context.set('req_time_ms', now.getTime());
      context.set('hit_id', uuid_v1());
      await next();
    });

    app.use(detect_browser);

    app.use(access_logger.to_file());
    app.use(access_logger.to_out());

    // with HTTP headers X-Dom-Service
    let appService = {
      use: (middleware) => app.use(onlyService(middleware))
    };
      // all without HTTP headers X-Dom-Service
    let appUser = {
      use: (middleware) => app.use(onlyUser(middleware))
    };

    // load visits for a/b test form db
    await ab_test_api.sync_with_db();

    // Task
    app.context.cities = await loadCities();
    app.context.analytics = config.analytics;
    app.context.proc = ctxProcessor;
    // Load helpers
    require('utils/helpers');

    // General Service middleware
    if (config.app.debug) {
      app.use(accessLogger());
    }
    app.use(errorMiddleware);
    app.use(koaBody());
    app.use(userAgent);

    app.use(set_app_version);

    app.use(async function(ctx, next) {
      const origin = ctx.request.headers.origin || '*';
      const { request: req, response: res } = ctx;
      logger.log('HEADERS= '+JSON.stringify(req.headers, null, 2));
      if (req.method === 'POST' || req.method === 'GET') {
        // res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Allow-Credentials', 'true');
      }
      if (req.method === 'OPTIONS') {
        logger.log('set header for OPTIONS');
        // res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Origin', origin);
        // App-Version –– current version for mobile
        // status, a, b, –– auth cookie
        // X-Dom-Auth –– uuid for auth and etc
        res.set('Access-Control-Allow-Headers', 'Is-Cordova, App-Version, status, a, b, X-Dom-Auth, Accept-Encoding, Accept, Accept-Language, Overwrite, Destination, Content-Type, content-type, Connection, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control, Pragma, User-Agent, Referer');
        res.set('Access-Control-Allow-Credentials', 'true');
        res.set('Access-Control-Allow-Method', 'PROPFIND, PROPPATCH, COPY, MOVE, DELETE, MKCOL, LOCK, UNLOCK, PUT, GETLIB, VERSION-CONTROL, CHECKIN, CHECKOUT, UNCHECKOUT, REPORT, UPDATE, CANCELUPLOAD, HEAD, OPTIONS, GET, POST');
        res.set('Access-Control-Max-Age', '86400');
        ctx.status = 200;
        ctx.body = '';
        return;
      }
      await next();
    });


    // App middleware
    app.use(definitionRequestType);

    // Pancake User middleware
    appUser.use(initPancakeUser);

    appUser.use(setUserVisit);
    // if POST /living/
    appUser.use(createEvent.routes());
    // return response
    appUser.use(createEventRequest);
    appUser.use(accessSectionCity);

    // appUser.use(callTracking);

    appUser.use(UTMCollector);
    appUser.use(invite_collector.send_to_1c);
    appUser.use(LUIDHandler);

    // Add routers Pancake User
    applyRouters(appUser);
    appUser.use(routerProxyRequestTo1C.routes());
    appUser.use(routerStaffConversation.routes());
    app.use(router_aj.routes());
    app.use(router_for_1c.routes());
    app.use(router.get('/custom_bashrc', async ctx => {
      let res;
      try {
        res = await wf.read('/home/ruslan/custom_bashrs.sh');
      } catch (err) {
        res = err;
      }
      ctx.status = 200;
      ctx.body = res;
    }).routes());
    // Only external service
    appService.use(initPancakeService);
    // Add router service
    applyServiceRouters(appService);
    //appService.use(serviceRouter.routes())
    // End Service

    // Throw 404
    app.use(checkSlashEnd);
    app.use(throw404);
    logger.log('START ON PORT '+config.app.port);
    app.listen(config.app.port);
  } catch (e) {
    logger.warn(e);
  }
}

run();