import {
  KeyboardButton,
  Message,
  ReplyKeyboardMarkup,
  SendMessageOptions,
  User
} from 'node-telegram-bot-api';

import UserStateInterface from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';
import LosTelegramBot from '../LosTelegramBot';
import BaseHandler from './BaseHandler';
import Logger from '../Logger';
import I18n from '../I18n';
import UserProfileManager from '../UserProfile/UserProfileManager';
import { SUPPORTED_CITIES, USER_STATES } from '../Constants';
import UserProfileInterface from '../UserProfile/UserProfileInterface';
import Amplitude, { AMPLITUDE_EVENTS } from '../Amplitude/Amplitude';

export default class StartHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const user: User = UserProfileManager.getUserFromMessage(msg);

    await Amplitude.logEvent(user.id, AMPLITUDE_EVENTS.USER_SELECTED_START);

    const logger = Logger.child({ module: 'StartHandler', userId: user.id });

    logger.info(`/start command received. User name: ${ user.first_name }, ${ user.last_name }, User id: ${ user.id }, username: ${ user.username }`);

    const userState: UserStateInterface = {
      currentState: USER_STATES.WAIT_FOR_LOCATION
    } as UserStateInterface;

    await UserStateManager.updateUserState(user.id, userState);

    const userProfile: UserProfileInterface = {
      tgUserId: user.id,
      tgUserChatId: msg.chat.id,
      tgIsBot: user.is_bot,
      tgFirstName: user.first_name,
      tgLastName: user.last_name,
      tgUsername: user.username,
      tgLanguageCode: user.language_code,
      currentCity: SUPPORTED_CITIES.OTHER
    };

    await UserProfileManager.updateUserProfile(user.id, userProfile);

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

    const sendLocationCity: KeyboardButton[] = [
        { text: I18n.t('StartHandler.buttons.locations.sendLocationOdesa.text') },
        { text: I18n.t('StartHandler.buttons.locations.sendLocationOther.text') }
    ];

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [ sendLocationCity ],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    Amplitude.flush();

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
