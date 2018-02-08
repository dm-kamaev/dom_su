Nginx:
```
  /etc/nginx/sites-available/default  –– config
  sudo nginx -t  –– check valid config
  sudo service nginx restart
  tail -f /var/log/nginx/access.log;
  tail -f /var/log/nginx/error.log;

  cat /etc/nginx/sites-available/domovenok.su –– config for production
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

Развертка проектов:
По пути кладешь /p/
cd /p/; git pull pancake
Для генерации ecosystem.json (pm2)
```
  cd /p/pancake; NODE_ENV=development node auto_config/ecosystemPancake.js
```
cd /p/; git pull clientPa
Для генерации ecosystem.json (pm2)
```
  cd /p/clientPA; NODE_ENV=development node auto_config/ecosystemClientPA.js
```
Создается файл в /p/pancake/env/node_env.js
```
  module.exports = 'dev';
```
В /p/pancake/ делается
```
  npm run migrate
```
Создать каталог c папками
```
  /p/log/ –––––
              |
              | -- access_log/
              | -- app/
              | -- pm2/
```