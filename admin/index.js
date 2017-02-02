'use strict';

const {adminRouter} = require('./router')


//adminPanel.getAllModel()
//adminPanel.getModelListItem('articles', {limit: 2, direct: 'DESC', offset: 20})

//adminPanel.getModelItem('articles', {attr: 'id', value: 3})


// console.log(AdminArticle.name)
// console.log(AdminArticle.getAttr())
//
// console.log(AdminArticle.ref)

module.exports = {adminRouter: adminRouter}
