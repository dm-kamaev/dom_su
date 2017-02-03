'use strict';

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const fsSync = require('fs')
const Handlebars = require('handlebars');
const { getNews, getNewsListScroll } = require('./store')
const logger = require('logger')(module)


const newsRouter = new Router({
  prefix: '/news'
});

const newsRouterAjax = new Router({
    prefix: '/m/news'
})

// function readTemplate () {
//     let html = fsSync.readFileSync('templates/articles/articles.html', 'utf-8')
//     return Handlebars.compile(html)
// }
//
// let template = readTemplate()

newsRouter.get('newsList', '/', async function (ctx, next) {
    const {modelList, begin, end} = await getNewsListScroll()
    const html = await fs.readFile('templates/news/news.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Begin: begin, End: end})
})

newsRouter.get('newsItem', '/:key/', async function (ctx, next) {
    const news = await getNews(ctx.params.key, 'id')
    const {modelList, begin, end}= await getNewsListScroll({direction: 0, keyValue: news.id})
    const html = await fs.readFile('templates/news/news.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Item: article, Begin: begin, End: end})
})

newsRouterAjax.get('newsListAjax', '/', async function (ctx, next) {
    try {
        const direction = ctx.query.direction;
        const news = await getNews(ctx.query.key, 'id')
        const {modelList, begin, end} = await getNewsListScroll({keyValue: news.id, direction: direction})
        const response = { Success: true, Data: {ItemList: modelList, Begin: begin, End: end }}
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(response)
    } catch (e) {
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

newsRouterAjax.get('newsItemAjax', '/:key/', async function (ctx, next) {
    try {
        console.log(ctx.params.key)
        const news = await getNews(ctx.params.key)
        let response = { Success: true, Data: { Item: news} }
        ctx.type = 'application/json'
        ctx.body = response
    } catch (e){
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

module.exports = { newsRouterAjax: newsRouterAjax, newsRouter: newsRouter}