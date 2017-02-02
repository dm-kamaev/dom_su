'use strict';

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const fsSync = require('fs')
const Handlebars = require('handlebars');
const { getArticle, getArticleList, getArticleListScroll } = require('./store')



Handlebars.registerHelper('raw', function(options) {
  return options.fn(this);
});

const articlesRouter = new Router({
  prefix: '/articles'
});

const articlesRouterAjax = new Router({
    prefix: '/m/articles'
})

function readTemplate () {
    let html = fsSync.readFileSync('templates/articles/articles.html', 'utf-8')
    return Handlebars.compile(html)
}

let template = readTemplate()

articlesRouter.get('articlesList', '/', async function (ctx, next) {
    const {modelList, begin, end} = await getArticleListScroll()
    ctx.body = template({articles: modelList, article: modelList[0], begin: begin, end: end})
})

articlesRouter.get('articlesItem', '/:key/', async function (ctx, next) {
    const article = await getArticle(ctx.params.key)
    const {modelList, start, end}= await getArticleListScroll({direction: 0, key: article.id})
    const html = await fs.readFile('templates/articles/articles.html', 'utf-8')
    const template = Handlebars.compile(html)
    ctx.body = template({articles: modelList, article: article, start: start, end: end})
})

articlesRouterAjax.get('ajaxArticlesList', '/', async function (ctx, next) {
    try {
        const direction = ctx.params.direction;
        const key = ctx.params.key;
        const {modelList, begin, end} = await getArticleListScroll({keyValue: key, direction: direction})
        const response = { Success: true, Data: {ItemList: modelList, Begin: begin, End: end }}
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(response)
    } catch (e) {
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

articlesRouterAjax.get('ajaxArticlesItem', '/:key/', async function (ctx, next) {
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