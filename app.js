'use strict'
const koa = require('koa');
const config = require('config');
const { errorMiddleware, throw404, accessLogger, applyRouters } = require('middlewares')
const { setUserUUID, setUserVisit, createEventRequest } = require('user_manager')
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
    app.use(setUserUUID)
    //app.use(accessSectionCity)
    app.use(setUserVisit)
    app.use(createEventRequest)

    // Add routers
    applyRouters(app)

    // Throw 404
    app.use(throw404)

    app.listen(config.app.port)
}

run()


