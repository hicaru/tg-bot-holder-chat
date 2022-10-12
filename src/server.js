const bunyan = require('bunyan');
const express = require('express');
const TelegramProvider = require('./bot');
const sequelize = require('../models');

const { CHAT_ID, PORT } = process.env;
const port = PORT ?? 3000;
const app = express();
const bot = new TelegramProvider(sequelize);
const log = bunyan.createLogger({
  name: "SERVER"
});

app.get('/', async (req, res) => {
  try {
    const link = await bot.generateLink(CHAT_ID);
    res.json(link);
  } catch (err) {
    log.error(err);
    res.send(err);
  }
});


(function(){
  bot.subscribe();
  app.listen(port, () => {
    log.info('listen on', port);
  });
}());
