'use strict';

//const { models } = require('models');
const { Article, Picture, FAQ, Review, City, News } = require('models/models.js');

const uuidV4 = require('uuid/v4')

var Sequelize = require('sequelize')

var sequelize = new Sequelize('postgres://domovenok:domovenokPG@localhost:5432/pancake', {});

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'resu',
    database: 'domovenok_su'
});

connection.connect();


//sequelize.sync()




function migrateArticle() {
    connection.query('SELECT * FROM articles_article ORDER BY id', function (error, results, fields) {
        if (error) console.log(error);
        for (let i of results) {
            Article.create({
                title: i.title,
                pub_date: i.pub_date,
                picture_id: i.picture_id,
                preview_text: i.preview_text,
                full_text: i.full_text,
                active: i.active,
                url: i.code,
                title_meta: i.title_meta,
                description_meta: i.description_meta,
                keywords_meta: i.keywords_meta,
            })
        }
    });
}

function migrateFAQ() {
    connection.query('SELECT * FROM faq_question ORDER BY id', function (error, results, fields) {
        if (error) console.log(error);
        for (let i of results) {
            FAQ.create({
                id: i.id,
                name: i.name,
                pub_date: i.pub_date,
                question: i.question,
                answer: i.answer,
                active: i.active,
                mail: i.mail,
                send_on_save: i.send_on_save,
                title_meta: i.title_meta,
                description_meta: i.description_meta,
                keywords_meta: i.keywords_meta,
                h1_text: i.h1_text,
                note: i.note
            })
        }
    });
}


function migratePicture() {
    connection.query('SELECT * FROM pictures_picture ORDER BY id', function (error, results, fields) {
        if (error) console.log(error);
        for (let i of results) {
            Picture.create({id: i.id, title: i.title, pic: i.pic})
        }
    });
}


function migrateReviews() {
    connection.query('SELECT * FROM reviews_review ORDER BY id', function (error, results, fields) {
        if (error) console.log(error);
        for (let i of results) {
            Review.create(i)
        }
    });
}

function migrateCity() {
        connection.query('SELECT * FROM city_support', function (error, results, fields) {
        if (error) console.log(error);
        for (let i of results) {
            City.create(i)
        }
    });
}

function migrateNews() {
        connection.query('SELECT * FROM news_news ORDER BY id', function (error, results, fields) {
        if (error) console.log(error);
        for (let i of results) {
            i.url = i.code
            News.create(i)
        }
    });
}


function addCity() {
    City.create({id: 1, title: 'Москва', keyword: 'moscow', domain: 'www', active: true})
    City.create({id: 2, title: 'Санкт-Петербург', keyword: 'spb', domain: 'spb', active: true})
}


migrateNews()

connection.end();