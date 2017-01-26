'use strict';

const Router = require('koa-router');
const router = new Router();
const fs = require('fs-promise')
const Handlebars = require('handlebars');
const { getArticle, getArticleList } = require('./store')






//let template;

// async function test() {
//     let source = await fs.readFile('./articles/articles.html', 'utf-8')
//     template = Handlebars.compile(source)
// }

//test()


router.get('/articles/', async function (ctx, next) {
    const source = await fs.readFile('templates/articles/articles.html', 'utf-8')
    const template = Handlebars.compile(source)
    const articles = await getArticleList()
    const article = await getArticle()
    ctx.body = template({articles: articles, article: article})
})

router.get('/articles/:id', async function (ctx, next) {
    const articles = await getArticleList()
    const article = await getArticle(ctx.params.id)
    const source = await fs.readFile('templates/articles/articles.html', 'utf-8')
    const template = Handlebars.compile(source)
    ctx.body = template({articles: articles, article: article})
})

router.get('/api/articles/', async function (ctx, next) {
    const articles = await getArticleList()
    ctx.type = 'application/json'
    ctx.body = JSON.stringify(articles)
})

router.get('/api/articles/:id', async function (ctx, next) {
    const article = await getArticle(ctx.params.id)
    ctx.type = 'application/json'
    ctx.body = JSON.stringify(article)
})

module.exports = router