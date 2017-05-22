'use strict';
const { models, ErrorCodes, ModelsError, scrollModel, getLastId } = require('models')
const { Review } = models;
const ReviewActive = Review.scope('active')
const mongoClient = require('mongodb').MongoClient;
const logger = require('logger')(module)


async function shareReview(share) {
    try{
        let db = await mongoClient.connect('mongodb://localhost:27017/domovenok')
        let reviews = db.collection('reviews')
        let item = await reviews.findOne({where: {uuid: share}})
        if (item === null)
            throw new Error('Item is null')
        return item
    } catch (e){
        logger.error('ERROR share reviews')
        logger.error(e)
        return {}
    }
}

async function getReview(id) {
    let attributes = ['id', 'name', 'date', 'rating', 'answer', 'review', 'title_meta', 'description_meta', 'keywords_meta', 'block_link', 'city_id']

    if (typeof additionalAttr == 'list'){
        attributes = attributes.concat(additionalAttr)
    } if (typeof additionalAttr == 'string')
        attributes.push(additionalAttr)

    if (id !== undefined)
        return await ReviewActive.findOne({attributes: attributes, where: {id: id}})
    throw new Error()
}

async function getReviewListScroll(opts) {
    let options = opts || {}
    options.attributes = ['id', 'name', 'date', 'rating', 'answer', 'review']
    return await scrollModel(ReviewActive, options);
}

async function saveReview(name, mail, review, rating, city_id) {
     let lastId = await getLastId(Review)
     await Review.create({id: lastId+1, name: name, mail: mail, review: review, rating:rating, city_id: city_id})
}

module.exports = {
    getReview: getReview,
    getReviewListScroll: getReviewListScroll,
    saveReview,
    shareReview,
}
