import TelegramBot, { Message, User } from 'node-telegram-bot-api';

import LosTelegramBot from '../LosTelegramBot';
import UserStateInterface from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';
import LosLogger from '../LosLogger';

const logger = LosLogger.child({ module: 'HelpHandler' });

export default class HelpHandler {
  static async handle (msg: Message): Promise<TelegramBot.Message> {
    const user: User | undefined = msg.from;

    if (user === undefined) return LosTelegramBot.sendMessage(msg.chat.id, "We've got some issue retrieving your user ID...");

    logger.info(`/start command received. User name: ${ user.first_name }, ${ user.last_name }, User id: ${ user.id }, username: ${ user.username }`);

    const userState: UserStateInterface | null = await UserStateManager.getUserState(user.id);

    logger.info(`Retrieved user state from Redis (typeof ${ typeof userState }), 
    last updated: ${ Math.round(Date.now() / 1000) - (userState.lastUpdated ? userState.lastUpdated : 0) } seconds ago`);

    return UserStateManager.answerWithStartFromBeginning(msg.chat.id, 'Help is not supported yet');
  }
}
