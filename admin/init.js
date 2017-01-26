'use strict';

var Sequelize = require('sequelize')

var { Article, Picture } = require('../createSchema');

const { AdminPanel } = require('./adminPanel')

const { AdminModel } = require('./models')



const adminPanel = new AdminPanel()

const AArticle = new AdminModel(Article, {preview:['id', 'title']})
const APictures = new AdminModel(Picture)

AArticle.setPreviewField(['id','title'])

adminPanel.addModel(AArticle)
adminPanel.addModel(APictures)
adminPanel.buildReferences()


module.exports = {
    adminPanel: adminPanel
}