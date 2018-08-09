'use strict';

const random = require("random-js")();

const ABTestContainer = {
  'moscow': {
    // 'generalnaya_uborka': { name: "Тестирование 3-го шага на рассчете стоимости", key: "generalnaya_uborka_1_3step", forNewUser: true, variations: [
    //     {name: "control", page: 'generalnaya_uborka', ratio: 50, description: "Основные дополнительные услуги"},
    //     {name: "variation", page: 'generalnaya_uborka_ab', ratio: 50, description: "Мытье окон как доп. услуга"},
    // // ]},
    // podderzhka: {
    //   name: "",
    //   key: "podderzhka_9_order",
    //   forNewUser: true,
    //   variations: [{
    //     name: "control",
    //     page: 'podderzhka',
    //     ratio: 90,
    //     description: "Основная"
    //   }, {
    //     name: "variation",
    //     page: 'podderzhka_ab',
    //     ratio: 10,
    //     description: "Форма первая"
    //   }]
    // },
    // 'posle_remonta': { name: "", key: "posle_remonta_2_new_design", forNewUser: true, variations: [
    //     {name: "control", page: 'posle_remonta', ratio: 50, description: "Основная"},
    //     {name: "variation", page: 'posle_remonta_ab', ratio: 50, description: "Пробуем новый дизайн"}
    // ]},
    // 'mite_okon': { name: "", key: "mite_okon_1_new_design", forNewUser: true, variations: [
    //     {name: "control", page: 'mite_okon', ratio: 50, description: "Основная"},
    //     {name: "variation", page: 'mite_okon_ab', ratio: 50, description: "Пробуем новый дизайн"}
    // ]},
    // main: {
    //   name: "",
    //   key: "main_17_20180803_10:16:22",
    //   forNewUser: true,
    //   variations: [{
    //     name: "control",
    //     page: 'main',
    //     ratio: 80,
    //     description: "",
    //     visited: 0
    //   }, {
    //     name: "variation",
    //     page: 'main_ab',
    //     ratio: 20,
    //     description: "",
    //     visited: 0
    //   }]
    // },
    // himchistka: {
    //   name: "",
    //   key: "him_1_20180806_10:16:22",
    //   forNewUser: true,
    //   variations: [{
    //     name: "control",
    //     page: 'himchistka',
    //     ratio: 50,
    //     description: "",
    //     visited: 0
    //   }, {
    //     name: "variation",
    //     page: 'himchistka_ab',
    //     ratio: 50,
    //     description: "",
    //     visited: 0
    //   }]
    // },
    // 'price__': {
    //     name: "Изменение дизайна",
    //     key: "price_1_new",
    //     forNewUser: true,
    //     variations: [{
    //         name: "control",
    //         page: 'price__',
    //         ratio: 50,
    //         description: "Основная"
    //     }, {
    //         name: "variation",
    //         page: 'price_ab',
    //         ratio: 50,
    //         description: "Пробуем новый дизайн"
    //     }]
    // },
  }
}

const yaBotsRegExp = new RegExp('yandex.com/bots')

function choiceTest(variations) {
  let maxNumber = variations.reduce((perValue, item) => {
    return perValue + item.ratio
  }, 0)
  // let choiceNumber = Math.round(Math.random() * maxNumber)
  // determine random
  let choiceNumber = Math.round(random.real(0, 1) * maxNumber);
  let index = 0
  for (let variation of variations) {
    index += variation.ratio
    if (index >= choiceNumber) {
      return variation
    }
  }
  return variations[0]
}

async function checkForOnlyFirstVisit(ctx, abTest) {
  if (!abTest.forNewUser) {
    return true
  }
  if (ctx.state.pancakeUser.getABTest(abTest)) {
    return true
  }
  return ctx.state.pancakeUser.firstVisit
}

module.exports = {
  yaBotsRegExp,
  ABTestContainer,
  choiceTest,
  checkForOnlyFirstVisit
}
