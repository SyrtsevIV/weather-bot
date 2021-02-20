/* eslint-disable comma-dangle */
const {
  Scenes: { BaseScene },
  Markup,
} = require('telegraf');
const { errorMessage, mainKeyboard } = require('../helpers');
const User = require('../models/user');

const changeLocationScene = new BaseScene('changeLocationScene');

changeLocationScene.enter((ctx) => {
  try {
    return ctx.reply(
      'Пожалуйста, отправьте свою геопозицию',
      Markup.keyboard([Markup.button.locationRequest('Отправить геопозицию'), 'Отмена'])
        .oneTime()
        .resize()
    );
  } catch (err) {
    return ctx.reply(errorMessage);
  }
});

changeLocationScene.on('location', async (ctx) => {
  try {
    ctx.session.location = ctx.message.location;
    // eslint-disable-next-line max-len
    await User.findOneAndUpdate({ userid: ctx.session.user.id }, { location: ctx.message.location });
    ctx.reply('Геолокация изменена', Markup.keyboard(mainKeyboard).oneTime().resize());
    return ctx.scene.leave();
  } catch (err) {
    return ctx(errorMessage);
  }
});

changeLocationScene.hears('Отмена', (ctx) => {
  ctx.reply('Добро пожаловать. Что бы вы хотели узнать?', Markup.keyboard(mainKeyboard).oneTime().resize());
  return ctx.scene.leave();
});

module.exports = changeLocationScene;
