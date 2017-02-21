'use strict'
const koa = require('koa');
const config = require('config');
const {errorMiddleware, throw404, accessLogger, applyRouters, checkSlashEnd} = require('middlewares')
const {initPancakeUser, setUserVisit, createEventRequest, createEventLiving, UTMCollector, ctxProcessor, LUIDHandler, callTracking, definitionRequestType, onlyUser, onlyService, initPancakeService, serviceRouter} = require('user_manager')
const {accessSectionCity, loadCities} = require('cities')
const koaBody = require('koa-body');
const {adminRouter} = require('admin')
const schedule = require('schedule')


schedule()


async function run() {
    try{
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
        appService.use(serviceRouter.routes())
        // End Service

        // Throw 404
        app.use(checkSlashEnd)
        app.use(throw404)

        app.listen(config.app.port)
    } catch (e){
        console.log(e)
    }
}

run()


