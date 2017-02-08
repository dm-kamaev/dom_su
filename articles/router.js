'use strict';

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const fsSync = require('fs')
const Handlebars = require('handlebars');
const { getArticle, getArticleListScroll } = require('./store')
const logger = require('logger')(module)
let moment = require('moment')



Handlebars.registerHelper('raw', function(options) {
  return options.fn(this);
});

Handlebars.registerHelper('formatDate', function (date) {
    return moment.parseZone(moment.utc(date).format()).format("DD.MM.YYYY")
})

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

const articlesRouter = new Router({
  prefix: '/articles'
});

const articlesRouterAjax = new Router({
    prefix: '/m/articles'
})

// function readTemplate () {
//     let html = fsSync.readFileSync('templates/articles/articles.html', 'utf-8')
//     return Handlebars.compile(html)
// }
//
// let template = readTemplate()

articlesRouter.get('articlesList', '/', async function (ctx, next) {
    const {modelList, begin, end} = await getArticleListScroll()
    const html = await fs.readFile('templates/articles/articles.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Begin: begin, End: end, HasRightSide: false})
})

articlesRouter.get('articlesItem', '/:key/', async function (ctx, next) {
    const article = await getArticle(ctx.params.key, 'id')
    const {modelList, begin, end}= await getArticleListScroll({direction: 0, keyValue: article.id})
    const html = await fs.readFile('templates/articles/articles.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({ItemList: modelList, Item: article, Begin: begin, End: end, HasRightSide: true})
})

articlesRouterAjax.get('articlesListAjax', '/', async function (ctx, next) {
    try {
        const direction = ctx.query.direction;
        const article = await getArticle(ctx.query.key, 'id')
        const {modelList, begin, end} = await getArticleListScroll({keyValue: article.id, direction: direction})
        const response = { Success: true, Data: {ItemList: modelList, Begin: begin, End: end }}
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(response)
    } catch (e) {
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

articlesRouterAjax.get('articlesItemAjax', '/:key/', async function (ctx, next) {
    try {
        const article = await getArticle(ctx.params.key)
        let response = { Success: true, Data: { Item: article} }
        ctx.type = 'application/json'
        ctx.body = response
    } catch (e){
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

module.exports = { articlesRouterAjax: articlesRouterAjax, articlesRouter: articlesRouter}