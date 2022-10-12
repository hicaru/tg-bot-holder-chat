const TelegramBot = require('node-telegram-bot-api');
const bunyan = require('bunyan');

const { ADMIN, TOKEN } = process.env;
const bot = new TelegramBot(TOKEN, { polling: true });
const log = bunyan.createLogger({
  name: "BOT"
});
const EVENTS = {
  bot: 'bot'
};


module.exports = class TelegramProvider {
  #models;

  constructor(sequelize) {
    this.#models = sequelize.sequelize.models;
  }

  async generateLink(chatId) {
    chatId = `@${chatId}`;

    const hours = 1;
    const date1 = new Date();
    const dateToMilliseconds = date1.getTime();
    const addedHours = dateToMilliseconds + (3600000 * hours);
    const newDate = new Date(addedHours);
    const link = await bot.createChatInviteLink(chatId, undefined, newDate.getTime(), 1);

    return link;
  }

  async subscribe() {
    log.info('bot subscribed');
    bot.onText(/\/start (.+)/, (msg, match) => {
      if (msg.from.username !== ADMIN) return;

      const chatId = msg.chat.id;
      const resp = match[1];

      switch (resp) {
        case EVENTS.bot:
          this.onCreate(chatId);
          break;
        default:
          break;
      }
    });
  }

  async onCreate(chatId) {
    const chat = await bot.getChat(chatId);

    if (!chat.permissions.can_invite_users) {
      log.warn(`chatId: ${chatId}, title: ${chat.title}, doesn't allow create invite: ${chat.permissions.can_invite_users}`);
      bot.sendMessage(chatId, `doesn't allow create invite`);
      return;
    }

    await this.#models.Chat.build({
      title: chat.title,
      chatId: chat.id,
      allowed: chat.permissions.can_invite_users
    });
    log.info(`chatId: ${chatId}, title: ${chat.title}, allowed: ${chat.permissions.can_invite_users} start bot`);
    bot.sendMessage(chatId, 'started');
  }
}
