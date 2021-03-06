'use strict';

const moscowTemplates = {
    'dir': 'templates/statpages/www/',
    'key': 'moscow',


    // AB test page
    // main_ab: {hide: true, name: 'main_ab.html', data: {menu: {index: true}}},
    // himchistka_ab : {name: 'himchistka_ab.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    //uborka_ofisov_ab: {name: 'uborka_ofisov_ab.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    // main_ab2: {hide: true, name: 'main_ab2.html', data: {menu: {index: true}}},
    // price_ab: {name: 'price_ab.html', ServiceName: 'Цены', data:{ menu:{main: true, price: true}}},
    //podderzhka_ab: {hide: true,name: 'podderzhka_ab.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    //'generalnaya_uborka_ab': {hide: true, name: 'generalnaya_uborka_ab.html', ServiceName: 'Генеральная уборка', data:{ menu:{general: true}}},
    //'posle_remonta_ab': {hide: true, name: 'posle_remonta_ab.html', ServiceName: 'Уборка после ремонта', data:{ menu:{physical: true, posle_remonta: true}}},
    //'mite_okon_ab': {hide: true, name: 'mite_okon_ab.html', ServiceName: 'Мойка окон', data:{ menu:{ mite_okon: true}}},

    'main': {name: 'main.html', data: {menu: {index: true}}},
    'user_agreement__': {name: 'user_agreement__.html', data: { menu:{main: true, user_agreement: true}}},
    'contract__': {name: 'contract__.html', data: { }},
    'privacy__': {name: 'privacy__.html', data: { }},
    'strahovka__': {name: 'strahovka__.html', data:{ menu:{physical: true }}},
    'garantii__': {name: 'garantii__.html', data:{ menu:{main: true, garantii: true}}},
    'ezhednevnaya_uborka_ofisov': {name: 'ezhednevnaya_uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'generalnaya_uborka_ofisov': {name: 'generalnaya_uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'vechernyaya_uborka_ofisov': {name: 'vechernyaya_uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{menu:{legal: true, uborka_ofisov: true}}},
    'utrennyaya_uborka_ofisov': {name: 'utrennyaya_uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'uborka_sluzhebnyh_pomeshhenij': {name: 'uborka_sluzhebnyh_pomeshhenij.html', ServiceName: 'Промышленный альпинизм', data:{ menu:{legal: true, promyshlennyj_alpinizm: true}}},
    'mite_potolkov': {name: 'mite_potolkov.html', ServiceName: 'Генеральная уборка', data:{ menu:{ generalnaya_uborka: true}}},
    'uborka_territorii': {name: 'uborka_territorii.html', ServiceName: 'Уборка производственных помещений', data:{ menu:{legal: true, uborka_proizvodstvennyh_pomewenij: true}}},
    'uborka_kvartir': {name: 'uborka_kvartir.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{podderzhka: true}}},
    'compare_service': {name: 'compare_service.html', ServiceName: '', data:{ }},
    'landings__applicant_cleaner': {name: 'landings__applicant_cleaner.html', ServiceName: 'Набор сотрудников', data:{ }},
    'uborka_kvartir__balconi': {name: 'uborka_kvartir__balconi.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{podderzhka: true}}},
    'uborka_kvartir__chetirehkomnatnaya': {name: 'uborka_kvartir__chetirehkomnatnaya.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'uborka_kvartir__dvuhkomnatnaya': {name: 'uborka_kvartir__dvuhkomnatnaya.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'uborka_kvartir__odnokomnatnaya': {name: 'uborka_kvartir__odnokomnatnaya.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'uborka_kvartir__trehkomnatnaya': {name: 'uborka_kvartir__trehkomnatnaya.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},

    'master_po_remontu_mebeli': {name: 'master_po_remontu_mebeli.html', ServiceName: 'Вызов мастера', data:{ menu:{physical: true, vizov_mastera_na_dom: true}}},
    'kompleksnaya_uborka': {name: 'kompleksnaya_uborka.html', ServiceName: 'Комплексная уборка', data:{ menu:{ kompleksnaya_uborka: true}}},
    'ezhednevnaya_uborka': {name: 'ezhednevnaya_uborka.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'melkii-remont': {name: 'melkii-remont.html', ServiceName: 'Вызов мастера', data:{ menu:{physical: true, vizov_mastera_na_dom: true}}},
    'glazhka': {name: 'glazhka.html', ServiceName: 'Глажка', data:{ menu:{physical: true, glazhka: true}}},
    'price__': {name: 'price__.html', ServiceName: 'Цены', data:{ menu:{main: true, price: true}}},
    'uslugi__': {name: 'uslugi__.html', ServiceName: 'Услуги', data: { menu:{main: true, uslugi: true}}},
    'contacts__': {name: 'contacts__.html', ServiceName: 'Контакты', data:{ menu:{contacts: true}}},
    'himchistka': {name: 'himchistka.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    'himchistka__chistka_mebeli': {name: 'himchistka__chistka_mebeli.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    'himchistka__chistka_matrasov': {name: 'himchistka__chistka_matrasov.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    'himchistka__chistka_kovrolina_i_kovrov': {name: 'himchistka__chistka_kovrolina_i_kovrov.html', ServiceName: 'Химчистка', data:{ menu:{physical: true, himchistka: true}}},
    'promyshlennyj-alpinizm': {name: 'promyshlennyj-alpinizm.html', ServiceName: 'Промышленный альпинизм', data:{ menu:{legal: true, promyshlennyj_alpinizm: true}}},
    'promyshlennyj-alpinizm__mite_okon_na_visote__': {name: 'promyshlennyj-alpinizm__mite_okon_na_visote__.html', ServiceName: 'Промышленный альпинизм', data:{ menu:{legal: true, promyshlennyj_alpinizm: true}}},
    'davay_druzhit__': {name: 'davay_druzhit__.html', data: { menu:{main: true, davay_druzhit: true}}},
    'vazhno_znat__': {name: 'vazhno_znat__.html', data: { menu:{main: true, vazhno_znat: true}}},
    'myte-fasadov': {name: 'myte-fasadov.html', ServiceName: 'Мытьё фасадов', data:{ menu:{legal: true, myte_fasadov: true}}},
    'mite_stekol': {name: 'mite_stekol.html', ServiceName: 'Мытье стекол', data:{ menu:{legal: true, mite_stekol: true}}},
    'ofisnyy-master': {name: 'ofisnyy-master.html', ServiceName: 'Вызов мастера', data:{ menu:{legal: true, ofisnyy_master: true}}},
    'uborka-proizvodstvennyh-pomewenij': {name: 'uborka-proizvodstvennyh-pomewenij.html', ServiceName: 'Уборка производственных помещений', data:{ menu:{legal: true, uborka_proizvodstvennyh_pomewenij: true}}},
    'uborka_ofisov': {name: 'uborka_ofisov.html', ServiceName: 'Уборка офисов', data:{ menu:{legal: true, uborka_ofisov: true}}},
    'chistka_basseynov': {name: 'chistka_basseynov.html', ServiceName: 'Обработка поверхностей', data:{ menu:{legal: true, obrabotka_poverhnostey: true}}},
    'polirovka-polov': {name: 'polirovka-polov.html', ServiceName: 'Обработка поверхностей', data:{ menu:{legal: true, obrabotka_poverhnostey: true}}},
    'obrabotka_poverhnostey': {name: 'obrabotka_poverhnostey.html', ServiceName: 'Обработка поверхностей', data:{ menu:{legal: true, obrabotka_poverhnostey: true}}},
    'vizov_mastera_na_dom': {name: 'vizov_mastera_na_dom.html', ServiceName: 'Вызов мастера', data:{ menu:{physical: true, vizov_mastera_na_dom: true}}},
    'mite_okon': {name: 'mite_okon.html', ServiceName: 'Мойка окон', data:{ menu:{ mite_okon: true}}},
    'uborka-kottedzhej': {name: 'uborka-kottedzhej.html', ServiceName: 'Уборка коттеджей', data:{ menu:{physical: true, uborka_kottedzhej: true}}},
    'posle_remonta': {name: 'posle_remonta.html', ServiceName: 'Уборка после ремонта', data:{ menu:{physical: true, posle_remonta: true}}},
    'generalnaya_uborka': {name: 'generalnaya_uborka.html', ServiceName: 'Генеральная уборка', data:{ menu:{ generalnaya_uborka: true}}},
    'domrabotnica': {name: 'domrabotnica.html', ServiceName: 'Домработница', data:{ menu:{physical: true, domrabotnica: true}}},
    'drugie_raboty': {name: 'drugie_raboty.html', ServiceName: 'Дополнительные работы', data:{ menu:{physical: true}}},
    'podderzhka': {name: 'podderzhka.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
    'about__': {name: 'about__.html', ServiceName: 'О компании', data:{ menu:{main: true, about: true}}},
    'b2b__': {name: 'b2b__.html', ServiceName: 'B2B', data:{ menu:{physical: true}}},
    'vakansii__': {name: 'vakansii__.html', ServiceName: 'Вакансии', data:{ menu:{main: true, vakansii: true}}},
    'vakansii__domrabotnica__': {name: 'vakansii__.html', ServiceName: 'Вакансии - Домработница', data: { domrabotnica: true, menu:{ main: true, vakansii: true}}},
    'vakansii__uborka-kvartir__': {name: 'vakansii__.html', ServiceName: 'Вакансии - Уборка квартир', data: { uborkaKvartir: true, menu:{ main: true, vakansii: true}}},
    'vakansii__uborka-territorii__': {name: 'vakansii__.html', ServiceName: 'Вакансии - Уборка территории', data: { uborkaTerritorii: true, menu:{ main: true, vakansii: true}}},
    'vash-brauzer-ustarel': {name: 'old_browser.html', ServiceName: '', data: {}},
    'order': {name: 'order.html', ServiceName: '', data: {}},
    'survey': {name: 'survey.html', ServiceName: '', data: {}}
}

module.exports = {
    moscowTemplates
}
