Nginx:
```
  /etc/nginx/sites-available/default  –– config
  sudo nginx -t  –– check valid config
  sudo service nginx restart
  tail -f /var/log/nginx/access.log;
  tail -f /var/log/nginx/error.log;

  cat /etc/nginx/sites-available/domovenok.su –– config for production
```

Для генерации ecosystem.json (pm2)
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

