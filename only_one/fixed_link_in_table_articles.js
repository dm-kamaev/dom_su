'use strict';

const config = require('config');
const Sequelize = require('sequelize');
const promise_api = require('/p/pancake/my/promise_api.js');
const sequelize = new Sequelize(`postgres://${config.db.user}:${config.db.password}@${config.db.host}:5432/${config.db.database}`, {
  logging: false
});
const sequelize_option = { type: sequelize.QueryTypes.SELECT };

module.exports = async function () {
  console.log('====== START =====');
  try {
    const artciles = await sequelize.query("SELECT id, preview_text, full_text, url FROM articles", sequelize_option);
    // console.log(artciles);
    let articles_after_clean;

    // news_after_clean = clean_first_template(news_db);
    // await update_news(news_after_clean);

    // news_after_clean = clean_second_template(news_db);
    // await update_news(news_after_clean);

    // news_after_clean = clean_four_template(clean_third_template(news_db));
    // await update_news(news_after_clean);
    // search_django_template(news_db);

    // news_after_clean = replace_form(news_db);
    // await update_news(news_after_clean);

    articles_after_clean = replace_http_to_https(artciles);
    await update_article(articles_after_clean);

    console.log('SUCCESS');
    global.process.exit(0);
  } catch (err) {
    console.log(err);
  }
}


function replace_http_to_https(articles) {
  const reg = /http:\/\/.*domovenok\.su/;
  let artciles_wrong_links = articles.filter(({ preview_text, full_text }) => {
    if (reg.test(preview_text) || reg.test(full_text)) {
      return true;
    }
  });
  // console.log(artciles_wrong_links);

  artciles_wrong_links = artciles_wrong_links.map(artcile => {
    // const reg = /http:\/\/(.*)domovenok\.su/g;
    // const rep = 'https://$1domovenok.su';

    const reg = /http:\/\/domovenok\.su/g;
    const rep = '';
    artcile.preview_text = artcile.preview_text.replace(reg, rep);
    artcile.full_text = artcile.full_text.replace(reg, rep);

    const reg1 = /http:\/\/www\.domovenok\.su/g;
    const rep1 = '';

    artcile.preview_text = artcile.preview_text.replace(reg1, rep1);
    artcile.full_text = artcile.full_text.replace(reg1, rep1);

    const reg2 = /https:\/\/www\.domovenok\.su/g;
    const rep2 = '';

    artcile.preview_text = artcile.preview_text.replace(reg2, rep2);
    artcile.full_text = artcile.full_text.replace(reg2, rep2);

    const reg3 = /https:\/\/domovenok\.su/g;
    const rep3 = '';

    artcile.preview_text = artcile.preview_text.replace(reg3, rep3);
    artcile.full_text = artcile.full_text.replace(reg3, rep3);

    artcile.full_text = artcile.full_text.replace(/http:\/\/www\.himchistka\.domovenok\.su/g, '/himchistka' );
    artcile.preview_text = artcile.preview_text.replace(/http:\/\/www\.himchistka\.domovenok\.su/g, '/himchistka' );

    // const reg4 = /http:\/\/(.*)domovenok\.su/g;
    // const rep4 = 'https://$1domovenok.su';

    // artcile.preview_text = artcile.preview_text.replace(reg4, rep4);
    // artcile.full_text = artcile.full_text.replace(reg4, rep4);


    return artcile;
  });

  // console.log(artciles_wrong_links);
  // console.log(artciles_wrong_links.length);
  return artciles_wrong_links;
}


async function update_article(news_after_cleam) {
  return await promise_api.queue(news_after_cleam, async function ({ id, preview_text, full_text }) {
    const query = `
      UPDATE
        articles
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