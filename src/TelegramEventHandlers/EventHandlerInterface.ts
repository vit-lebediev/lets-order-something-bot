import TelegramBot, { Message } from 'node-telegram-bot-api';

export default interface EventHandlerInterface {
  handle (msg: Message): Promise<TelegramBot.Message>; // static
} // eslint-disable-line semi
