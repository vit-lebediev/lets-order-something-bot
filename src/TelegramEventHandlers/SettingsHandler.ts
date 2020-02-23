import { Message } from 'node-telegram-bot-api';

import ResponseManager from '../ResponseManager';
import I18n from '../I18n';

export default class SettingsHandler {
  static handle (msg: Message): Promise<Message> {
    return ResponseManager.answerWithStartFromBeginning(msg.chat.id, I18n.t('SettingsHandler.notSupported'));
  }
}
