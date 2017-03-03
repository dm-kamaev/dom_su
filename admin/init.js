'use strict';

var Sequelize = require('sequelize')

var { Article, Picture } = require('../createSchema');

const { AdminPanel } = require('./adminPanel')

const { AdminModel } = require('./models')


const adminPanel = new AdminPanel()

const AArticle = new AdminModel(Article, {preview:['id', 'title'], title: 'Статьи'})
const APictures = new AdminModel(Picture, {title: 'Картинки'})

AArticle.setPreviewField(['id','title', 'url'])
APictures.setRefPreviewField(['title'])



adminPanel.addModel(AArticle)
adminPanel.addModel(APictures)


adminPanel.buildReferences()

module.exports = {
    adminPanel: adminPanel
}