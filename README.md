# Weather_Bot

Телеграм бот для просмотра прогноза погоды на неделю и информации о погоде на данный момент с функцией настройки уведомлений. Реализовано на основе концепции сценариев и сессий, реализованных в telegraf API.

### Стек технологий

- OpenWeather API
- Telegraf API
- Mongo DB
- Node Schedule

### Запуск проекта
1. Перейти в корневой каталог проекта
2. В командной строке выполнить (однократно для установки): 
```sh
npm install
```
3. Переименовать .env.sample в .env (в папке client и папке server) и заполнить поля:
```sh
BOT_TOKEN= token to access the HTTP bot API
WETHER_API_KEY= OpenWeather API key
DB= mongoDB url
```
4. Запуск проекта:
```sh
npm start
```

### Быстрый обзор

![gif](readme-assets/preview.gif)
