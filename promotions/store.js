"use strict";

const STORE_WWW = {
  reviews: {
    title: "Глажка в подарок",
    text: "<p>Если Вы являетесь нашим Постоянным клиентом или пользовались нашими услугами, <b>оставьте на нашем сайте свой отзыв</b>, в разделе <a href='https://www.domovenok.su/otzivi/'>Отзывы</a>, о качестве нашей работы. <b>При следующем заказе Вы сможете воспользоваться услугой, глажка белья, 1 час бесплатно</b>. Мы заранее благодарны за объективность Ваших оценок.</p>",
    preview_pic: "promotion-ironing.svg",
    picture: "promotion-ironing-main.svg",
    id: "reviews",
    promo: "1 час бесплатно",
    preview: "Если Вы являетесь нашим Постоянным клиентом или пользовались нашими услугами ..."
  },
  invite: {
    title: "Приведи друга",
    text: "<p style='text-align: center'>Что такое бонусы и как их использовать?</p><p style='text-align: center'><b>1 балл = 1 рублю</b></p><p>Делитесь приятными впечатлениями о «Домовенке»! Это выгодно.</p><p>Дарите скидку 500 рублей на услуги Домовёнка друзьям и коллегам, соседям, родным и близким! Как только они сделают заказ Вы получите 500 баллов на наши услуги.</p><p>Три способа для получения бонусных баллов:</p><ol><li><span>1.</span>Сообщить другу номер своего заказа</li><li><span>2.</span>Пригласить друга через Личный кабинет по номеру телефона</li><li><span>3.</span>Пригласить друга через Личный кабинет по электронной почте</li></ol><p>Вы можете воспользоваться бонусами в любое время при заказе услуг в нашей компании. Используйте Ваши бонусы, чтобы оплатить часть или всю стоимость услуги.</p>",
    preview_pic: "promotion-invite.svg",
    picture: "promotion-invite-main.svg",
    id: "invite",
    promo: "",
    preview: "Делитесь приятными впечатлениями о «Домовенке»! Это выгодно..."
  },
  certificates: {
    title: "Подарочный сертификат",
    text: "<p>Если Вы хотите сделать <b>необычный подарок</b> своим друзьям или близким людям - обратитесь в компанию \"Домовёнок\", <b>закажите Подарочный сертификат на проведение любых работ</b>, которые осуществляет наша компания. Это будет не только приятный и необычный подарок, но и очень полезный! Ваши друзья и близкие обязательно оценят Вашу заботу и внимание, а мы в свою очередь гарантируем высокое качество проведения работ и хорошее настроение Вашим близким людям. Подарочный сертификат оформлен празднично, с тёплыми словами и пожеланиями.</p>",
    preview_pic: "promotion-certificate.svg",
    picture: "promotion-certificate-main.svg",
    id: "certificates",
    promo: "",
    preview: "Если Вы хотите сделать необычный подарок своим друзьям или близким людям..."
  },
  coupons: {
    title: "Промокоды и купоны",
    text: "<p>Если у Вас есть купон на скидку или Вы знаете кодовую фразу (промокод), то нужно сообщить об этом менеджеру при оформлении заказа.</p><p>При наличии купона Вам следует сообщить менеджеру, что Вы хотите на следующей уборке воспользоваться купоном со скидкой. Когда будете расплачиваться, необходимо отдать этот купон Домовёнку вместе с деньгами.</p><p>А в случае с промокодом просто назовите его при заказе.</p>",
    preview_pic: "promotion-promocod.svg",
    picture: "promotion-promocod-main.svg",
    id: "coupons",
    promo: "",
    preview: "Если у Вас есть купон на скидку или Вы знаете кодовую фразу (промокод), то нужно сообщить об этом менеджеру при оформлении заказа..."
  },
  lateness: {
    title: "За опоздание",
    text: "<p>Если Вы сделали заказ в нашей компании, время проведения которого утром или в первой половине дня, а сотрудник нашей компании <b>опоздал более чем на 15 минут</b>, Вы вправе получить <b>скидку 500 рублей</b> на общую стоимость работ.</p>",
    preview_pic: "promotion-delay.svg",
    picture: "promotion-delay-main.svg",
    id: "lateness",
    promo: "Cкидка 500 рублей",
    preview: "Если Вы сделали заказ в нашей компании, время проведения которого утром или в первой ..."
  },
  schedule: {
    title: "Обслуживание по графику",
    text: "<p>Клиенты, которые <a>обслуживаются по графику</a>, имеют скидки на <b>мытье окон 15%</b> и на <b>генеральную уборку не менее 35%.</b></p>",
    preview_pic: "promotion-schedule.svg",
    picture: "promotion-schedule-main.svg",
    id: "schedule",
    promo: "1 час бесплатно",
    preview: "Клиенты, которые обслуживаются по графику, имеют скидки на мытье окон 15% и на генеральную уборку не менее 35%..."
  },
  birthday: {
    title: "День рождения",
    text: "<p>В знак заботы и любви, нашим постоянным клиентам подарок - в День рождения (за один день перед или один день после) Вы можете заказать Поддерживающую уборку бесплатно.</p>",
    preview_pic: "promotion-birthday.svg",
    picture: "promotion-birthday-main.svg",
    id: "birthday",
    promo: "Поддерживающую уборку бесплатно",
    preview: "В знак заботы и любви, нашим постоянным клиентам подарок - в День рождения ..."
  }
}

const STORE_SPB = {
  certificates: {
    title: "Сертификат на наши услуги",
    text: "<p>Не знаете, что подарить в честь праздника друзьям или родственникам? У нас есть полезное предложение! Предлагаем подарить им отдых и свободное время. Обратитесь к нашим специалистам и сделайте заказ Подарочного сертификата на любую услугу нашей компании. Гарантируем, что такой подарок будет и приятным, и полезным! Мы позаботимся, чтобы у Ваших близких остались приятные впечатления от подарка гарантируем качественное проведение работ. Подарочный сертификат специально оформлен красиво и празднично.</p>",
    preview_pic: "promotion-certificate.svg",
    picture: "promotion-certificate-main.svg",
    id: "certificates",
    promo: "",
    preview: "Если Вы хотите сделать необычный подарок своим друзьям или близким людям..."
  },
  coupons: {
    title: "Промо-коды и купоны",
    text: "<p>Вы узнали кодовую фразу (промо-код) или стали обладателем сертификата со скидкой? Обязательно расскажите об этом нашему специалисту по телефону. Наши менеджеры непременно проставят Вам скидку по сертификату или по промо-коду.</p><p>Если Вы владеете сертификатом, то его следует отдать нашему домовенку после уборки вместе с деньгами.</p>",
    preview_pic: "promotion-promocod.svg",
    picture: "promotion-promocod-main.svg",
    id: "coupons",
    promo: "",
    preview: "Если у Вас есть купон на скидку или Вы знаете кодовую фразу (промокод), то нужно сообщить об этом менеджеру при оформлении заказа..."
  },
  lateness: {
    title: "Опоздание домовенка",
    text: "<p>Уборка была заказана на утро или первую половину дня, а наш домовенок не пришел вовремя и <b>срок опоздания составил от 15 минут</b> и больше? В этом случае общая <b>цена услуги будет снижена на 500 руб</b>.</p>",
    preview_pic: "promotion-delay.svg",
    picture: "promotion-delay-main.svg",
    id: "lateness",
    promo: "Cкидка 500 рублей",
    preview: "Если Вы сделали заказ в нашей компании, время проведения которого утром или в первой ..."
  },
  reviews: {
    title: "Подарок за отзыв",
    text: "<p>Вы заказали у нас уборку или другую услугу и хотите рассказать о своем опыте? Вы можете оставить отзыв у нас на сайте, в разделе <a href='https://spb.domovenok.su/otzivi/'>Отзывы</a>. Расскажите про наши услуги и домовят. Мы обязательно ответим Вам и в качестве нашего Спасибо подарим Вам 1 час глажки на следующую уборку. Заранее благодарим Вас за честность в отзывах.</p>",
    preview_pic: "promotion-ironing.svg",
    picture: "promotion-ironing-main.svg",
    id: "reviews",
    promo: "1 час бесплатно",
    preview: "Если Вы сделали заказ в нашей компании, время проведения которого утром или в первой ..."
  },
  schedule: {
    title: "Скидки для постоянных клиентов",
    text: "<p>Наши постоянные клиенты, которые заключили договор на постоянные уборки, получают от нашей компании скидки на <b>мытье окон 15%</b> и на <b>генеральную уборку не менее 25%</b>.</p>",
    preview_pic: "promotion-schedule.svg",
    picture: "promotion-schedule-main.svg",
    id: "schedule",
    promo: "1 час бесплатно",
    preview: "Клиенты, которые обслуживаются по графику, имеют скидки на мытье окон 15% и на генеральную уборку не менее 25%..."
  },

  birthday: {
    title: "День рождения",
    text: "<p>Мы любим наших клиентов и любим дарить подарки. Если у Вас День Рождения, как нашему постоянному клиенту мы подарим Вам <a href='https://spb.domovenok.su/podderzhka'>Поддерживающую уборку</a> бесплатно. Закажите ее за один день перед своим днем рождения или один день после.</p>",
    preview_pic: "promotion-birthday.svg",
    picture: "promotion-birthday-main.svg",
    id: "birthday",
    promo: "Поддерживающую уборку бесплатно",
    preview: "В знак заботы и любви, нашим постоянным клиентам подарок - в День рождения ..."
  }
}

const STORE = {
    moscow: STORE_WWW,
    spb: STORE_SPB,
}

let promotionsRegExp = RegExp('^\/skidki_akcii\/((:?[\\w\\d_-]+)\/)?$', 'g')

function checkPromotionUrl(cityKW, url) {
    promotionsRegExp.lastIndex = 0
    let match = (promotionsRegExp.exec(url))
    if (match != null){
        if (match[2] == undefined){
            return true
        }
        if (STORE[cityKW] && STORE[cityKW][match[2]]){
            return true
        }
    }
    return false
}

function getPromotion(city, key) {
    return STORE[city.keyword][key]
}

function getPromotionList(city) {
    return STORE[city.keyword]
}

module.exports = {
    getPromotion,
    getPromotionList,
    checkPromotionUrl,
}