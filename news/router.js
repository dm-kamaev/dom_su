'use strict';

const Router = require('koa-router');
const router = new Router();
const { getNews, getNewsListScroll } = require('./store')
const logger = require('logger')(module)
const { getTemplate, loadTemplate } = require('utils')


const newsTemplateOpts = {
    path: 'templates/news/news.html',
    name: 'news'
}

const menu = {
    main: true,
    news: true
}

loadTemplate(newsTemplateOpts)


const newsRouter = new Router();

newsRouter.get('newsList', /^\/news\/$/, async function (ctx, next) {
    const {modelList, begin, end} = await getNewsListScroll({where: {city_id: ctx.state.pancakeUser.city.id}})
    const template = getTemplate(newsTemplateOpts)
    ctx.body = template(ctx.proc({ItemList: modelList, Begin: begin, End: end, HasRightSide: false, menu: menu}))
})

newsRouter.get('newsItem', /^\/news\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
  const user = ctx.state.pancakeUser;
  const userCityId = user.city.id;
  const news = await getNews(ctx.params[0], userCityId, ['id', 'city_id']);

  if (!news) {
    ctx.status = 302;
    ctx.redirect('/news');
    return;
  }

  const { modelList, begin, end } = await getNewsListScroll({
    direction: 0,
    keyValue: news.id,
    where: {
      city_id: user.city.id
    }
  });
  const template = getTemplate(newsTemplateOpts);
  let noindex = true;

  if (news.city_id === userCityId) {
    noindex = false;
  }

  ctx.body = template(ctx.proc({
    ItemList: modelList,
    Item: news,
    Begin: begin,
    End: end,
    HasRightSide: true,
    menu,
    noindex,
  }))
})

newsRouter.get('newsListAjax', /^\/m\/news$/, async function (ctx, next) {
    try {
        const direction = ctx.query.direction;
        const news = await getNews(ctx.query.key, ctx.state.pancakeUser.city.id, 'id')
        const {modelList, begin, end} = await getNewsListScroll({keyValue: news.id, direction: direction, where: {city_id: ctx.state.pancakeUser.city.id}})
        const response = { Success: true, Data: {ItemList: modelList, Begin: begin, End: end }}
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(response)
    } catch (e) {
        logger.error(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

newsRouter.get('newsItemAjax', /^\/m\/news\/([0-9a-zA-Z_\-]+)$/, async function (ctx, next) {
    try {
        const news = await getNews(ctx.params[0], ctx.state.pancakeUser.city.id)
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