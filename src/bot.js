const TelegramBot = require('node-telegram-bot-api');
const bunyan = require('bunyan');

const { ADMIN, TOKEN } = process.env;
const bot = new TelegramBot(TOKEN, { polling: true });
const log = bunyan.createLogger({
  name: "BOT"
});
const EVENTS = {
  start: 'start',
  get: 'get'
};


module.exports = class TelegramProvider {
  #models;

  constructor(sequelize) {
    this.#models = sequelize.sequelize.models;
  }

  async generateLink(chatId) {
    // const hours = 1;
    // const date1 = new Date();
    // const dateToMilliseconds = date1.getTime();
    // const addedHours = dateToMilliseconds + (3600000 * hours);
    // const newDate = new Date(addedHours).getTime();
    const link = await bot.createChatInviteLink(chatId, undefined, undefined, 1);

    return link;
  }

  async subscribe() {
    log.info('bot subscribed');
    bot.onText(/\/zilpay (.+)/, async (msg, match) => {
      if (msg.from.username !== ADMIN) return;

      const chatId = msg.chat.id;
      const member = await bot.getChatMember(chatId, msg.from.id);
      const resp = match[1];

      if (member.status !== 'creator') {
        return;
      }

      switch (resp) {
        case EVENTS.start:
          this.#onCreate(chatId);
          break;
        case EVENTS.get:
          this.#getChat(chatId);
          break;
        default:
          break;
      }
    });
    bot.on('message', async (msg) => {
      if (msg.new_chat_members) {
        const chatId = msg.chat.id;

        for (const member of msg.new_chat_members) {
          const { is_bot, first_name, id } = member;
          const user = await models.User.findOne({
            name: first_name
          });

          if (is_bot || !user) {
            // await bot.banChatMember(chatId, id);
            await bot.kickChatMember(chatId, id);
            log.info(`killed: ${first_name}, id: ${id}, is_bot: ${is_bot}, link: ${user ? user.link : null}`);
            continue;
          }
        }
      }
    });
  }

  async #onCreate(chatId) {
    const chat = await bot.getChat(chatId);

    if (!chat.permissions.can_invite_users) {
      log.warn(`chatId: ${chatId}, title: ${chat.title}, doesn't allow create invite: ${chat.permissions.can_invite_users}`);
      bot.sendMessage(chatId, `doesn't allow create invite`);
      return;
    }

    try {
      const dbChat = await this.#models.Chat.create({
        title: chat.title,
        chatId: chat.id,
        allowed: chat.permissions.can_invite_users
      });
  
      log.info(`chatId: ${chatId}, title: ${chat.title}, id: ${dbChat.uuid}`);
      bot.sendMessage(chatId, 'started');
    } catch (err) {
      bot.sendMessage(chatId, err.message);
      log.error(`chatId: ${chatId}, title: "${chat.title}"`, err);
    }
  }

  async #getChat(chatId) {
    try {
      const chat = await this.#models.Chat.findOne({
        chatId
      });

      if (!chat) {
        log.error(`chatId: ${chatId}, not found`);
        bot.sendMessage(chatId, `not found`);
        return;
      }
  
      bot.sendMessage(chatId, `uuid:(${chat.uuid})`);
    } catch (err) {
      log.error(`chatId: ${chatId}, title: ${chat.title}`, err);
    }
  }
}
