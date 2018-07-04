'use strict';
const { models } = require('models');
const { ShortUrl } = models;
const Router = require('koa-router');

const clientShortUrlRouter = new Router();

// /s/2wtZbS
clientShortUrlRouter.get('/s/:key', async function(ctx, next) {
  const shortUrl = await ShortUrl.findOne({
    where: {
      key: ctx.params.key
    }
  });
  if (shortUrl) {
    if (shortUrl.data) {
      let parseData = JSON.parse(shortUrl.data);
      const user = ctx.state.pancakeUser;
      if (parseData.Luid && !user.its_robot()) {
        user.sendTicket('ClientConnect', {
          luid: parseData.Luid
        });
      }
    }
    // render page for open in 1c
    if (shortUrl.url && shortUrl.url.startsWith('e1c')) {

      ctx.type = 'text/html; charset=utf-8';
      ctx.body = h_open_link_1c(shortUrl.url);
    } else {
      // ctx.status = 301;
      // ctx.redirect(shortUrl.url);

      // render page with text about for redirect to client_pa
      ctx.status = 200;
      ctx.body = render_page_for_redirect_to_client_pa();
    }
  }
  await next();
});


// render [age with link, js click this link, then open app 1c on computer, then hide link
function h_open_link_1c(url) {
  const js = `
    function getById(id) {
      return document.getElementById(id);
    }
    var $link_to_1c = getById('link_to_1c');
    $link_to_1c.onclick = function() {
      // console.log('CLICK');
      getById('main').style.display = 'none';
    };
    $link_to_1c.click();
  `;

  let html = `
    <html>
      <head></head>
      <body>
        <div id=main style=text-align:center;font-size:120%>
          <a id=link_to_1c href='${url}'>Открыть ссылку в 1С</a>
        </div>
        <script>${js}</script>
      </body>
    </html>
  `;
  return html;
}


function render_page_for_redirect_to_client_pa() {
  const html = `
    <!DOCTYPE html>
      <html lang="RU">
      <head>
        <meta charset="UTF-8"/>
        <title>Привяжите карты</title>
        <style>
          html{margin:0;padding:0;color:#333;hyphens:auto;-webkit-hyphens:auto;-moz-hyphens:auto;-ms-hyphens:auto;}
          body {font-family:Helvetica,Arial,sans-serif;font-size:120%;margin:0}
          a{color:#1A0DAB;text-decoration:underline;}
          a:active, a:focus, img{outline:0}
          a:visited{color:#1A0DAB}
          a:hover{color:#FF6633}
          p{margin:0;padding:0;line-height:1.5}
        </style>
      </head>
      <body>
        <div style="margin:100px auto 0 auto;text-align:center">
          <p style="margin:0 auto">К сожалению, ссылка устарела.</p>
          <p style="margin:0 auto">Перейдите в личный кабинет для <a href="/private/profile">оплаты</a>.</p>
          <p style="margin:0 auto">Приносим свои извинения.</p>
        </div>
      </body>
    </html>
  `;
  return html;
}

module.exports = {
  clientShortUrlRouter
};