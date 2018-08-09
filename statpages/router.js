'use strict';

const Router = require('koa-router');
const { getTemplate } = require('/p/pancake/utils/index.js');
const {URL} = require('url');
const { checkPromotionUrl } = require('/p/pancake/promotions/index.js');
const { CITIES } = require('/p/pancake/cities/index.js');
const { citiesTemplate } = require('./router_cities');
const { ABTestContainer, choiceTest, checkForOnlyFirstVisit, yaBotsRegExp } = require('./ab_tests');
const { addRobotsFileInRouting } = require('./robots');
const ab_test_api = require('/p/pancake/statpages/ab_test_api.js');

/* eslint-disable */
const re_slash = new RegExp('\/', 'g');
/* eslint-enable */
const sectionListRegExp = [
  new RegExp('^/articles'),
  new RegExp('^/faq'),
  new RegExp('^/otzivi'),
  new RegExp('^/news'),
  //new RegExp('^/skidki_akcii'),
  new RegExp('^/private'),
  new RegExp('^/gallery'),
];

const statpagesRouter = new Router();

function buildUrl(cityKW, url) {
  if (typeof cityKW == 'object') {
    cityKW = cityKW.keyword;
  }
  if (checkPromotionUrl(cityKW, url)){
    return CITIES.URL[cityKW] + url;
  }
  // TODO for PA
  if (url == '/private/auth'){
    return CITIES.URL['moscow'] + url;
  }
  if (checkExistUrl(CITIES.DICT[cityKW], url)){
    return CITIES.URL[cityKW] + url;
  } else {
    return CITIES.URL[cityKW];
  }
}

function checkExistUrl(city, path) {
  for (let reg of sectionListRegExp){
    if (reg.exec(path)){
      return true;
    }
  }
  let url;
  if (path !== '/'){
    url = path.slice(1);
  } else {
    url = 'main';
  }
  let url_without_slash = url.replace(re_slash, '__');
  if (citiesTemplate[city.keyword][url_without_slash]){
    return true;
  }
}

function getServiceName(city, referer) {
  try{
    let path = new URL(referer).pathname.slice(1);
    let path_without_slash = path.replace(re_slash, '__');
    return citiesTemplate[city.keyword][path_without_slash].ServiceName;
  } catch (e){
    return null;
  }
}

async function getPageWithABTest(ctx, page) {
  let city = ctx.state.pancakeUser.city.keyword;
  const user = ctx.state.pancakeUser;
  const is_a_b_test =
    ABTestContainer[city] &&
    ABTestContainer[city][page] &&
    !yaBotsRegExp.test(ctx.request.headers['user-agent']) &&
    await checkForOnlyFirstVisit(ctx, ABTestContainer[city][page]);
  if (is_a_b_test) {
    let ABTest = ABTestContainer[city][page];
    let testData = user.getABTest(ABTest);
    if (!testData) {
      const variations = ABTest.variations;
      // OLD CODE
      // let ABTestVariant = choiceTest(variations);
      let ABTestVariant = ab_test_api.choice(city, ABTest);
      testData = {page: ABTestVariant.page, name: ABTestVariant.name};
      const current_page =  ABTestVariant;
      user.setABTest(ABTest.key, testData, current_page, variations);
    }
    let {template, data} = await getPage(citiesTemplate[city], testData.page);
    if (template){
      if (data){
        data.ABTest = {key: ABTest.key, variant: testData.name};
      } else {
        data = {ABTest : {key: ABTest.key, variant: testData.name}};
      }
      return {template, data};
    }
  }
  if (citiesTemplate[city] && citiesTemplate[city][page] && !citiesTemplate[city][page].hide){
    return await getPage(citiesTemplate[city], page);
  }
  return { template: null};
}

async function getPage(templateDict, page) {
  if (templateDict[page] !== undefined){
    let template = getTemplate({name: `${templateDict.key+templateDict[page].name}`, path: `${templateDict.dir + templateDict[page].name}`});
    let data = JSON.parse(JSON.stringify(templateDict[page].data));
    return { template, data };
  } else {
    return { template: null};
  }
}

addRobotsFileInRouting(statpagesRouter);

statpagesRouter.get('/', async function (ctx) {
  const { template, data } = await getPageWithABTest(ctx, 'main');
  ctx.body = template(ctx.proc(data));
});

statpagesRouter.get('/:level1', async function (ctx, next) {
  const end_slash = (ctx.path.substr(ctx.path.length - 1) == '/') ? '__' : '';
  const { template, data } = await getPageWithABTest(ctx, ctx.params.level1+end_slash);
  if (template === null){
    await next();
  } else {
    ctx.body = template(ctx.proc(data));
  }
});

statpagesRouter.get('/:level1/:level2', async function (ctx, next) {
  const end_slash = (ctx.path.substr(ctx.path.length - 1) == '/') ? '__' : '';
  const { template, data } = await getPageWithABTest(ctx, ctx.params.level1+'__'+ctx.params.level2+end_slash, next);
  if (template === null){
    await next();
  } else {
    ctx.body = template(ctx.proc(data));
  }
});

module.exports = {
  statpagesRouter,
  getServiceName,
  buildUrl,
  checkExistUrl,
};