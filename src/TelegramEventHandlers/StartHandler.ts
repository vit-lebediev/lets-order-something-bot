import {
  KeyboardButton,
  Message,
  ReplyKeyboardMarkup,
  SendMessageOptions,
  User
} from 'node-telegram-bot-api';

import UserStateInterface, { SUPPORTED_CITIES, USER_STATES } from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';
import LosTelegramBot from '../LosTelegramBot';
import BaseHandler from './BaseHandler';
import Logger from '../Logger';
import I18n from '../I18n';

const logger = Logger.child({ module: 'StartHandler' });

export default class StartHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const user: User = UserStateManager.getUserFromMessage(msg);

    logger.info(`/start command received. User name: ${ user.first_name }, ${ user.last_name }, User id: ${ user.id }, username: ${ user.username }`);

    const userState: UserStateInterface = {
      currentState: USER_STATES.WAIT_FOR_LOCATION,
      currentCity: SUPPORTED_CITIES.UNKNOWN,
      lastUpdated: Math.round(Date.now() / 1000)
    } as UserStateInterface;

    await UserStateManager.updateUserState(user.id, userState);

    return StartHandler.answerWithWaitForLocation(msg.chat.id);
  }

  /**
   * Used by StartHandler
   *
   * @param chatId
   * @param message
   */
  static answerWithWaitForLocation (chatId: number, message?: string): Promise<Message> {
    // Respond with a message and keyboard
    // const verifiedMessage: string = message || "Great! Let's start. First things first, I'll need your location to only show you places around you.";
    const verifiedMessage: string = message || I18n.t('StartHandler.start');

    const sendLocationButton: KeyboardButton = { text: I18n.t('StartHandler.buttons.sendLocation'), request_location: true };

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [[ sendLocationButton ]],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
