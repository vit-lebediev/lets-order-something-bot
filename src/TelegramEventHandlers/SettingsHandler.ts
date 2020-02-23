import { Message } from 'node-telegram-bot-api';

import LosTelegramBot from '../LosTelegramBot';

export default class SettingsHandler {
  static handle (msg: Message): Promise<Message> {
    return LosTelegramBot.sendMessage(msg.chat.id, 'Settings currently are not supported. TBD.');
  }
}
