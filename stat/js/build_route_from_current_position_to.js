// BUILD ROUTE FROM CURRENT POSITION(GPS) TO ADDRESS

window.build_route_from_current_position_to = (function () {
  'use strict';
  /**
   * ]
   * @param  {String} id    'main' // id where build map
   * @param  {Array} adress_order  [55.6329202, 37.5367192], // широта долгота
   */
  return function (id, adress_order) {
    ymaps.ready(function() {
      ymaps.geolocation.get().then(function(res) {
        var current_position = res.geoObjects.position;

        ini_maps(id, {
          from: current_position,
          to: adress_order
        });

        // FOR TEST
        // |
        // V
        // От кординат офиса яндекс не строит маршруты
        // ini_maps(id, { from: [55.830384, 37.633812], to: adress_order });
      }, function(e) {
        console.error(e);
      });
    });

    /**
     * ini_maps
     * @param  {String} id    'main' // id where build map
     * @param  {Object} options {
     *  from: [55.6329202, 37.5367192], // широта долгота
     *  to: [55.6329202, 37.5367192]
     * }
     */
    function ini_maps(id, options) {
      console.log(id, options.from, options.to);
      var myMap = new ymaps.Map(id, {
        //       широта, долгота
        center: [55.753994, 37.622093], // moscow
        zoom: 9,
        // Добавим панель маршрутизации.
        controls: ['routePanelControl']
      });

      var control = myMap.controls.get('routePanelControl');

      // Зададим состояние панели для построения машрутов.
      control.routePanel.state.set({
        // Тип маршрутизации.
        type: 'masstransit',
        // Выключим возможность задавать пункт отправления в поле ввода.
        fromEnabled: false,
        // Адрес или координаты пункта отправления.
        // from: 'Москва, Льва Толстого 16',
        from: options.from,
        // Включим возможность задавать пункт назначения в поле ввода.
        toEnabled: true,
        // Адрес или координаты пункта назначения.
        // to: 'Петербург'
        // to: 'Москва, Льва Толстого 2',
        to: options.to
      });

      // Зададим опции панели для построения машрутов.
      control.routePanel.options.set({
        // Запрещаем показ кнопки, позволяющей менять местами начальную и конечную точки маршрута.
        allowSwitch: false,
        // Включим определение адреса по координатам клика.
        // Адрес будет автоматически подставляться в поле ввода на панели, а также в подпись метки маршрута.
        reverseGeocoding: true,
        // Зададим виды маршрутизации, которые будут доступны пользователям для выбора.
        types: {
          masstransit: true,
          pedestrian: true
        }
      });

      // Создаем кнопку, с помощью которой пользователи смогут менять местами начальную и конечную точки маршрута.
      var switchPointsButton = new ymaps.control.Button({
        data: {
          content: "Поменять местами",
          title: "Поменять точки местами"
        },
        options: {
          selectOnClick: false,
          maxWidth: 160
        }
      });
      // Объявляем обработчик для кнопки.
      switchPointsButton.events.add('click', function() {
        // Меняет местами начальную и конечную точки маршрута.
        control.routePanel.switchPoints();
      });
      myMap.controls.add(switchPointsButton);
    }
  };
}());

