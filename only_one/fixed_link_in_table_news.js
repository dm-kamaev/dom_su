'use strict';

const config = require('config');
const Sequelize = require('sequelize');
const promise_api = require('/p/pancake/my/promise_api.js');
const sequelize = new Sequelize(`postgres://${config.db.user}:${config.db.password}@${config.db.host}:5432/${config.db.database}`, {
  logging: false
});
const sequelize_option = { type: sequelize.QueryTypes.SELECT };

module.exports = async function () {
  try {
    const news_db = await sequelize.query("SELECT id, preview_text, full_text, url FROM news", sequelize_option);

    let news_after_clean;

    news_after_clean = clean_first_template(news_db);
    await update_news(news_after_clean);

    news_after_clean = clean_second_template(news_db);
    await update_news(news_after_clean);

    news_after_clean = clean_four_template(clean_third_template(news_db));
    await update_news(news_after_clean);
    search_django_template(news_db);

    news_after_clean = replace_form(news_db);
    await update_news(news_after_clean);

    news_after_clean = replace_http_to_https(news_db);
    await update_news(news_after_clean);

    console.log('SUCCESS');
    global.process.exit(0);
  } catch (err) {
    console.log(err);
  }
}

// dajngo template {% thumbnail 'pic/9_maya.jpg' 550x1000 quality=100 %}
// replace to url: https://www.domovenok.su/media/pic/9_maya.jpg
function clean_first_template(news_db) {
  let newsWithDjango = news_db.filter(({ preview_text, full_text }) => {
    if (/\{% thumbnail.+%\}/.test(preview_text) || /\{% thumbnail.+%\}/.test(full_text)) {
      return true;
    }
  });

  newsWithDjango = newsWithDjango.map(current_new => {
    current_new.preview_text = current_new.preview_text.replace(/\{% thumbnail.+\'(pic\/.+)\'.+%\}/g, 'https://www.domovenok.su/media/$1');
    current_new.full_text = current_new.full_text.replace(/\{% thumbnail.+\'(pic\/.+)\'.+%\}/g, 'https://www.domovenok.su/media/$1');
    return current_new;
  });

  // console.log(newsWithDjango);
  // console.log(newsWithDjango.length);
  return newsWithDjango;
}


// dajngo template {% load thumbnail %}
// replace to ''
function clean_second_template(news_db) {
  let newsWithDjango = news_db.filter(({ preview_text, full_text }) => {
    if (/\{%\s+load thumbnail\s+%\}/.test(preview_text) || /\{%\s+load thumbnail\s+%\}/.test(full_text)) {
      return true;
    }
  });

  newsWithDjango = newsWithDjango.map(current_new => {
    current_new.preview_text = current_new.preview_text.replace(/\{%\s+load thumbnail\s+%\}/g, '');
    current_new.full_text = current_new.full_text.replace(/\{%\s+load thumbnail\s+%\}/g, '');
    return current_new;
  });

  // console.log(newsWithDjango);
  // console.log(newsWithDjango.length);
  return newsWithDjango;
}


// dajngo template {% load thumbnail %}
// replace to ''
function clean_third_template(news_db) {
  let newsWithDjango = news_db.filter(({ preview_text, full_text }) => {
    if (/\{%\s+load urlmigrations\s+%\}/.test(preview_text) || /\{%\s+load urlmigrations\s+%\}/.test(full_text)) {
      return true;
    }
  });

  newsWithDjango = newsWithDjango.map(current_new => {
    current_new.preview_text = current_new.preview_text.replace(/\{%\s+load urlmigrations\s+%\}/g, '');
    current_new.full_text = current_new.full_text.replace(/\{%\s+load urlmigrations\s+%\}/g, '');
    return current_new;
  });

  // console.log(newsWithDjango);
  // console.log(newsWithDjango.length);
  return newsWithDjango;
}

// {% true_url '/mite_okon' %}
function clean_four_template(news_db) {
  let newsWithDjango = news_db.filter(({ preview_text, full_text }) => {
    if (/\{%\s+true_url\s+\'.+\'\s+%\}/.test(preview_text) || /\{%\s+true_url\s+\'.+\'\s+%\}/.test(full_text)) {
      return true;
    }
  });

  newsWithDjango = newsWithDjango.map(current_new => {
    const reg = /\{%\s+true_url\s+\'(\/.+?)\'\s+%\}/g;
    current_new.full_text = current_new.full_text.replace(/http:\/\/www\.himchistka\.domovenok\.su/g, '/himchistka' );

    current_new.preview_text = current_new.preview_text.replace(reg, '$1');
    current_new.full_text = current_new.full_text.replace(reg, '$1');
    return current_new;
  });

  // console.log(newsWithDjango);
  // console.log(newsWithDjango.length);
  return newsWithDjango;
}

function search_django_template(news_db) {
  let newsWithDjango = news_db.filter(({ preview_text, full_text }) => {
    if (/\{%\s+.+\s+%\}/.test(preview_text) || /\{%\s+.+\s+%\}/.test(full_text)) {
      return true;
    }
  });

  console.log(newsWithDjango);
  console.log(newsWithDjango.length);
  return newsWithDjango;
}


function replace_form(news_db) {
  const one_new = news_db.find(({ url }) => {
    return url === '132';
  });
  one_new.full_text = one_new.full_text.replace(/\s+/g, ' ').replace(/\{\% csrf_token \%\}?/, '');
  one_new.full_text = one_new.full_text.replace(
    /<form.+>.+form>/,
    `<form class="ticket" id="ticket-form" action="/ticket-handler" method="GET" enctype="multipart/form-data">
      <input style=display:none name=type value=mail_delivery>
      <input placeholder="Ваш Email" name=mail class="ticket" type="email">
      <input type="submit" value="Подписаться" class="ticket" style="margin-left: 10px">
      <br/><br/><br/>
      </form>
    `
  );
  return [ one_new ];
}


function replace_http_to_https(news_db) {
  const reg = /http:\/\/.*domovenok\.su/;
  let news_with_url = news_db.filter(({ preview_text, full_text }) => {
    if (reg.test(preview_text) || reg.test(full_text)) {
      return true;
    }
  });

  news_with_url = news_with_url.map(current_new => {
    const reg = /http:\/\/(.*)domovenok\.su/g;
    const rep = 'https://$1domovenok.su';
    current_new.preview_text = current_new.preview_text.replace(reg, rep);
    current_new.full_text = current_new.full_text.replace(reg, rep);

    current_new.preview_text = current_new.preview_text.replace(/https:\/\/domovenok\.su/g, '');
    current_new.full_text = current_new.full_text.replace(/https:\/\/domovenok\.su/g, '');
    current_new.preview_text = current_new.preview_text.replace(/https:\/\/www\.domovenok\.su/g, '');
    current_new.full_text = current_new.full_text.replace(/https:\/\/www\.domovenok\.su/g, '');
    return current_new;
  });
  // console.log(news_with_url);
  // console.log(news_with_url.length);
  return news_with_url;
}


async function update_news(news_after_cleam) {
  return await promise_api.queue(news_after_cleam, async function ({ id, preview_text, full_text }) {
    const query = `
      UPDATE
        news
      SET
        preview_text = :preview_text,
        full_text = :full_text
      WHERE
        id = :id`;
    return await sequelize.query(query, {
      replacements: { id, preview_text, full_text, },
      type: sequelize.QueryTypes.SELECT
    }).catch(err => console.log('Error=', err, '\n QUERY=', query));
  });
}

if (!module.parent) {
  module.exports();
}