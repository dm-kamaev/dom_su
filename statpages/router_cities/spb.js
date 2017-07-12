"use strict";

const spbTemplates = {
    // AB test
    'ab': {name: 'main_ab.html', data: {menu: {index: true}, generateCanonical: () => buildUrl('spb', '/')}},

    'dir': 'templates/statpages/spb/',
    'key': 'spb',
    'googleb8984dcdbac1d5fd.html': {name: 'googleb8984dcdbac1d5fd.html', data: {}},
    'strahovka__': {name: 'strahovka__.html', data: {noindex: true, menu:{physical: true}}},
    'garantii__': {name: 'garantii__.html', data: {noindex: true, menu:{physical: true}}},
    'generalnaya_uborka_ofisov': {name: 'generalnaya_uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'ezhednevnaya_uborka_ofisov': {name: 'ezhednevnaya_uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'b2b__': {name: 'b2b__.html', ServiceName: 'B2B', data:{ menu:{physical: true}}},
    'glazhka': {name: 'glazhka.html', ServiceName: 'Глажка', data:{ menu:{physical: true, glazhka: true}}},
    'drugie_raboty': {name: 'drugie_raboty.html', ServiceName: 'Дополнительные работы', data:{ menu:{physical: true}}},
    'ezhednevnaya_uborka': {name: 'ezhednevnaya_uborka.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'price__': {name: 'price__.html', ServiceName: '', data:{ menu:{price: true, main: true}}},
    'vizov_mastera_na_dom': {name: 'vizov_mastera_na_dom.html', ServiceName: 'Вызов мастера', data:{ menu:{physical: true, vizov_mastera_na_dom: true}}},
    'melkii-remont': {name: 'melkii-remont.html', ServiceName: 'Вызов мастера', data:{ menu:{physical: true, vizov_mastera_na_dom: true}}},
    'mite_stekol': {name: 'mite_stekol.html', ServiceName: 'Мытье стекол', data:{ menu:{legal: true, mite_stekol: true}}},
    'mite_okon': {name: 'mite_okon.html', ServiceName: 'Мойка окон', data:{ menu:{ mite_okon: true}}},
    'compare_service': {name: 'compare_service.html', ServiceName: '', data:{ }},
    'myte-fasadov': {name: 'myte-fasadov.html', ServiceName: 'Мытьё фасадов', data:{ menu:{legal: true, myte_fasadov: true}}},
    //'mite_potolkov': {name: 'mite_potolkov.html', ServiceName: 'Генеральная уборка', data:{ menu:{ generalnaya_uborka: true}}},
    'podderzhka': {name: 'podderzhka.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    //'polirovka-polov': {name: 'polirovka-polov.html', ServiceName: 'Обработка поверхностей', data:{ menu:{legal: true, obrabotka_poverhnostey: true}}},
    'uborka_ofisov': {name: 'uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'uborka_kvartir': {name: 'uborka_kvartir.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'uborka-kottedzhej': {name: 'uborka-kottedzhej.html', ServiceName: 'Уборка коттеджей', data:{ menu:{physical: true, uborka_kottedzhej: true}}},
    'posle_remonta': {name: 'posle_remonta.html', ServiceName: 'Уборка после ремонта', data:{ menu:{physical: true, posle_remonta: true}}},
    'uborka_territorii': {name: 'uborka_territorii.html', ServiceName: 'Уборка производственных помещений', data:{ menu:{legal: true, uborka_proizvodstvennyh_pomewenij: true}}},
    'uborka-proizvodstvennyh-pomewenij': {name: 'uborka-proizvodstvennyh-pomewenij.html', ServiceName: 'Уборка производственных помещений', data:{ menu:{legal: true, uborka_proizvodstvennyh_pomewenij: true}}},
    'domrabotnica': {name: 'domrabotnica.html', ServiceName: 'Домработница', data:{ menu:{physical: true, domrabotnica: true}}},
    'himchistka': {name: 'himchistka.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    'himchistka__chistka_kovrolina_i_kovrov': {name: 'himchistka__chistka_kovrolina_i_kovrov.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    'about__': {name: 'about__.html', ServiceName: 'О компанни', data: {noindex: true, menu:{main: true, about: true}}},
    'uslugi__': {name: 'uslugi__.html', ServiceName: 'Услуги', data: { menu:{main: true, uslugi: true}}},
    'generalnaya_uborka': {name: 'generalnaya_uborka.html', ServiceName: 'Химчистка', data:{ menu:{ generalnaya_uborka: true}}},
    'main': {name: 'main.html', ServiceName: 'Главная', data: {menu: {index: true}}},
    'contacts__': {name: 'contacts__.html', ServiceName: 'Контакты', data:{ menu:{contacts: true}}},
    'davay_druzhit__': {name: 'davay_druzhit__.html', ServiceName: 'Давай дружить', data: {noindex: true, menu:{main: true, davay_druzhit: true}}},
    'vazhno_znat__': {name: 'vazhno_znat__.html', ServiceName: 'Важно знать', data: {menu:{main: true, vazhno_znat: true}, noindex: true}},
    'vakansii__': {name: 'vakansii__.html', ServiceName: 'Вакансии', data:{ menu:{main: true, vakansii: true}}},
    'vakansii__domrabotnica__': {name: 'vakansii__.html', ServiceName: 'Вакансии - Домработница', data: {domrabotnica: true, menu:{ main: true, vakansii: true}}},
    'vakansii__uborka-kvartir__': {name: 'vakansii__.html', ServiceName: 'Вакансии - Уборка квартир', data: {uborkaKvartir: true, menu:{ main: true, vakansii: true}}},
    'vakansii__uborka-territorii__': {name: 'vakansii__.html', ServiceName: 'Вакансии - Уборка территории', data: {uborkaTerritorii: true, menu:{ main: true, vakansii: true}}},
};

module.exports = {
    spbTemplates
}