'use strict';

// MODULE FOR WORK WITH PAGINATION

// TODO(2018.04.26): !! This pagination is crazy!!!
// Currently frontend sends id: (/m/otzivi?direction=-1&key=2477) and we sort ids by rating, date and in cycle found id and make slice(i+1, i+21)
// Refactor: frontend sends step and number of page, example (page = 6, step = 20)

const { sequelize } = require('/p/pancake/models/models.js');

const sequelize_option = { type: sequelize.QueryTypes.SELECT };

async function scrollModel(model, opts, include) {
  let modelList;
  let begin = false;
  let end = false;
  const options = opts || {};
  const {limit=20, order='id', sort=-1, direction=-1, keyName='id', keyValue, keyItemInclude=false, attributes=undefined, where={} } = options;

  let getOrdering = function (sort){
    if (sort === 1) {
      return 'DESC';
    } if (sort === -1){
      return 'ASC';
    } else {
      throw new Error('argument sort error');
    }
  };

  function getOperator(keyItemInclude, sort, direction) {
    let operator;
    if (sort*direction === 1){
      operator = '$lt';
    }
    if (sort*direction === -1) {
      operator = '$gt';
    }

    if (keyItemInclude){
      operator += 'e';
    }
    return operator;
  }
  let WHERE = JSON.parse(JSON.stringify(where));
  let upWHERE = JSON.parse(JSON.stringify(where));
  let downWHERE = JSON.parse(JSON.stringify(where));



  if (keyValue){
    if (direction == 1){
      WHERE[keyName] = {};
      WHERE[keyName][getOperator(keyItemInclude, sort, direction)] = keyValue;
      modelList = await model.findAll({attributes: attributes, where: WHERE, limit: limit, order: [[order, getOrdering(sort)]], include: include});
      if (modelList.length < limit){
        begin = true;
      }
      modelList.reverse();
    }
    if (direction == -1){
      WHERE[keyName] = {};
      WHERE[keyName][getOperator(keyItemInclude, sort, direction)] = keyValue;
      if (model.name === 'reviews') {
        // search previous 20 reviews
        modelList = await search_prev_reviews(modelList, keyValue);

        // modelList = await model.findAll({
        //   attributes: attributes,
        //   where: WHERE,
        //   limit: limit,
        //   order: [ [ order, getOrdering(sort * direction)] ],
        //   include: include
        // });
      } else {
        modelList = await model.findAll({
          attributes: attributes,
          where: WHERE,
          limit: limit,
          order: [ [ order, getOrdering(sort * direction)] ],
          include: include
        });
      }
      if (modelList.length < limit){
        end = true;
      }}

    if (direction == 0){
      downWHERE[keyName] = {};
      downWHERE[keyName][getOperator(false, sort, -1)] = keyValue;
      upWHERE[keyName] = {};
      upWHERE[keyName][getOperator(true, sort, 1)] = keyValue;
      const [upModelList, downModelList] = await Promise.all([
        model.findAll({attributes: attributes, where: upWHERE, limit: limit, order: [[order, getOrdering(sort)]], include: include}),
        model.findAll({attributes: attributes, where: downWHERE, limit: limit, order: [[order, getOrdering(sort*-1)]], include: include}),
      ]);
      let halfLong = (limit % 2 == 1) ? (limit+1)/2 : limit/2;
      if (upModelList.length <= halfLong){
        begin = true;
      }
      if (downModelList.length < halfLong){
        end = true;
      }
      let tempModelList = upModelList.reverse().concat(downModelList);
      if (tempModelList.length < limit){
        modelList = tempModelList;
      } else {
        let spliceIndex;
        if (begin){
          spliceIndex = 0;
        } else {
          if (end){
            spliceIndex = -limit;
          } else {
            spliceIndex = upModelList.length - halfLong;
          }
        }
        modelList = tempModelList.splice(spliceIndex, limit);
      }
    }

  } else {
    modelList = await model.findAll({
      attributes,
      where: WHERE,
      limit,
      order: [
        [ order, getOrdering(sort * -1) ]
      ],
      include: include
    });

    if (model.name === 'reviews') {
      modelList = await sequelize.query(`
          SELECT
            id,
            name,
            date,
            rating,
            answer,
            review
          FROM
            reviews
          ORDER BY
            date_yyyymmdd DESC,
            rating DESC
          LIMIT 20
        `, sequelize_option);
    }

    begin = true;
    if (modelList.length < limit){
      end = true;
    }
  }
  return {modelList: modelList, begin: begin, end: end};
}

async function getLastId(model, key){
  key = key || 'id';
  let item = await model.findOne({order: [[key, 'DESC']]});
  return item.id;
}

// Currently frontend sends id: (/m/otzivi?direction=-1&key=2477) and we sort ids by rating, date and in cycle found id and make slice(i+1, i+21)
async function search_prev_reviews(reviews, review_id) {
  const reviews_only_id = await sequelize.query(`
    SELECT
      id
    FROM
      reviews
    ORDER BY
      date_yyyymmdd DESC,
      rating DESC
  `, sequelize_option);

  const review_ids = search_next_reviews_id(reviews_only_id, review_id);
  if (!review_ids) {
    return [];
  }
  const str_reviews_id = review_ids.join('\', \'');
  reviews = await sequelize.query(`
    SELECT
      id,
      name,
      date,
      rating,
      answer,
      review
    FROM
      reviews
    WHERE
      id IN('${str_reviews_id}')
    ORDER BY
      date_yyyymmdd DESC,
      rating DESC
  `, sequelize_option);
  return reviews;
}

// search current review.id (from frnotend) and search previous 20 reviews
function search_next_reviews_id(reviews_only_id, review_id) {
  review_id = parseInt(review_id, 10);
  for (var i = 0, l = reviews_only_id.length; i < l; i++) {
    if (reviews_only_id[i].id === review_id) {
      return reviews_only_id.slice(i + 1, i + 21).map(({ id }) => id);
    }
  }
}

module.exports = {scrollModel: scrollModel, getLastId: getLastId};