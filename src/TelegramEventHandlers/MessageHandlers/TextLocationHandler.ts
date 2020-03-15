import { Message, ReplyKeyboardRemove, SendMessageOptions } from 'node-telegram-bot-api';
import { BaseLogger } from 'pino';

import BaseHandler from '../BaseHandler';
import I18n from '../../I18n';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import { SUPPORTED_CITIES, USER_STATES } from '../../Constants';
import LosTelegramBot from '../../LosTelegramBot';
import UserProfileInterface from '../../UserProfile/UserProfileInterface';
import UserProfileManager from '../../UserProfile/UserProfileManager';

export default class TextLocationHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);
    const userProfile: UserProfileInterface = await UserProfileManager.getUserProfile(msg);
    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:TextLocationHandler', userId: userState.userId });
    let city: SUPPORTED_CITIES = SUPPORTED_CITIES.OTHER;

    switch (msg.text) {
      case I18n.t('StartHandler.buttons.locations.sendLocationOdesa.text'): city = SUPPORTED_CITIES.ODESA; break;
      case I18n.t('StartHandler.buttons.locations.sendLocationOther.text'): city = SUPPORTED_CITIES.OTHER; break;
      default:
        logger.info('Error!!! not selected city');
    }

    logger.info(`User selected '${ msg.text }' city, mapped to ${ city }.`);

    if (city === SUPPORTED_CITIES.OTHER) {
      userState.currentState = USER_STATES.WAIT_FOR_TEXT_CITY_OTHER;
      await UserStateManager.updateUserState(userState.userId, userState);

      userProfile.currentCity = city;
      await UserProfileManager.updateUserProfile(userProfile.tgUserId, userProfile);

      return TextLocationHandler.answerWithPromptEnterCity(msg.chat.id);
    }

    userState.currentState = USER_STATES.WAIT_FOR_SECTION;
    await UserStateManager.updateUserState(userState.userId, userState);

    userProfile.currentCity = city;
    await UserProfileManager.updateUserProfile(userProfile.tgUserId, userProfile);

    return BaseHandler.answerWithSectionsMenu(msg.chat.id);
  }

  static answerWithPromptEnterCity (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('OtherCityHandler.inputPrompt');

    const replyMarkup: ReplyKeyboardRemove = {
      remove_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'HTML'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
