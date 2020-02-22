import TelegramBot, { Message } from 'node-telegram-bot-api';

import LosTelegramBot from '../LosTelegramBot';

export default class SettingsHandler {
  static handle (msg: Message): Promise<TelegramBot.Message> {
    return LosTelegramBot.sendMessage(msg.chat.id, 'Settings currently are not supported. TBD.');
  }
}
