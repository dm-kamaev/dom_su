'use strict';
const { models, scrollModel, getLastId } = require('models');
const { Review } = models;
const ReviewActive = Review.scope('active');
const mongoClient = require('mongodb').MongoClient;
const logger = require('/p/pancake/lib/logger.js');
const time = require('/p/pancake/my/time.js');

const store = exports;


store.shareReview = async function (share) {
  try{
    let db = await mongoClient.connect('mongodb://localhost:27017/domovenok');
    let reviews = db.collection('reviews');
    let item = await reviews.findOne({where: {uuid: share}});
    if (item === null)
      throw new Error('Item is null');
    return item;
  } catch (e){
    logger.warn('ERROR share reviews');
    logger.warn(e);
    return {};
  }
};


store.getReview = async function (id) {
  let attributes = [ 'id', 'name', 'date', 'rating', 'answer', 'review', 'title_meta', 'description_meta', 'keywords_meta', 'block_link', 'city_id', 'note' ];

  if (typeof additionalAttr == 'list'){
    attributes = attributes.concat(additionalAttr);
  } if (typeof additionalAttr == 'string')
    attributes.push(additionalAttr);

  if (id !== undefined) {
    return await ReviewActive.findOne({attributes: attributes, where: {id: id}});
  }
  throw new Error();
}


store.getReviewListScroll = async function (opts) {
  let options = opts || {};
  options.attributes = ['id', 'name', 'date', 'rating', 'answer', 'review'];
  return await scrollModel(ReviewActive, options);
};


store.saveReview = async function (name, mail, review, rating, city_id) {
  let lastId = await getLastId(Review);
  await Review.create({
    id: lastId + 1,
    name,
    mail,
    review,
    rating,
    city_id,
    date_yyyymmdd: time.format('YYYYMMDD')
  });
};
