import { Message, User } from 'node-telegram-bot-api';

import UserStateInterface, { SUPPORTED_CITIES, USER_STATES } from './UserStateInterface';
import LosRedisClient from '../LosRedisClient';
import Logger from '../Logger';

const logger = Logger.child({ module: 'UserStateManagerHandler' });

const CITY_STRING_ODESA = 'Odesa';

export default class UserStateManager {
  /**
   * Returns user state, stored in Redis, by user id.
   *
   * @param {number} userId
   * @throws Error
   */
  static async getUserStateById (userId: number): Promise<UserStateInterface | null> {
    const userRedisKey = `${ userId }_userState`;

    const obj = await LosRedisClient.hgetallAsync(userRedisKey);

    if (!obj.currentState) return Promise.resolve(null);

    const userState: UserStateInterface = {
      currentState: obj.currentState as USER_STATES,
      currentCity: obj.currentCity as SUPPORTED_CITIES,
      lastUpdated: parseInt(obj.lastUpdated, 10)
    };

    return Promise.resolve(userState);
  }

  /**
   * Returns user state, extracting user id from Telegram Message.
   * Guarantees to return userState, or throw an error.
   *
   * @param {TelegramBot.Message} msg
   * @throws Error
   */
  static async getUserState (msg: Message): Promise<UserStateInterface> {
    const user: User = UserStateManager.getUserFromMessage(msg);

    const userState: UserStateInterface | null = await UserStateManager.getUserStateById(user.id);

    if (userState === null) {
      throw new Error('User state is not set');
    }

    return Promise.resolve(userState);
  }

  /**
   * Stores new user state by id in Redis, updating 'lastUpdate' field before that.
   *
   * @param {number} userId
   * @param {UserStateInterface} newUserState
   */
  static async updateUserState (userId: number, newUserState: UserStateInterface): Promise<boolean> {
    const userRedisKey = `${ userId }_userState`;

    const updatedUserState: UserStateInterface = newUserState;

    updatedUserState.lastUpdated = Math.round(Date.now() / 1000);

    logger.info(`Storing user state in Redis with key ${ userRedisKey }`);

    // @ts-ignore TODO
    await LosRedisClient.hmsetAsync(userRedisKey, updatedUserState);

    return Promise.resolve(true);
  }

  static getUserFromMessage (msg: Message): User {
    const user: User | undefined = msg.from;

    if (user === undefined) throw new Error("User is not found in message 'from' field");

    return user;
  }

  static getCityFromString (city: string | undefined): SUPPORTED_CITIES | null {
    switch (city) {
      case CITY_STRING_ODESA:
        return SUPPORTED_CITIES.ODESA;
      default:
        return null;
    }
  }
}
