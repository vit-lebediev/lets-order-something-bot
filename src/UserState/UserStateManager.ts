import { Message, User } from 'node-telegram-bot-api';

import UserStateInterface from './UserStateInterface';
import LosRedisClient from '../LosRedisClient';
import Logger from '../Logger';
import {
  FOOD_CATEGORIES,
  KITCHEN_CATEGORIES,
  SECTIONS,
  SUPPORTED_CITIES,
  USER_STATES
} from '../Constants';
import UserProfileManager from '../UserProfile/UserProfileManager';

const CITY_STRING_ODESA = 'Odesa';
// const CITY_STRING_KYIV = 'Kyiv';

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

    if (!obj || !obj.currentState) return null;

    return {
      userId,
      currentState: obj.currentState as USER_STATES,
      lastSection: obj.lastSection as SECTIONS,
      lastCategory: obj.lastCategory as KITCHEN_CATEGORIES | FOOD_CATEGORIES,
      lastUpdated: parseInt(obj.lastUpdated, 10)
    } as UserStateInterface;
  }

  /**
   * Returns user state, extracting user id from Telegram Message.
   * Guarantees to return userState, or throw an error.
   *
   * @param {TelegramBot.Message} msg
   * @throws Error
   */
  static async getUserState (msg: Message): Promise<UserStateInterface> {
    const user: User = UserProfileManager.getUserFromMessage(msg);

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

    const logger = Logger.child({ module: 'UserStateManagerHandler', userId });

    logger.info(`Storing user state in Redis with key ${ userRedisKey }`);

    // @ts-ignore TODO fix this ts-ignore
    await LosRedisClient.hmsetAsync(userRedisKey, updatedUserState);
    await LosRedisClient.expireAsync(userRedisKey, 60 * 60 * 24); // expire in 24 hours

    return Promise.resolve(true);
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
