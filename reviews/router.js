'use strict';

const Router = require('koa-router');
const { getReview, getReviewListScroll, saveReview, shareReview } = require('./store');
const logger = require('logger')(module);
const { getTemplate, loadTemplate } = require('utils');

const reviewsTemplateOpts = {
  path: 'templates/reviews/reviews.html',
  name: 'reviews'
};

const menu = {
  reviews: true, main: true
};

loadTemplate(reviewsTemplateOpts);


const reviewsRouter = new Router();

reviewsRouter.post('reviewsFormHandler', /^\/otzivi\/form\/$/, async function (ctx) {
  ctx.type = 'application/json';
  let response = { Success: false };
  // Validation
  if (ctx.request.body){
    if (typeof ctx.request.body.name == 'string' && ctx.request.body.name.length > 0)
      if (typeof ctx.request.body.mail == 'string' && ctx.request.body.mail.length > 0)
        if (typeof ctx.request.body.review == 'string' && ctx.request.body.review.length > 0)
          if (isNaN(ctx.request.body.rating) == false && Number(ctx.request.body.rating) > 0 && Number(ctx.request.body.rating) <= 5){
            await saveReview(ctx.request.body.name, ctx.request.body.mail, ctx.request.body.review, Number(ctx.request.body.rating), ctx.state.pancakeUser.city.id);
            response.Success = true;
            ctx.state.pancakeUser.sendTicket('Review', {
              rating: ctx.request.body.rating,
              name: ctx.request.body.name,
              mail: ctx.request.body.mail,
              review: ctx.request.body.review
            });
          }
  }
  ctx.body = JSON.stringify(response);
});

reviewsRouter.get('reviewsList', /^\/otzivi\/$/, async function (ctx) {
  // console.log('=== HERE ===');
  const {modelList, begin, end} = await getReviewListScroll({
    where: {
      $or: [{
        city_id: ctx.state.pancakeUser.city.id
      }, {
        isOld: true
      }]
    },
    raw: true,
  });
  // console.dir(modelList);
  const template = getTemplate(reviewsTemplateOpts);
  ctx.body = template(ctx.proc({
    ItemList: modelList,
    Begin: begin,
    End: end,
    RightForm: false,
    HasRightSide: false,
    menu: menu
  }));
});


// /otzivi/2641/
reviewsRouter.get('reviewItem', /^\/otzivi\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
  let review, RightForm;
  let share = { name: '', content: ''};
  if (ctx.params[0] === 'form'){
    review = { id: null };
    RightForm = true;
    if (ctx.query.share){
      let shareItem = await shareReview(ctx.query.share);
      if (shareItem !== null){
        share = shareItem;
      }
    }
  } else {
    if (isNaN(ctx.params[0])){
      await next();
      return;
    }
    review = await getReview(ctx.params[0]);
    RightForm = false;
    if (review === null){
      await next();
      return;
    }
  }
  let noindex = false;
  if (review.city_id != ctx.state.pancakeUser.city.id){
    noindex = true;
  }
  const { modelList, begin, end }= await getReviewListScroll({direction: 0, keyValue: review.id});
  const template = getTemplate(reviewsTemplateOpts);
  review.note = review.note || '';
  const noteForTitle = review.note.replace(/выполнено/, '');
  ctx.body = template(ctx.proc({
    ItemList: modelList,
    Item: review,
    Begin: begin,
    End: end,
    RightForm: RightForm,
    HasRightSide: true,
    menu: menu,
    formName: share.name,
    formRating: share.score,
    formReview: share.content,
    noteForTitle,
    noindex: noindex,
  }));
});

reviewsRouter.get('reviewListAjax', /^\/m\/otzivi$/, async function (ctx) {
  try {
    const direction = ctx.query.direction;
    const {modelList, begin, end} = await getReviewListScroll({keyValue: ctx.query.key, direction: direction});
    const response = { Success: true, Data: {ItemList: modelList, Begin: begin, End: end }};
    ctx.type = 'application/json';
    ctx.body = JSON.stringify(response);
  } catch (e) {
    logger.info(e);
    ctx.type = 'application/json';
    ctx.body = JSON.stringify({ Success: false });
  }
});

reviewsRouter.get('reviewItemAjax', /^\/m\/otzivi\/([0-9a-zA-Z_\-]+)$/, async function (ctx) {
  try {
    const review = await getReview(ctx.params[0]);
    let response = { Success: true, Data: { Item: review} };
    ctx.type = 'application/json';
    ctx.body = response;
  } catch (e){
    logger.info(e);
    ctx.type = 'application/json';
    ctx.body = JSON.stringify({ Success: false });
  }
});

module.exports = { reviewsRouter: reviewsRouter};