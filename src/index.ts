// eslint-disable-next-line no-unused-vars
import TelegramBot, { SendMessageOptions, KeyboardButton, ReplyKeyboardMarkup } from 'node-telegram-bot-api';

const { BOT_TOKEN } = process.env;

if (!BOT_TOKEN) {
  throw new Error('You HAVE to run a bot with BOT_TOKEN env var set!');
}

const LOSBot = new TelegramBot(BOT_TOKEN, { polling: true });

LOSBot.onText(/^\/start/, (msg) => {
  // eslint-disable-next-line camelcase, no-console
  console.log(`/start command received. User name: ${ msg.from?.first_name }, ${ msg.from?.last_name }, User id: ${ msg.from?.id }, username: ${ msg.from?.username }`);

  const firstButton: KeyboardButton = { text: 'Simple button' };

  const replyMarkup: ReplyKeyboardMarkup = {
    keyboard: [[ firstButton ]]
  };

  const messageOptions: SendMessageOptions = {
    reply_markup: replyMarkup
  };

  return LOSBot.sendMessage(msg.chat.id, 'Let\' start this PAR-TEY!', messageOptions);
});

LOSBot.onText(/^\/help/, (msg) => LOSBot.sendMessage(msg.chat.id, 'Help is not supported yet'));

LOSBot.onText(/^\/settings/, (msg) => LOSBot.sendMessage(msg.chat.id, 'Settings currently are not supported. TBD.'));
