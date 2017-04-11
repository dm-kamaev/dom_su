'use strict'
const koa = require('koa');
const config = require('config');
const {errorMiddleware, throw404, accessLogger, applyRouters, applyServiceRouters, checkSlashEnd} = require('middlewares')
const {initPancakeUser, setUserVisit, createEventRequest, createEventLiving, UTMCollector, ctxProcessor, LUIDHandler, callTracking, definitionRequestType, onlyUser, onlyService, initPancakeService } = require('user_manager')
const {accessSectionCity, loadCities} = require('cities')
const koaBody = require('koa-body');
const schedule = require('schedule')
const userAgent = require('koa-useragent');
const logger = require('logger')(module)




async function run() {
    try{
        schedule()
        const app = new koa();
        // with HTTP headers X-Dom-Service
        let appService = {use: (middleware) => app.use(onlyService(middleware))}
        // all without HTTP headers X-Dom-Service
        let appUser = { use: (middleware) => app.use(onlyUser(middleware))}

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



        // App middleware
        app.use(definitionRequestType)

        // Pancake User middleware
        appUser.use(initPancakeUser)
        appUser.use(setUserVisit)
        // if POST /living/
            appUser.use(createEventLiving.routes())
        // return response
        appUser.use(createEventRequest)
        appUser.use(accessSectionCity)
        appUser.use(callTracking)
        appUser.use(UTMCollector)
        appUser.use(LUIDHandler)

        // Add routers Pancake User
        applyRouters(appUser)

        // Only external service
        appService.use(initPancakeService)
        // Add router service
        applyServiceRouters(appService)
        //appService.use(serviceRouter.routes())
        // End Service

        // Throw 404
        app.use(checkSlashEnd)
        app.use(throw404)

        app.listen(config.app.port)
    } catch (e){
        logger.error(e)
    }
}

run()


