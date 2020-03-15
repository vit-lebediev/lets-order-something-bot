import { Message } from 'node-telegram-bot-api';

import UserStateInterface from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';
import BaseHandler from './BaseHandler';
import Logger from '../Logger';
import I18n from '../I18n';

const logger = Logger.child({ module: 'HelpHandler' });

export default class HelpHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    logger.info('/start command received.');

    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    logger.info(`Retrieved user state from Redis (typeof ${ typeof userState }), 
      last updated: ${ Math.round(Date.now() / 1000) - (userState.lastUpdated ? userState.lastUpdated : 0) } seconds ago`);

    return BaseHandler.answerWithStartFromBeginning(msg.chat.id, I18n.t('HelpHandler.text'));
  }
}
