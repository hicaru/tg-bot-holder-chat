const TelegramBot = require('node-telegram-bot-api');


export class TelegramBot {
  #token = '';

  get token() {
    return this.#token;
  }

  constructor(token) {
    this.#token = token;
  }

  async generateLink(chatId) {
    const chatId = msg.chat.id;
    const hours = 1;
    const date1 = new Date();
    const dateToMilliseconds = date1.getTime();
    const addedHours = dateToMilliseconds + (3600000 * hours);
    const newDate = new Date(addedHours);
    const link = await bot.createChatInviteLink(chatId, undefined, newDate.getTime(), 1);

    return link;
  }
}
