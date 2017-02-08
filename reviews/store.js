'use strict';
const { models, ErrorCodes, ModelsError, scrollModel } = require('models')
const { Review } = models;
const ReviewActive = Review.scope('active')


async function getReview(id) {
    let attributes = ['id', 'name', 'date', 'rating', 'answer', 'review']

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

module.exports = {
    getReview: getReview,
    getReviewListScroll: getReviewListScroll,
}
