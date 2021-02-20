/* eslint-disable comma-dangle */
require('dotenv').config();
const {
  Scenes: { Stage, BaseScene },
  session,
  Telegraf,
  Markup,
} = require('telegraf');
const fetch = require('node-fetch');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const User = require('./models/user');
const weekWeatherScene = require('./scenes/weekWeatherScene');
const currentWeatherScene = require('./scenes/currentWeatherScene');
const changeLocationScene = require('./scenes/changeLocationScene');
const { getCurrentWeather, errorMessage, mainKeyboard } = require('./helpers');

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!');
}

const bot = new Telegraf(token);

let scheduler;

const notifSettingsScene = new BaseScene('notifSettingsScene');

notifSettingsScene.enter((ctx) => {
  ctx.reply('Пожалуйста, укажите время в формате ЧАСЫ:МИНУТЫ (например: 14:20)');
});

notifSettingsScene.on('text', async (ctx) => {
  try {
    if (ctx.message.text.match(/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/gi)) {
      const user = await User.findOne({ userid: ctx.session.user.id });
      user.notificationTime = ctx.message.text;
      await user.save();
      const time = user.notificationTime.split(':');
      const hour = time[0];
      const minute = time[1];
      scheduler = schedule.scheduleJob({ hour, minute }, async () => {
        const { location } = user;
        const weatherAPI = `http://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${process.env.WETHER_API_KEY}&lang=ru`;
        const ftch = await fetch(weatherAPI);
        const res = await ftch.json();
        bot.telegram.sendMessage(ctx.chat.id, getCurrentWeather(res));
      });
      ctx.reply(
        `Уведомления установлены на каждый день в ${user.notificationTime}`,
        Markup.keyboard(mainKeyboard).oneTime().resize()
      );
      return ctx.scene.leave();
    }
    return ctx.reply('Пожалуйста проверьте правильность формата указанного времени');
  } catch (err) {
    return ctx.reply(errorMessage);
  }
});

// eslint-disable-next-line max-len
const stage = new Stage([currentWeatherScene, weekWeatherScene, changeLocationScene, notifSettingsScene]);

bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  ctx.session.user = ctx.message.from;
  const user = await User.findOne({ userid: ctx.session.user.id });
  if (!user) {
    await User.create({ userid: ctx.session.user.id });
  } else {
    ctx.session.location = user?.location;
  }
  ctx.reply('Добро пожаловать. Что бы вы хотели узнать?', Markup.keyboard(mainKeyboard).oneTime().resize());
});

bot.hears('Погода на неделю', Stage.enter('weekWeatherScene'));
bot.hears('Погода на данный момент', Stage.enter('currentWeatherScene'));
bot.hears('Изменить геолокацию', Stage.enter('changeLocationScene'));
bot.hears('Настоить уведомления', (ctx) => {
  ctx.reply(
    'Что вы хотите настроить?',
    Markup.keyboard(['Включить уведомления', 'Выключить уведомления', 'Отмена']).oneTime().resize()
  );
});
bot.hears('Отмена', (ctx) => {
  ctx.reply('Добро пожаловать. Что бы вы хотели узнать?', Markup.keyboard(mainKeyboard).oneTime().resize());
});
bot.hears('Включить уведомления', Stage.enter('notifSettingsScene'));
bot.hears('Выключить уведомления', async (ctx) => {
  try {
    const user = await User.findOne({ userid: ctx.session.user.id });
    user.notificationTime = '';
    await user.save();
    scheduler.cancel();
    return ctx.reply('Уведомления отключены', Markup.keyboard(mainKeyboard).oneTime().resize());
  } catch (err) {
    return ctx.reply(errorMessage);
  }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
