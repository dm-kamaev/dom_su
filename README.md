Nginx:
```
  /etc/nginx/sites-available/default  –– кофниг
  sudo nginx -t  –– check valid config
  sudo service nginx restart
```

Для генерации ecosystem.json (pm2)
```
  NODE_ENV=development node auto_config/ecosystemPancake.js
  NODE_ENV=production node auto_config/ecosystemPancake.js
```

