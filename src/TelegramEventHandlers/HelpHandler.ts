import { Message } from 'node-telegram-bot-api';

import UserStateInterface from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';
import LosLogger from '../LosLogger';

const logger = LosLogger.child({ module: 'HelpHandler' });

export default class HelpHandler {
  static async handle (msg: Message): Promise<Message> {
    logger.info('/start command received.');

    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    logger.info(`Retrieved user state from Redis (typeof ${ typeof userState }), 
      last updated: ${ Math.round(Date.now() / 1000) - (userState.lastUpdated ? userState.lastUpdated : 0) } seconds ago`);

    return UserStateManager.answerWithStartFromBeginning(msg.chat.id, 'Help is not supported yet');
  }
}
