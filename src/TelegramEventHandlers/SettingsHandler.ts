import { Message } from 'node-telegram-bot-api';

import I18n from '../I18n';
import BaseHandler from './BaseHandler';

export default class SettingsHandler extends BaseHandler {
  static handle (msg: Message): Promise<Message> {
    return BaseHandler.answerWithStartFromBeginning(msg.chat.id, I18n.t('SettingsHandler.notSupported'));
  }
}
