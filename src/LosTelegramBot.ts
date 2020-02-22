// Init TelegramBot
import TelegramBot from 'node-telegram-bot-api';

const { LOS_BOT_TG_TOKEN } = process.env;

if (!LOS_BOT_TG_TOKEN) {
  throw new Error('You HAVE to run a bot with LOS_BOT_TG_TOKEN env var set!');
}

export default new TelegramBot(LOS_BOT_TG_TOKEN, { polling: true });
