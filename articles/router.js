'use strict';

const Router = require('koa-router');
const { getArticle, getArticleListScroll } = require('./store')
const logger = require('logger')(module)
const { getTemplate, loadTemplate } = require('utils')


const articlesTemplateOpts = {
    path: 'templates/articles/articles.html',
    name: 'articles'
}

const menu = {
    main: true,
    articles: true
}

loadTemplate(articlesTemplateOpts)

const articlesRouter = new Router();

articlesRouter.get('articlesList', /^\/articles\/$/, async function (ctx, next) {
    console.log(ctx.request.query)
    const {modelList, begin, end} = await getArticleListScroll()
    const template = getTemplate(articlesTemplateOpts)
    ctx.body = template(ctx.proc({ItemList: modelList, Begin: begin, End: end, HasRightSide: false, menu: menu}, ctx))
})

articlesRouter.get('articlesItem', /^\/articles\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
    const article = await getArticle(ctx.params[0], 'id')
    if (article === null){
        await next()
        return
    }
    const {modelList, begin, end}= await getArticleListScroll({direction: 0, keyValue: article.id})
    const template = getTemplate(articlesTemplateOpts)
    ctx.body = template(ctx.proc({ItemList: modelList, Item: article, Begin: begin, End: end, HasRightSide: true, menu: menu}))
})

articlesRouter.get('articlesListAjax', /^\/m\/articles$/, async function (ctx, next) {
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

articlesRouter.get('articlesItemAjax', /^\/m\/articles\/([0-9a-zA-Z_\-]+)$/, async function (ctx, next) {
    try {
        const article = await getArticle(ctx.params[0])
        let response = { Success: true, Data: { Item: article} }
        ctx.type = 'application/json'
        ctx.body = response
    } catch (e){
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

module.exports = { articlesRouter: articlesRouter}