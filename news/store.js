'use strict';
const { models, ErrorCodes, ModelsError, scrollModel } = require('models')
const { News, Picture } = models
const NewsActive = News.scope('active')


News.belongsTo(Picture, { foreignKey: 'picture_id' })

async function getNews(url, city_id, additionalAttr) {
    let attributes = ['title', 'pub_date', 'full_text', 'url', 'title_meta', 'description_meta', 'keywords_meta']
    if (typeof additionalAttr == 'object'){
        attributes = attributes.concat(additionalAttr)
    } if (typeof additionalAttr == 'string')
        attributes.push(additionalAttr)
    if (url !== undefined)
        return await NewsActive.findOne({attributes: attributes,where: {url: url, city_id: city_id}, include: [{model: Picture, attributes: ['pic']}]})
    throw new Error()
}

async function getNewsListScroll(opts) {
    let options = opts || {}
    options.attributes = ['title', 'pub_date', 'preview_text', 'url']
    const include = [{model: Picture, attributes: ['pic']}]
    return await scrollModel(NewsActive, options, include);
}

module.exports = {
    getNews: getNews,
    getNewsListScroll: getNewsListScroll,
}
