'use strict';
const { models, ErrorCodes, ModelsError, scrollModel } = require('models')
const { Article } = models
const ActiveArticle = Article.scope('active')

//throw new ModelsError(ErrorCodes.QueryParamError, `Get article with id - ${id} | type - ${typeof id}`)

async function getArticle(url) {
    if (url !== undefined)
        return await ActiveArticle.findOne({where: {url: url}})
    return await ActiveArticle.findOne({order: [ [ 'id', 'DESC' ]]})
}

async function getArticleListScroll(opts) {
    return await scrollModel(ActiveArticle, opts);
}

async function getArticleList(opts) {

    let articleList;
    let start = false;
    let end = false;
    const options = opts || {};
    const {offset=0, limit=20, order='id', direct=-1, key } = options;

    if (key){
        if (direct == 1){
            articleList = await ActiveArticle.findAll({ where: {id: {$lte: key }}, limit: limit, order: [[order, 'DESC']]});
            if (articleList.length < limit){
                start = true;
            }}
        if (direct == -1){
            articleList = await ActiveArticle.findAll({ where: {id: {$gte: key }}, limit: limit, order: [[order, 'ASC']]})
            if (articleList.length < limit){
                end = true;
            }}

        if (direct == 0){
            const [downArticleList, upArticleList] = await Promise.all([
                ActiveArticle.findAll({where: {id: {$lt: key }}, limit: limit, order: [[order, 'DESC']]}),
                ActiveArticle.findAll({where: {id: {$gte: key }}, limit: limit, order: [[order, 'ASC']]})
            ])
            if (downArticleList.length < limit/2){
                start = true;
            }
            if (upArticleList.length < limit+2/2){
                end = true;
            }
            articleList = downArticleList.concat(upArticleList.reverse())
        }
    } else {
        articleList = await ActiveArticle.findAll({ limit: limit, order: [[order, 'DESC']]})
        end = true;
        if (articleList.length < limit){
            start = true;
        }
    }
    return {articleList: articleList, start: start, end: end}
}

module.exports = {
    getArticle: getArticle,
    getArticleList: getArticleList,
    getArticleListScroll: getArticleListScroll,
}
