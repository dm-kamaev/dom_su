'use strict';
const { models, ErrorCodes, ModelsError, scrollModel } = require('models')
const { Article, Picture } = models
const ArticleActive = Article.scope('active')

//throw new ModelsError(ErrorCodes.QueryParamError, `Get article with id - ${id} | type - ${typeof id}`)

Article.belongsTo(Picture, { foreignKey: 'picture_id' })

async function getArticle(url, additionalAttr) {
    let attributes = ['title', 'pub_date', 'full_text', 'url', 'title_meta', 'description_meta', 'keywords_meta']
    if (typeof additionalAttr == 'list'){
        attributes = attributes.concat(additionalAttr)
    } if (typeof additionalAttr == 'string')
        attributes.push(additionalAttr)
    if (url !== undefined)
        return await ArticleActive.findOne({attributes: attributes,where: {url: url}, include: [{model: Picture, attributes: ['pic']}]})
    throw new Error()
}

async function getArticleListScroll(opts) {
    let options = opts || {}
    options.attributes = ['title', 'pub_date', 'preview_text', 'url']
    const include = [{model: Picture, attributes: ['pic']}]
    return await scrollModel(ArticleActive, options, include);
}

module.exports = {
    getArticle: getArticle,
    getArticleListScroll: getArticleListScroll,
}
