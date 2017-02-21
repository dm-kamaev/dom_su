'use strict';
const { models, ErrorCodes, ModelsError, scrollModel, getLastId } = require('models')
const { FAQ } = models
const FAQActive = FAQ.scope('active')

//throw new ModelsError(ErrorCodes.QueryParamError, `Get article with id - ${id} | type - ${typeof id}`)


async function getFAQ(id) {
    let attributes = ['id', 'name', 'pub_date', 'question', 'answer', 'title_meta', 'description_meta', 'keywords_meta', 'block_link']
    if (typeof additionalAttr == 'list'){
        attributes = attributes.concat(additionalAttr)
    } if (typeof additionalAttr == 'string')
        attributes.push(additionalAttr)
    if (id !== undefined)
        return await FAQActive.findOne({attributes: attributes, where: {id: id}})
    throw new Error()
}

async function saveFAQ(name, mail, question) {
     let lastId = await getLastId(FAQ)
     await FAQ.create({id: lastId+1, name: name, mail: mail, question: question})
}

async function getFAQListScroll(opts) {
    let options = opts || {}
    options.attributes = ['id', 'name', 'pub_date', 'question', 'answer']
    return await scrollModel(FAQActive, options);
}

module.exports = {
    getFAQ: getFAQ,
    getFAQListScroll: getFAQListScroll,
    saveFAQ,
}
