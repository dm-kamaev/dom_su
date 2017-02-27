'use strict';
const { models, ErrorCodes, ModelsError, scrollModel, getLastId } = require('models')
const { Review } = models;
const ReviewActive = Review.scope('active')


async function getReview(id) {
    let attributes = ['id', 'name', 'date', 'rating', 'answer', 'review', 'title_meta', 'description_meta', 'keywords_meta', 'block_link']

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
}
