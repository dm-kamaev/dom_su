Nginx:
```
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


```
  NODE_ENV=development node auto_config/ecosystemPancake.js
  NODE_ENV=production node auto_config/ecosystemPancake.js
```

Start project via Pm2
```
  pm2 start ecosystem.json
  pm2 restart pancake
  pm2 delete pancake; pm2 start ecosystem.json; –– чтобы pm2 увидел изменения в ecosystem.json
```

Развертка проектов(корневой путь /p/):


1. cd /p/; git pull pancake


2. Для генерации ecosystem.json (pm2)
```
  cd /p/pancake; NODE_ENV=development node auto_config/ecosystemPancake.js
```


3. cd /p/; git pull clientPa


4. Для генерации ecosystem.json (pm2)


```
  cd /p/clientPA; NODE_ENV=development node auto_config/ecosystemClientPA.js
```


5. Создается файл в /p/pancake/env/node_env.js
```
  module.exports = 'dev';
```


6. В /p/pancake/ делается
```
  npm run migrate
```


7. Создать каталог c папками
```
  /p/log/ –––––
              |
              | -- access_log/
              | -- app/
              | -- pm2/
```

Как работает раздача статики в проекте:
```
  nginx location ~/static {
    root /srv/www/domovenok_su/public_html/static/
  }
  there are two symlinks in this folder:
  
  general -> /srv/www/clientPA/public/static/general
  pancake -> /srv/www/pancake/static/pancake
  
```
