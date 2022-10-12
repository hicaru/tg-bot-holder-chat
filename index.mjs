import { config } from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';


config();

const token = process.env.TOKEN;
const bot = new TelegramBot(token, {
  polling: true
});

// bot.createChatInviteLink // create privete link.
// bot.banChatMember
// bot.kickChatMember

bot.onText(/\/echo (.+)/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const chatId = msg.chat.id;
  const hours = 1;
  const date1 = new Date();
  const dateToMilliseconds = date1.getTime();
  const addedHours = dateToMilliseconds + (3600000 * hours);
  const newDate = new Date(addedHours);

  const link = await bot.createChatInviteLink(chatId, undefined, newDate.getTime(), 1);

  console.log(link);

  bot.revokeChatInviteLink

  bot.sendMessage(chatId, `link: ${link.invite_link}`);
});

// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   console.log(msg);
//   const hours = 1;
//   const date1 = new Date();
//   const dateToMilliseconds = date1.getTime();
//   const addedHours = dateToMilliseconds + (3600000 * hours);
//   const newDate = new Date(addedHours);

//   const link = await bot.createChatInviteLink(chatId, 'Test', newDate.getTime(), 1);

//   console.log(link);

//   bot.sendMessage(chatId, `link: ${link.invite_link}, name: ${link.name}`);
// });
