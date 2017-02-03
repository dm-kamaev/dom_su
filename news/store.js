'use strict';
const { models, ErrorCodes, ModelsError, scrollModel } = require('models')
const { News, Picture } = models
const NewsActive = News.scope('active')

//throw new ModelsError(ErrorCodes.QueryParamError, `Get article with id - ${id} | type - ${typeof id}`)

News.belongsTo(Picture, { foreignKey: 'picture_id' })

async function getNews(url, additionalAttr) {
    let attributes = ['title', 'pub_date', 'full_text', 'url']
    if (typeof additionalAttr == 'list'){
        attributes = attributes.concat(additionalAttr)
    } if (typeof additionalAttr == 'string')
        attributes.push(additionalAttr)
    if (url !== undefined)
        return await NewsActive.findOne({attributes: attributes,where: {url: url}, include: [{model: Picture, attributes: ['pic']}]})
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
