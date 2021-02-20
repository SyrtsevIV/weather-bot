const convert = require('convert-units'); // конвертер

// конверт градусов из К в цельсия
function getTemp(temp) {
  return Math.round(convert(temp).from('K').to('C'));
}

// конверт градусов в направление верта
function getDirection(angle) {
  const directions = ['С', 'СЗ', 'З', 'ЮЗ', 'Ю', 'ЮВ', 'В', 'СВ'];
  return directions[Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8];
}

// pressure hPa in mmHg
function convertPressure(pressure) {
  const res = Math.round(pressure * 0.750062);
  return res;
}

// from ms to date
function convertDate(dt) {
  return new Date(dt * 1000).toLocaleDateString();
}

// погода на день
function getDayWeather(day) {
  const date = convertDate(day.dt);
  const resTempDay = getTemp(day.temp.day);
  const resTempFeelsDay = getTemp(day.feels_like.day);
  const resTempNigth = getTemp(day.temp.nigth);
  const resTempFeelsNigth = getTemp(day.feels_like.nigth);
  const resPressure = convertPressure(day.pressure);
  const windDirection = getDirection(day.wind_deg);
  return `⚡ ⚡ ⚡\n${date}\nНа улице ${day.weather[0].description}\nТемпература днем ${resTempDay}°C. Ощущается как ${resTempFeelsDay}°C\nДавление ${resPressure} мм рт.ст.\nВлажность ${day.humidity}%\nВетер ${day.wind_speed} м/с ${windDirection} направления`;
}

// погода на данный момент
function getCurrentWeather(res) {
  const { temp, feels_like, pressure, humidity } = res.main;
  const { description } = res.weather[0];
  const { speed, deg } = res.wind;
  const date = convertDate(res.dt);
  const resTemp = getTemp(temp);
  const resTempFeels = getTemp(feels_like);
  const resPressure = convertPressure(pressure);
  const windDirection = getDirection(deg);
  return `⭐ ⭐ ⭐\nСегодня ${date}\nСейчас на улице ${description}\nТемпература ${resTemp}°C\nОщущается как ${resTempFeels}°C\nДавление ${resPressure} мм рт.ст.\nВлажность ${humidity}%\nВетер ${speed} м/с ${windDirection} направления`;
}

const errorMessage =
  'Наблюдаются временные технические неполдаки. Просим прощения за доставленные неудобства';

const mainKeyboard = [
  'Погода на неделю',
  'Погода на данный момент',
  'Настоить уведомления',
  'Изменить геолокацию',
];

module.exports = {
  getDayWeather,
  getCurrentWeather,
  errorMessage,
  mainKeyboard,
};
