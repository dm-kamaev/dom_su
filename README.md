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

```sh
  pg_dump -s domovenok > ~/20180705_schema_domovenok.sql
  pg_dump --data-only -d domovenok -t articles -t cities -t phones -t employee_news -t news -t payments -t pgmigrations -t pictures -t reviews -t short_url > ~/20180705_data_domovenok.sql
  scp ~/Downloads/20180705_data_domovenok.sql dmitrijd@174.138.10.72:~/20180705_data_domovenok.sql;
  scp ~/Downloads/20180705_schema_domovenok.sql dmitrijd@174.138.10.72:~/20180705_schema_domovenok.sql;
  psql -U domovenok -W  -h localhost -d postgres -c 'ALTER DATABASE pancake_new RENAME TO pancake'
```