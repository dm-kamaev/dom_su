# Pancake(site and personal account for employee) and clientPA (personal account for client)

## Required folders
```sh
  /p/log/ –––––
              |
              | -- access_log/
              | -- app/
              | -- pm2/
              | -- auth/ # log by auth user
                      | –– 201801
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

## Make template dump for dev postgres and insert
```sh
scp ~/Downloads/20180705_schema_domovenok.sql dmitrijd@192.168.1.145:~/20180705_schema_domovenok.sql;
scp ~/Downloads/20180705_data_domovenok.sql dmitrijd@192.168.1.145:~/20180705_data_domovenok.sql;

dropdb -U domovenok -h localhost pancake
createdb -U domovenok -h localhost pancake
password for dev: domovenokPG

psql -U domovenok -h localhost -d pancake < /home/dmitrijd/20180705_shema_domovenok.sql
psql -U domovenok -h localhost -d pancake < /home/dmitrijd/20180705_data_domovenok.sql
```

## Cron script
```sh
 # update tables with  average review rating and number rating
 node /p/pancake/cron/calc_count_for_reviews.js

 # to decouple the users phone number
 node /p/pancake/cron/calc_count_for_reviews.js
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