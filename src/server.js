const bunyan = require('bunyan');
const express = require('express');
const TelegramProvider = require('./bot');
const sequelize = require('../models');

const { CHAT_ID, PORT } = process.env;
const port = PORT ?? 3000;
const app = express();
const { models } = sequelize.sequelize;
const bot = new TelegramProvider(sequelize);
const log = bunyan.createLogger({
  name: "SERVER"
});

app.get('/chats', async (req, res) => {
  try {
    const chats = await models.Chat.findAll();

    res.json(chats);
  } catch (err) {
    log.error(err);
    res.send(err);
  }
});


app.get('/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const chat = await models.Chat.findOne({
      uuid: uuid
    });

    if (!chat) {
      return res.json({
        error: {
          message: 'Chat not found'
        }
      });
    }

    const link = await bot.generateLink(chat.chatId);

    delete link.creator;

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
