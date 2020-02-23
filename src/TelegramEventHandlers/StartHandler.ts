import { Message, User } from 'node-telegram-bot-api';

import UserStateInterface, { SUPPORTED_CITIES, USER_STATES } from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';
import ResponseManager from '../ResponseManager';
import Logger from '../Logger';

const logger = Logger.child({ module: 'StartHandler' });

export default class StartHandler {
  static async handle (msg: Message): Promise<Message> {
    const user: User = UserStateManager.getUserFromMessage(msg);

    logger.info(`/start command received. User name: ${ user.first_name }, ${ user.last_name }, User id: ${ user.id }, username: ${ user.username }`);

    const userState: UserStateInterface = {
      currentState: USER_STATES.WAIT_FOR_LOCATION,
      currentCity: SUPPORTED_CITIES.UNKNOWN,
      lastUpdated: Math.round(Date.now() / 1000)
    } as UserStateInterface;

    await UserStateManager.updateUserState(user.id, userState);

    return ResponseManager.answerWithWaitForLocation(msg.chat.id);
  }
}
