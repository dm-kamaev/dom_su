'use strict';

const ABTestContainer = {
    'moscow': {
        // 'generalnaya_uborka': { name: "Первое тестирование генералки Москва", key: "general_first", forNewUser: true, variations: [
        //     {name: "control", page: 'generalnaya_uborka', ratio: 50, description: "Основная"},
        //     {name: "variation", page: 'garantii__', ratio: 50, description: "Пробуем новый дизайн"}
        // ]},
        'podderzhka': { name: "", key: "podderzhka_3_otzivi", forNewUser: true, variations: [
            {name: "control", page: 'podderzhka', ratio: 20, description: "Основная"},
            {name: "variation", page: 'podderzhka_ab', ratio: 80, description: "Пробуем новый дизайн"}
        ]},
        // 'posle_remonta': { name: "", key: "posle_remonta_2_new_design", forNewUser: true, variations: [
        //     {name: "control", page: 'posle_remonta', ratio: 50, description: "Основная"},
        //     {name: "variation", page: 'posle_remonta_ab', ratio: 50, description: "Пробуем новый дизайн"}
        // ]},
        // 'mite_okon': { name: "", key: "mite_okon_1_new_design", forNewUser: true, variations: [
        //     {name: "control", page: 'mite_okon', ratio: 50, description: "Основная"},
        //     {name: "variation", page: 'mite_okon_ab', ratio: 50, description: "Пробуем новый дизайн"}
        // ]},
        // 'main': { name: "", key: "main_3_new_design", forNewUser: false, variations: [
        //     {name: "control", page: 'main', ratio: 20, description: "Основная"},
        //     {name: "variation", page: 'main_ab', ratio: 80, description: "Пробуем новый дизайн"}
        // ]},
    }
}

const yaBotsRegExp = new RegExp('yandex.com/bots')

function choiceTest(variations) {
    let maxNumber = variations.reduce((perValue, item) => {
        return perValue + item.ratio
    }, 0)
    let choiceNumber = Math.round(Math.random()*maxNumber)
    let index = 0
    for (let variation of variations){
        index += variation.ratio
        if (index >= choiceNumber){
            return variation
        }
    }
    return variations[0]
}

async function checkForOnlyFirstVisit(ctx, abTest) {
    if (!abTest.forNewUser){
        return true
    }
    if (ctx.state.pancakeUser.getABTest(abTest)){
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