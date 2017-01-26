'use strict'
const koa = require('koa');
const config = require('config');
const db = require('database');


//require Middleware
const { errorMiddleware, throw404, accessLogger } = require('middlewares')

const admin = require('admin')





const articles = require('articles')


const app = new koa();

app.context.db = db;

// Middleware
if (config.app.debug){
    app.use(accessLogger())
}

app.use(errorMiddleware)

app.use(admin.router.routes())
app.use(articles.router.routes())
app.use(throw404)


app.listen(config.app.port)