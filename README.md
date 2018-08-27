# Pancake(site and personal account for employee) and clientPA (personal account for client)

## Required folders
```sh
  /p/log/ –––––
              |
              | -- access_log/  access_log for pancake
              | -- pm2/  all logs pm2
              | -- payment/  all logs about payment

```


## Up project pancake(site and personal account for employee)
1. Clone project
```sh
  cd /p/;
  git clone git@bitbucket.org:wwwdomovenoksu/pancake.git
```
2. Create ecosystem.json for pm2
```sh
  cd pancake;
  node auto_config/ecosystemPancake.js
```
3. Up migrate
```sh
  npm run migrate
```
4. Test
```sh
  npm run test
```
5. Start project via Pm2
```sh
  pm2 start ecosystem.json
  pm2 restart pancake
  # pm2 see change in config
  pm2 delete pancake; pm2 start ecosystem.json;
```


## Up project clientPA (personal account for client)
1. Start pancake
2. Clone project
```sh
  cd /p/;
  git clone git@bitbucket.org:wwwdomovenoksu/clientpa.git
```
4. Rename folder
```sh
  mv clientpa clientPA
```
3. Create ecosystem.json for pm2
```sh
  cd clientPA;
  node auto_config/ecosystemClientPA.js
```
4. Start project via Pm2
```sh
  pm2 start ecosystem.json
  pm2 restart clientPA
  # pm2 see change in config
  pm2 delete clientPA; pm2 start ecosystem.json;
```

## Nginx:
```sh
  /etc/nginx/sites-available/default  –– config
  sudo nginx -t  –– check valid config
  sudo service nginx restart
  tail -f /var/log/nginx/access.log;
  tail -f /var/log/nginx/error.log;

  # old config for production
  cat /etc/nginx/sites-available/domovenok.su

  # new config nginx
  cat /etc/nginx/sites-enabled/domovenok.conf
```

## How work server static in projects
```sh
  nginx location ~/static {
    root /srv/www/domovenok_su/public_html/static/
  }

  # there are two symlinks in this folder:
  general -> /srv/www/clientPA/public/static/general
  pancake -> /srv/www/pancake/static/pancake

```

## Make template dump for dev postgres
```sh
# only schema
pg_dump -s -U domovenok -h localhost -d domovenok > ~/20180705_schema_domovenok.sql
# only data for table
pg_dump --data-only -d domovenok -t pgmigrations -t articles -t cities -t phones -t employee_news -t news -t payments -t pictures -t reviews -t reviews_count -t reviews_average_rating  -t short_url > ~/20180705_data_domovenok.sql
```

# Insert dump
dropdb -U domovenok -h localhost pancake
createdb -U domovenok -h localhost pancake
password for dev: domovenokPG

psql -U domovenok -h localhost -d pancake < ~/20180705_shema_domovenok.sql
psql -U domovenok -h localhost -d pancake < ~/20180705_data_domovenok.sql
```

## Cron script
```sh
 # update tables with  average review rating and number rating
 node /p/pancake/cron/calc_count_for_reviews.js

 # to decouple the users phone number
 node /p/pancake/cron/calc_count_for_reviews.js

 # where are cron scriptы
 sudo nano /etc/crontab
```

## How create a/b test
```sh
file /p/pancake/statpages/ab_tests.js

const ABTestContainer = {
  moscow: {
    main: { // create a/b test for page main
      name: "",
      key: "main_14_20180716_11:52:22", // required, unique name
      forNewUser: true, // default: false
      variations: [{
        name: "control", // required, unique name in this array
        page: 'main',
        ratio: 50, // required
        description: "",
        visited: 0, // required, for start
      }, {
        name: "variation", // required, unique name in this array
        page: 'main_ab',
        ratio: 50,  // required
        description: "",
        visited: 0, // required, for start
      }]
    },
  };
```
Пример:

```
pancake/statpages/ab_tests.js
  'moscow': {
    podderzhka: {
      name: "",
      key: "podderzhka_20180816_10:16:22",
      forNewUser: true,
      variations: [{
        name: "control",
        page: 'podderzhka',
        ratio: 50,
        description: "Основная"
      }, {
        name: "variation",
        page: 'podderzhka_ab',
        ratio: 50,
        description: "Форма первая"
      }]
    },
  }
```
key должен быть обычно такой это имя: testName_yyyymmdd_hh:mm:ss
forNewUser, только для новых пользователей
variations массив вариантов страниц.
ratio в каком соотношении раскидывать по страницам
page ключ для страницы в зависимости от города это pancake/statpages/router_cities/moscow.js || pancake/statpages/router_cities/nn.js || pancake/statpages/router_cities/spb.js

Затем добавляем page
Пример:
```
pancake/statpages/router_cities/moscow.js
  podderzhka_ab: {hide: true,name: 'podderzhka_ab.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
  'podderzhka': {name: 'podderzhka.html', ServiceName: 'Поддерживающая уборка', data:{ menu:{ podderzhka: true}}},
```
name кажется указывает на html страницу
про остальные ключи ничего не знаю

шаблоны страниц лежат в templates/statpages/moscow||nn||spb