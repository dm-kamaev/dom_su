'use strict';
const { models, ErrorCodes, ModelsError, scrollModel } = require('models')
const { FAQ } = models
const FAQActive = FAQ.scope('active')

//throw new ModelsError(ErrorCodes.QueryParamError, `Get article with id - ${id} | type - ${typeof id}`)


async function getFAQ(id) {
    let attributes = ['id', 'name', 'pub_date', 'question', 'answer']
    if (typeof additionalAttr == 'list'){
        attributes = attributes.concat(additionalAttr)
    } if (typeof additionalAttr == 'string')
        attributes.push(additionalAttr)
    if (id !== undefined)
        return await FAQActive.findOne({attributes: attributes, where: {id: id}})
    throw new Error()
}

async function getFAQListScroll(opts) {
    let options = opts || {}
    options.attributes = ['id', 'name', 'pub_date', 'question', 'answer']
    return await scrollModel(FAQActive, options);
}

module.exports = {
    getFAQ: getFAQ,
    getFAQListScroll: getFAQListScroll,
}
