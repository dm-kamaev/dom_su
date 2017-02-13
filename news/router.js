'use strict';

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const fsSync = require('fs')
const Handlebars = require('handlebars');
const { getNews, getNewsListScroll } = require('./store')
const logger = require('logger')(module)


const newsRouter = new Router();

// function readTemplate () {
//     let html = fsSync.readFileSync('templates/articles/articles.html', 'utf-8')
//     return Handlebars.compile(html)
// }
//
// let template = readTemplate()

newsRouter.get('newsList', /^\/news\/$/, async function (ctx, next) {
    const {modelList, begin, end} = await getNewsListScroll()
    const html = await fs.readFile('templates/news/news.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Begin: begin, End: end, HasRightSide: false})
})

newsRouter.get('newsItem', /^\/news\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
    const news = await getNews(ctx.params[0], 'id')
    const {modelList, begin, end}= await getNewsListScroll({direction: 0, keyValue: news.id})
    const html = await fs.readFile('templates/news/news.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Item: news, Begin: begin, End: end, HasRightSide: true})
})

newsRouter.get('newsListAjax', /^\/m\/news\/$/, async function (ctx, next) {
    try {
        const direction = ctx.query.direction;
        const news = await getNews(ctx.query.key, 'id')
        const {modelList, begin, end} = await getNewsListScroll({keyValue: news.id, direction: direction})
        const response = { Success: true, Data: {ItemList: modelList, Begin: begin, End: end }}
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(response)
    } catch (e) {
        logger.error(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

newsRouter.get('newsItemAjax', /^\/m\/news\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
    try {
        const news = await getNews(ctx.params[0])
        let response = { Success: true, Data: { Item: news} }
        ctx.type = 'application/json'
        ctx.body = response
    } catch (e){
        logger.error(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

module.exports = {newsRouter: newsRouter}