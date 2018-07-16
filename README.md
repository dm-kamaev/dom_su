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
