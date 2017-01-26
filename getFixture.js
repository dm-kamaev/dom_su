'use sctict';
const { Article, Picture } = require('createSchema')

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


function migratePicture() {
    connection.query('SELECT * FROM pictures_picture ORDER BY id', function (error, results, fields) {
        if (error) console.log(error);
        for (let i of results) {
            Picture.create({id: i.id, title: i.title, pic: i.pic})
        }
    });
}




connection.end();