import { Message, User } from 'node-telegram-bot-api';

import I18n from '../I18n';
import BaseHandler from './BaseHandler';
import Amplitude, { AMPLITUDE_EVENTS } from '../Amplitude/Amplitude';
import UserProfileManager from '../UserProfile/UserProfileManager';
import Logger from '../Logger';

export default class SettingsHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const user: User = UserProfileManager.getUserFromMessage(msg);

    const logger = Logger.child({ module: 'HelpHandler', userId: user.id });

    logger.info('/settings command received.');

    await Amplitude.logEvent(user.id, AMPLITUDE_EVENTS.USER_SELECTED_SETTINGS);

    return BaseHandler.answerWithStartFromBeginning(msg.chat.id, I18n.t('SettingsHandler.notSupported'));
  }
}
