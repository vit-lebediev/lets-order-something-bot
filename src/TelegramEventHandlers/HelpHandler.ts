import { Message, User } from 'node-telegram-bot-api';

import BaseHandler from './BaseHandler';
import Logger from '../Logger';
import I18n from '../I18n';
import UserProfileManager from '../UserProfile/UserProfileManager';
import Amplitude, { AMPLITUDE_EVENTS } from '../Amplitude/Amplitude';

export default class HelpHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const user: User = UserProfileManager.getUserFromMessage(msg);

    const logger = Logger.child({ module: 'HelpHandler', userId: user.id });

    logger.info('/help command received.');

    await Amplitude.logEvent(user.id, AMPLITUDE_EVENTS.USER_SELECTED_HELP);

    return BaseHandler.answerWithStartFromBeginning(msg.chat.id, I18n.t('HelpHandler.text'));
  }
}
