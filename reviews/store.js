'use strict';
const { models, scrollModel, getLastId } = require('models');
const { Review } = models;
const ReviewActive = Review.scope('active');
const mongoClient = require('mongodb').MongoClient;
const logger = require('/p/pancake/lib/logger.js');
const db = require('/p/pancake/my/db2.js');
const AuthApi = require('/p/pancake/auth/authApi.js');
const Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');
const coefficient_for_sort = require('/p/pancake/reviews/coefficient_for_sort.js');

const store = exports;


store.shareReview = async function (share) {
  try{
    let db = await mongoClient.connect('mongodb://localhost:27017/domovenok');
    let reviews = db.collection('reviews');
    let item = await reviews.findOne({where: {uuid: share}});
    if (item === null)
      throw new Error('Item is null');
    return item;
  } catch (err){
    logger.warn('ERROR share reviews'+err);
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
};


store.getReviewListScroll = async function (opts) {
  let options = opts || {};
  options.attributes = ['id', 'name', 'date', 'rating', 'answer', 'review'];
  return await scrollModel(ReviewActive, options);
};


// TODO(2018.07.10): OLD CODE
store.saveReview = async function (name, mail, review, rating, city_id, active) {
  let lastId = await getLastId(Review);
  const date = new Date();
  if (!mail) {
    throw new Error('Not found mail');
  }
  try {
    await Review.create({
      id: lastId + 1,
      name,
      mail,
      review,
      rating,
      city_id,
      date,
      coefficient_for_sort: parseInt(coefficient_for_sort.get(date, rating).format('YYYYMMDD'), 10),
      active: active || false
    });
  } catch (err) {
    logger.warn(err);
  }
};


store.saveReview_via_1c = async function (body) {
  body.date = new Date();
  body.coefficient_for_sort = coefficient_for_sort.get(body.date, body.rating);
  await Review.create(body);
};

/**
 * create review via client_pa
 * @param  {Object} ctx  [description]
 * @param  {Object} body:
   {
     ClientID: '86bab174-1ea7-11e7-80e4-00155d594900',
     DepartureID: '3dab0b03-835d-11e8-8314-40167eadd993',
     Note: 'Все хорошо',
     Scores: [{
       Param: 'quality',
       Value: 3
     }],
     SubmitObject: 'form',
     Publish: true
   }
 */
store.create_review = async function (ctx, body) {
  try {
    const departure_id = body.DepartureID;
    const review = body.Note;
    const active = body.Publish;
    const rating = body.Scores[0].Value;

    const authApi = new AuthApi(ctx);
    const { token, uuid, client_id } = authApi.get_auth_data();

    let req_for_1c = new Request1Cv3(token, uuid, null, ctx);

    const data = { ClientID: client_id };
    req_for_1c.add(
      'Client.GetCommon', data
    ).add(
      'Client.GetContactInfo', data
    ).add(
      'Client.GetDeparture', { DepartureID: departure_id }
    );
    await req_for_1c.do();
    /**
      common: {
        ok: true,
        data: {
          ...
          FullTitle: 'Никита Тест',
          "ObjectsList": [
            {
             "ObjectID": "87ef26f6-0429-11e5-9454-002590306b4f",
              ...
             "City": "moscow",
             ...
            }
          ]
          ...
        }
      }
      contact_info: {
        ok: true,
        data: [{
          Type: 'phone',
          Title: '+7 (111) 111-11-11',
          ContactID: 'ae3e85b0-889d-11e6-80e2-00155d594900'
        }]
      }
      departure: {
          "ObjectID": "93e2d628-16a5-11e6-80e2-00155d594900",
          .....
      }
     */
    const { 'Client.GetCommon': common, 'Client.GetContactInfo': contact_info, 'Client.GetDeparture': departure  } = req_for_1c.get_all();

    if (!common.ok) {
      throw new Error(JSON.stringify(common));
    } else if (!contact_info.ok) {
      throw new Error(JSON.stringify(contact_info));
    } else if (!departure.ok) {
      throw new Error(JSON.stringify(departure));
    }
    const object_id = departure.data.ObjectID;
    const object = common.data.ObjectsList.find(el => el.ObjectID === object_id);
    const keyword = object.City; // moscow || nn || spb
    const city = await db.read_one(`SELECT id FROM cities WHERE keyword = '${keyword}'`);
    if (!city) {
      throw new Error('Not found city');
    }

    const city_id = city.id;
    const name = common.data.FullTitle;
    // console.log('name=', name, 'review=', review, 'rating=', rating, 'city_id=', city_id, 'active=', active);

    let lastId = await getLastId(Review);
    const date = new Date();
    await Review.create({
      id: lastId + 1,
      departure_id,
      name,
      review,
      rating,
      city_id,
      date,
      coefficient_for_sort: parseInt(coefficient_for_sort.get(date, rating).format('YYYYMMDD'), 10),
      active
    });
  } catch (err) {
    logger.warn(err);
  }
};