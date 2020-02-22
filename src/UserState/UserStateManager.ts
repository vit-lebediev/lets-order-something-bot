import TelegramBot, {
  KeyboardButton,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  SendMessageOptions
} from 'node-telegram-bot-api';
import UserStateInterface from './UserStateInterface';
import LosRedisClient from '../LosRedisClient';

export default class UserStateManager {
  redisClient: LosRedisClient;

  LOSBot: TelegramBot;

  constructor (redisClient: LosRedisClient, LOSBot: TelegramBot) {
    this.redisClient = redisClient;
    this.LOSBot = LOSBot;
  }

  async getUserState (userId: number): Promise<UserStateInterface> {
    const userRedisKey = `${ userId }_userState`;

    const obj = await this.redisClient.hgetallAsync(userRedisKey);

    if (!obj.currentState) return Promise.resolve({} as UserStateInterface);

    const userState: UserStateInterface = {
      currentState: obj.currentState as unknown as number,
      currentCity: obj.currentCity as unknown as number,
      lastUpdated: obj.lastUpdated as unknown as number
    };

    return Promise.resolve(userState);
  }

  async updateUserState (userId: number, newUserState: UserStateInterface): Promise<boolean> {
    // get user state from REDIS by user id
    const currUserState: UserStateInterface | null = await this.getUserState(userId);
    const userRedisKey = `${ userId }_userState`;
    // if not present, just set it
    if (currUserState === null) {
      console.log(`Storing user state in Redis with key ${ userRedisKey }`);
      // @ts-ignore TODO
      await this.redisClient.hmsetAsync(userRedisKey, newUserState);
    }

    // TODO if present, update fields which are set by userState param, including null, but excluding all undefined props
    // save to redis

    return Promise.resolve(true);
  }

  answerWithWaitForLocation (chatId: number, message?: string): Promise<TelegramBot.Message> {
    // Respond with a message and keyboard
    const verifiedMessage: string = message || "Great! Let's start. First things first, I'll need your location to only show you places around you.";

    const firstButton: KeyboardButton = { text: '📍 Send my Location', request_location: true };

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [[ firstButton ]],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup
    };

    return this.LOSBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  answerWithStartFromBeginning (chatId: number, message?: string): Promise<TelegramBot.Message> {
    const verifiedMessage: string = message || 'Start from the start';

    const replyMarkup: ReplyKeyboardRemove = {
      remove_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup
    };

    return this.LOSBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
