'use strict';

//const { models } = require('models');
const { Article, Picture, FAQ, Review, City, News, Phone } = require('./models/models.js');

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

async function PhoneForTest() {
    const msc = await City.find({where:{keyword: 'moscow'}})
    const spb = await City.find({where:{keyword: 'spb'}})
    const moscow = [74957880921,74957880923,74957880925,74957880928,74957887652,74957893224,74957893308,74957893310,74957893363,74957894810,74957896228,74957896230,74957896233,74957896251,74957896255,74957896257,74957896258,74957899010,74957899018,74957899039,74957899040,74957899042,74957899043,74957899046,74957899047,74957899048,74957899049,74957899051,74957899052,74957899080,74953089731,74953089732,74953089734,74953089736,74953089739,74953089741,74953089742,74953089743,74953089745,74953089746,74953089749,74953089751,74953089752,74953089753,74953089756,74953089759,74953089761,74953089762,74953089763,74953089764]
    const piter = [78124158943,78124158944,78124158945,78124158946,78124158947,78124158948,78124158949,78124158950,78124158951,78124158952,78124158953,78124158954,78124158955,78124158956,78124158957,78124158958,78124158959,78124158960,78124158961,78124158962,78124158963,78124158964,78124158965,78124158966,78124158967,78124158968,78124158969,78124158970,78124158971,78124158972,78124158973,78124158974,78124158975,78124158976,78124158977,78124158978,78124158979,78124158980,78124158981,78124158982,78124158983,78124158984,78124158985,78124158986,78124158987,78124158988]
    for (let i of moscow){
        await Phone.create({city_id: msc.id, number: i.toString(), active: true})
    }
    for (let i of piter){
        await Phone.create({city_id: spb.id, number: i.toString(), active: true})
    }
}


connection.end();