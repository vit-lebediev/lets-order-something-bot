import {
  KeyboardButton, Message,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  SendMessageOptions, User
} from 'node-telegram-bot-api';

import UserStateInterface, { SUPPORTED_CITIES } from './UserStateInterface';
import LosRedisClient from '../LosRedisClient';
import LosTelegramBot from '../LosTelegramBot';
import LosLogger from '../LosLogger';

const logger = LosLogger.child({ module: 'UserStateManagerHandler' });

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
      currentState: parseInt(obj.currentState, 10),
      currentCity: parseInt(obj.currentCity, 10),
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
        return SUPPORTED_CITIES.ODESSA;
      default:
        return null;
    }
  }

  static answerWithWaitForLocation (chatId: number, message?: string): Promise<Message> {
    // Respond with a message and keyboard
    const verifiedMessage: string = message || "Great! Let's start. First things first, I'll need your location to only show you places around you.";

    const sendLocationButton: KeyboardButton = { text: '📍 Send my Location', request_location: true };

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [[ sendLocationButton ]],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static answerWithStartFromBeginning (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || 'Start from the start';

    const replyMarkup: ReplyKeyboardRemove = {
      remove_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static answerWithFoodCategoriesMenu (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || "Good! What kind of food you're up to?";

    const surpriseMeButton: KeyboardButton = { text: '🐙 Surprise me!' };
    const firstRowOfCategories: KeyboardButton[] = [
      { text: '🍣 Sushi' }, { text: '🍕 Pizza' }, { text: '🥡 Wok' }
    ];

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [[ surpriseMeButton ], firstRowOfCategories ],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
