import TelegramBot, { Message, User } from 'node-telegram-bot-api';

import LosTelegramBot from '../LosTelegramBot';
import UserStateInterface, { SUPPORTED_CITIES, USER_STATES } from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';
import LosLogger from '../LosLogger';

const logger = LosLogger.child({ module: 'StartHandler' });

export default class StartHandler {
  static async handle (msg: Message): Promise<TelegramBot.Message> {
    const user: User | undefined = msg.from;

    if (user === undefined) return LosTelegramBot.sendMessage(msg.chat.id, "We've got some issue retrieving your user ID...");

    logger.info(`/start command received. User name: ${ user.first_name }, ${ user.last_name }, User id: ${ user.id }, username: ${ user.username }`);

    const userState = {
      currentState: USER_STATES.WAIT_FOR_LOCATION,
      currentCity: SUPPORTED_CITIES.UNKNOWN,
      lastUpdated: Math.round(Date.now() / 1000)
    } as UserStateInterface;

    await UserStateManager.updateUserState(user.id, userState);

    return UserStateManager.answerWithWaitForLocation(msg.chat.id);
  }
}
