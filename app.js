'use strict'
const koa = require('koa');
const config = require('config');
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
  callTracking,
  definitionRequestType,
  onlyUser,
  onlyService,
  initPancakeService
} = require('user_manager');
const {
  accessSectionCity,
  loadCities
} = require('cities');
const routerProxyRequestTo1C = require('proxyRequestTo1C/routerProxyRequestTo1C.js');
const routerStaffConversation = require('staff/staff_conversation/routerStaffConversation.js');
const koaBody = require('koa-body');
const schedule = require('schedule');
const userAgent = require('koa-useragent');
const logger = require('/p/clientPA/lib/logger.js');

process.on('uncaughtException', (err) => {
  logger.warn('ERROR= '+err);
});

process.on('unhandledRejection', (reason, p) => {
  logger.warn('Promise failed ='+reason+' '+p);
});

async function run() {
  try {
    schedule()
    const app = new koa();

    // with HTTP headers X-Dom-Service
    let appService = {
        use: (middleware) => app.use(onlyService(middleware))
      }
      // all without HTTP headers X-Dom-Service
    let appUser = {
      use: (middleware) => app.use(onlyUser(middleware))
    }

    // Task
    app.context.cities = await loadCities()
    app.context.analytics = config.analytics
    app.context.proc = ctxProcessor
      // Load helpers
    require('utils/helpers')

    // General Service middleware
    if (config.app.debug) {
      app.use(accessLogger())
    }
    app.use(errorMiddleware)
    app.use(koaBody())
    app.use(userAgent)

    // FOR PANCAKE
    app.use(async function(ctx, next) {
      const { request: req, response: res } = ctx;
      logger.log('HEADERS= '+JSON.stringify(req.headers, null, 2));
      if (req.method === 'POST' || req.method === 'GET') {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Credentials", "true");
      }
      if (req.method === 'OPTIONS') {
        logger.log('set header for OPTIONS');
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Headers", "status, a, b, X-Dom-Auth, Accept-Encoding, Accept, Accept-Language, Overwrite, Destination, Content-Type, content-type, Connection, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control, Pragma, User-Agent, Referer");
        res.set("Access-Control-Allow-Credentials", "true");
        res.set("Access-Control-Allow-Method", "PROPFIND, PROPPATCH, COPY, MOVE, DELETE, MKCOL, LOCK, UNLOCK, PUT, GETLIB, VERSION-CONTROL, CHECKIN, CHECKOUT, UNCHECKOUT, REPORT, UPDATE, CANCELUPLOAD, HEAD, OPTIONS, GET, POST");
        res.set("Access-Control-Max-Age", "86400");
        ctx.status = 200;
        return;
      }
      await next();
    });


    // App middleware
    app.use(definitionRequestType)

    // Pancake User middleware
    appUser.use(initPancakeUser)
    appUser.use(setUserVisit)
      // if POST /living/
    appUser.use(createEvent.routes())
      // return response
    appUser.use(createEventRequest)
    appUser.use(accessSectionCity)
    appUser.use(callTracking)
    appUser.use(UTMCollector)
    appUser.use(LUIDHandler)

    // Add routers Pancake User
    applyRouters(appUser);
    appUser.use(routerProxyRequestTo1C.routes());
    appUser.use(routerStaffConversation.routes());

    // Only external service
    appService.use(initPancakeService)
      // Add router service
    applyServiceRouters(appService)
      //appService.use(serviceRouter.routes())
      // End Service

    // Throw 404
    app.use(checkSlashEnd);
    app.use(throw404);

    logger.log('START ON PORT '+config.app.port);
    app.listen(config.app.port)
  } catch (e) {
    logger.warn(e);
  }
}

run()