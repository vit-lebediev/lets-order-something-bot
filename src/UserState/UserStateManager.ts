import TelegramBot, {
  KeyboardButton,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  SendMessageOptions
} from 'node-telegram-bot-api';

import UserStateInterface, { SUPPORTED_CITIES } from './UserStateInterface';
import LosRedisClient from '../LosRedisClient';
import LosTelegramBot from '../LosTelegramBot';
import LosLogger from '../LosLogger';

const logger = LosLogger.child({ module: 'UserStateManagerHandler' });

const CITY_STRING_ODESA = 'Odesa';

export default class UserStateManager {
  static async getUserState (userId: number): Promise<UserStateInterface> {
    const userRedisKey = `${ userId }_userState`;

    const obj = await LosRedisClient.hgetallAsync(userRedisKey);

    if (!obj.currentState) return Promise.resolve({} as UserStateInterface);

    const userState: UserStateInterface = {
      currentState: parseInt(obj.currentState, 10),
      currentCity: parseInt(obj.currentCity, 10),
      lastUpdated: parseInt(obj.lastUpdated, 10)
    };

    return Promise.resolve(userState);
  }

  static async updateUserState (userId: number, newUserState: UserStateInterface): Promise<boolean> {
    const userRedisKey = `${ userId }_userState`;

    logger.info(`Storing user state in Redis with key ${ userRedisKey }`);
    // @ts-ignore TODO
    await LosRedisClient.hmsetAsync(userRedisKey, newUserState);

    return Promise.resolve(true);
  }

  static getCityFromString (city: string | undefined): SUPPORTED_CITIES | null {
    switch (city) {
      case CITY_STRING_ODESA:
        return SUPPORTED_CITIES.ODESSA;
      default:
        return null;
    }
  }

  static answerWithWaitForLocation (chatId: number, message?: string): Promise<TelegramBot.Message> {
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

  static answerWithStartFromBeginning (chatId: number, message?: string): Promise<TelegramBot.Message> {
    const verifiedMessage: string = message || 'Start from the start';

    const replyMarkup: ReplyKeyboardRemove = {
      remove_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static answerWithFoodCategoriesMenu (chatId: number, message?: string): Promise<TelegramBot.Message> {
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
