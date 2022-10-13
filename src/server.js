const bunyan = require('bunyan');
const assert = require('node:assert/strict');
const express = require('express');
const TelegramProvider = require('./bot');
const verifySignature = require('./verify-signature');
const sequelize = require('../models');
const { fromBech32Address } = require('@zilliqa-js/crypto');
const fs = require('fs');
const bodyParser = require('body-parser');

const { PORT } = process.env;
const port = PORT ?? 3000;
const app = express();
const { models } = sequelize.sequelize;
const bot = new TelegramProvider(sequelize);
const log = bunyan.createLogger({
  name: "SERVER"
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (_, res) => {
  const html = fs.readFileSync(__dirname + '/index.html');
  res.send(html.toString());
});


app.post('/create', async (req, res) => {
  try {
    const {
      uuid,
      message,
      publicKey,
      signature,
      bech32
    } = req.body;
    const base16 = fromBech32Address(bech32).toLowerCase();

    assert(uuid, 'uuid is required');
    assert(message, 'message is required');
    assert(publicKey, 'publicKey is required');
    assert(signature, 'signature is required');
    assert(bech32, 'bech32 is required');

    const balance = await models.State.findOne({
      base16
    });
    const chat = await models.Chat.findOne({
      uuid
    });

    assert(balance, 'This address balance is zero');
    assert(chat, 'Incorrect uuid, cannot find a Chat');

    const verify = verifySignature(
      message,
      publicKey,
      signature,
      base16
    );

    assert(verify, 'Signature verify failed');

    const user = await models.User.findOne({
      base16,
      name: message
    });

    if (user) {
      return res.json({
        link: user.link
      });
    }

    const link = await bot.generateLink(chat.chatId);

    if (!user) {
      await models.User.create({
        base16,
        name: message,
        link: link.invite_link
      });
    }

    return res.json({
      link: link.invite_link
    });
  } catch (err) {
    log.error(err);
    return res.json({
      error: {
        message: err.message
      }
    });
  }
});


(function(){
  bot.subscribe();
  app.listen(port, () => {
    log.info('listen on', port);
  });
}());
