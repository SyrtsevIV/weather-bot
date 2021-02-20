/* eslint-disable comma-dangle */
const {
  Scenes: { BaseScene },
  Markup,
} = require('telegraf');
const fetch = require('node-fetch');
const { getCurrentWeather, errorMessage, mainKeyboard } = require('../helpers');
const User = require('../models/user');

const currentWeatherScene = new BaseScene('currentWeatherScene');

currentWeatherScene.enter(async (ctx) => {
  try {
    if (ctx.session.location) {
      const { location } = ctx.session;
      const weatherAPI = `http://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${process.env.WETHER_API_KEY}&lang=ru`;
      const ftch = await fetch(weatherAPI);
      const res = await ftch.json();

      ctx.reply(getCurrentWeather(res), Markup.keyboard(mainKeyboard).oneTime().resize());
      return ctx.scene.leave();
    }
    return ctx.reply(
      'Пожалуйста, отправьте свою геопозицию',
      Markup.keyboard([Markup.button.locationRequest('Отправить геопозицию')])
        .oneTime()
        .resize()
    );
  } catch (err) {
    return ctx.reply(errorMessage);
  }
});
currentWeatherScene.on('location', async (ctx) => {
  try {
    ctx.session.location = ctx.message.location;
    const user = await User.findOne({ userid: ctx.session.user.id });
    user.location = ctx.message.location;
    await user.save();
    const { location } = ctx.message;
    const weatherAPI = `http://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${process.env.WETHER_API_KEY}&lang=ru`;
    const ftch = await fetch(weatherAPI);
    const res = await ftch.json();
    ctx.reply(getCurrentWeather(res), Markup.keyboard(mainKeyboard).oneTime().resize());
    return ctx.scene.leave();
  } catch (err) {
    return ctx.reply(errorMessage);
  }
});

module.exports = currentWeatherScene;
