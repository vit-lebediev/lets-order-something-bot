import { Message } from 'node-telegram-bot-api';

import ResponseManager from '../ResponseManager';

export default class SettingsHandler {
  static handle (msg: Message): Promise<Message> {
    return ResponseManager.answerWithStartFromBeginning(msg.chat.id, 'Settings currently are not supported. TBD.');
  }
}
