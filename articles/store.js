'use strict';
const connector  = require('database');

function getArticleList() {
    return new Promise((reslove, reject)=> {

        connector.query(
            'SELECT AA.title, AA.preview_text, AA.id, PP.pic ' +
            'FROM articles_article as AA ' +
            'LEFT OUTER JOIN pictures_picture as PP ON AA.picture_id = PP.id ' +
            'ORDER BY AA.id DESC ' +
            'LIMIT 30',
            function (err, rows, fields) {
                if (err) throw err;
                reslove(rows)
            });
    })
        .catch((error)=> {
            console.log(error)
        })
}

function getArticle(id) {
    return new Promise((reslove, reject) => {
        if (id != undefined){
        connector.query(
            'SELECT AA.title, AA.full_text, AA.pub_date, PP.pic ' +
            'FROM articles_article as AA ' +
            'LEFT OUTER JOIN pictures_picture as PP ON AA.picture_id = PP.id ' +
            'WHERE AA.id = ?',
            [id],
            function (err, rows, fields) {
                if (err) throw err;
                reslove(rows[0])
        })
        } else {
            connector.query(
            'SELECT AA.title, AA.full_text, AA.pub_date, PP.pic ' +
            'FROM articles_article as AA ' +
            'LEFT OUTER JOIN pictures_picture as PP ON AA.picture_id = PP.id ' +
            'ORDER BY AA.id DESC ' +
            'LIMIT 1',
            function (err, rows, fields) {
                if (err) throw err;
                reslove(rows[0])
        })
        }
    })

    .catch((error)=> {
        console.log(error)
    })
}

module.exports = {
    getArticle: getArticle,
    getArticleList: getArticleList
}
