const mongoose = require('mongoose');

module.exports = mongoose.model('User', {
  userid: String,
  location: Object,
  notificationTime: String,
});
