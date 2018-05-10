'use strict';
const { models, scrollModel, getLastId } = require('models');
const { Review } = models;
const ReviewActive = Review.scope('active');
const mongoClient = require('mongodb').MongoClient;
const logger = require('/p/pancake/lib/logger.js');

const store = exports;

const hash_coefficient_for_sort = {
  0: 5,
  1: 5,
  2: 4,
  3: 3,
  4: 2,
  5: 1,
};

/**
 * get_coefficient_for_sort
 * Для отзывов с 1-й звездой при сортировке добавлять 6 месяцев, 2-мя звездами - 4 месяца, с 3-мя звездами - 2 месяца по давности.
 * То есть сверху страницы будут идти отзывы 4 и 5 звезд, а потом начинаться тройки, потом двойки, ну и потом единицы
 * @param  {[Number]} rating
 * @return {[Number || Error]}
 */
store.get_coefficient_for_sort = function(rating) {
  const coefficient_for_sort = hash_coefficient_for_sort[rating];
  if (!coefficient_for_sort && coefficient_for_sort !== 0) {
    return new Error(`saveReview => input rating ${rating}, coefficient_for_sort ${coefficient_for_sort} `);
  }
  return coefficient_for_sort;
};


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
  let coefficient_for_sort = store.get_coefficient_for_sort(rating);
  if (coefficient_for_sort instanceof Error) {
    logger.warn(coefficient_for_sort);
  }
  await Review.create({
    id: lastId + 1,
    name,
    mail,
    review,
    rating,
    city_id,
    coefficient_for_sort
  });
};
