// BUILD ROUTE FROM CURRENT POSITION(GPS) TO ADDRESS

window.build_route_from_current_position_to = (function () {
  'use strict';

  function getById(id) { return document.getElementById(id); }
  var ymaps = window.ymaps;
  /**
   * {
   *   @param  {String} map_id    'main' // id where build map
   *   @param  {Array} adress_order  [55.6329202, 37.5367192], // широта долгота
   *   @param  {String} id_text_about_part_route:  'text_about_loading'
   *   @param  {String}id_text_about_loading: 'text_about_loading',
   *   @param  {Boolean} turn_off_margin: for turn on/off margin-top, default false
   * }
   */
  return function (params) {
    var map_id = params.map_id;
    var address_order = params.address_order;
    var id_text_about_part_route = params.id_text_about_part_route;
    var id_text_about_loading = params.id_text_about_loading;
    var turn_off_margin = params.turn_off_margin;
    ymaps.ready(function() {
      ymaps.geolocation.get().then(function(res) {
        /**
         * [55.6329202, 37.5367192]
         * @type {String[]}
         */
        var current_position = res.geoObjects.position;


        var multiRoute = new ymaps.multiRouter.MultiRoute({
          referencePoints: [
            current_position,
            address_order
          ]
        });
        multiRoute.model.setParams({
          routingMode: 'masstransit'
        });

        multiRoute.events.add('update', function () {
          var short_path = load_text_about_route(multiRoute);
          if (!short_path) {
            return;
          }
          var $text_about_part_route = getById(id_text_about_part_route);
          $text_about_part_route.innerHTML = h_text_path(short_path);
          if (turn_off_margin) {
            return;
          }
          // calc height block and set margin-top for yandex map
          var height_text = $text_about_part_route.offsetHeight + $text_about_part_route.offsetTop;
          getById(map_id).style.marginTop = (height_text + 70)+'px';

        });

        init_maps(map_id, {
          from: current_position,
          to: address_order,
          id_text_about_loading: id_text_about_loading,
        });

        // FOR TEST
        // |
        // V
        // От кординат офиса яндекс не строит маршруты
        // init_maps(id, { from: [55.830384, 37.633812], to: adress_order });
      }, function(e) {
        console.error(e);
      });
    });

    /**
     * init_maps
     * @param  {String} id    'main' // id where build map
     * @param  {Object} options {
     *  from: [55.6329202, 37.5367192], // широта долгота
     *  to: [55.6329202, 37.5367192]
     *  id_text_about_loading: 'text_about_loading'
     * }
     */
    function init_maps(id, options) {
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
          content: 'Поменять местами',
          title: 'Поменять точки местами'
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

      if (options.id_text_about_loading) {
        getById(options.id_text_about_loading).style.display = 'none';
      }
    }

  };

  function load_text_about_route(multiRoute) {
    var list_paths = [];
    multiRoute.getRoutes().each(function(route) {
      route.getPaths().each(function(path) {
        list_paths.push(path);
      });
    });

    // sort by sec ASC
    list_paths.sort(function(a, b) {
      return a.properties.getAll().duration.value - b.properties.getAll().duration.value;
    });
    var short_path = list_paths[0];
    if (!short_path) {
      return;
    }
    return short_path;
  }

  function h_text_path(path) {
    var html = '';
    path.getSegments().each(function(segment, i) {
      var data = segment.properties.getAll();
      // html += data.type+' '+data.text+'<br>';
      html += (i+1)+'. '+data.text+'<br>';
    });
    return html;
  }

}());

