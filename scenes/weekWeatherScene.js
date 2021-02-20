/* eslint-disable comma-dangle */
const {
  Scenes: { BaseScene },
  Markup,
} = require('telegraf');
const fetch = require('node-fetch');
const { getDayWeather, errorMessage, mainKeyboard } = require('../helpers');
const User = require('../models/user');

const weekWeatherScene = new BaseScene('weekWeatherScene');

weekWeatherScene.enter(async (ctx) => {
  try {
    if (ctx.session.location) {
      const { location } = ctx.session;
      const weatherAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${location.latitude}&lon=${location.longitude}&appid=${process.env.WETHER_API_KEY}&lang=ru`;
      const ftch = await fetch(weatherAPI);
      const res = await ftch.json();
      const weekWeatherDataArray = res.daily;
      const weekWeatherResultArray = weekWeatherDataArray.map((day) => getDayWeather(day));
      const weekWeatherResultString = weekWeatherResultArray.join('\n\n');
      ctx.reply(weekWeatherResultString, Markup.keyboard(mainKeyboard).oneTime().resize());
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

weekWeatherScene.on('location', async (ctx) => {
  try {
    ctx.session.location = ctx.message.location;
    const user = await User.findOne({ userid: ctx.session.user.id });
    user.location = ctx.message.location;
    await user.save();
    const { location } = ctx.message;
    const weatherAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${location.latitude}&lon=${location.longitude}&appid=${process.env.WETHER_API_KEY}&lang=ru`;
    const ftch = await fetch(weatherAPI);
    const res = await ftch.json();
    const weekWeatherDataArray = res.daily;
    const weekWeatherResultArray = weekWeatherDataArray.map((day) => getDayWeather(day));
    const weekWeatherResultString = weekWeatherResultArray.join('\n\n');
    ctx.reply(weekWeatherResultString, Markup.keyboard(mainKeyboard).oneTime().resize());
    return ctx.scene.leave();
  } catch (error) {
    return ctx.reply(errorMessage);
  }
});

module.exports = weekWeatherScene;
