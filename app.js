'use strict'
const koa = require('koa');
const config = require('config');
const { errorMiddleware, throw404, accessLogger, applyRouters } = require('middlewares')
const { initPancakeUser, setUserVisit, createEventRequest, createEventLiving, UTMCollector, LUIDHandler, callTracking } = require('user_manager')
const { accessSectionCity, loadCities } = require('cities')
const koaBody = require('koa-body');
const {adminRouter} = require('admin')
const schedule = require('schedule')

schedule()


async function run() {
    const app = new koa();
    // Task
    app.context.cities = await loadCities()


    // Service middleware
    if (config.app.debug){
        app.use(accessLogger())
    }
    app.use(errorMiddleware)
    app.use(koaBody())

    // App middleware
    // analytics
    app.use(initPancakeUser)
    app.use(setUserVisit)
        // if POST /living/
        app.use(createEventLiving.routes())
        // return response
    app.use(createEventRequest)
    app.use(accessSectionCity)
    app.use(callTracking)
    app.use(UTMCollector)
    app.use(LUIDHandler)

    // Add routers
    applyRouters(app)

    // Throw 404
    app.use(throw404)

    app.listen(config.app.port)
}

run()


