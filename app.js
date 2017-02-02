'use strict'
const koa = require('koa');
const config = require('config');
const { errorMiddleware, throw404, accessLogger, applyRouters } = require('middlewares')
const { setUserUUID, setUserVisit, eventCreator } = require('user_manager')
const schedule = require('schedule')


schedule()



const app = new koa();



// Service middleware
if (config.app.debug){
    app.use(accessLogger())
}
app.use(errorMiddleware)

// App middleware
// analytics
app.use(setUserUUID)
// app.use(setUserVisit)
// app.use(eventCreator)

// Add routers
applyRouters(app)

// Throw 404
app.use(throw404)



app.listen(config.app.port)