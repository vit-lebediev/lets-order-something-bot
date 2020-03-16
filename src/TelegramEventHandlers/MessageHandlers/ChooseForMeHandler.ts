import {
  KeyboardButton,
  Message,
  ReplyKeyboardMarkup,
  SendMessageOptions
} from 'node-telegram-bot-api';

import { BaseLogger } from 'pino';

import I18n from '../../I18n';
import BaseHandler from '../BaseHandler';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import { USER_STATES } from '../../Constants';
import LosTelegramBot from '../../LosTelegramBot';

import Amplitude, { AMPLITUDE_EVENTS } from '../../Amplitude/Amplitude';

export default class ChooseForMeHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);
    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:ChooseForMeHandler', userId: userState.userId });

    if (msg.text === I18n.t('ChooseForMeHandler.buttons.chooseSelectMenu.text')) {
      logger.info('User selected go to select Menu.');
      await Amplitude.logEvent(userState.userId, AMPLITUDE_EVENTS.USER_SELECTED_GOTO_MENU);
      userState.currentState = USER_STATES.WAIT_FOR_SECTION;
      await UserStateManager.updateUserState(userState.userId, userState);

      return BaseHandler.answerWithSectionsMenu(msg.chat.id);
    }
    logger.info('User read selected place');

    return ChooseForMeHandler.answerWithBtn(msg.chat.id);
  }

  static answerWithBtnGoToSectionsMenu (
      chatId: number,
      places: any[],
      repeatSymbol?: string
  ): Promise<Message> {
    let verifiedMessage: string = `${ I18n.t('ChooseForMeHandler.messageInfo') }\n\n`;

    for (let i = 0; i < places.length; i += 1) {
      verifiedMessage += `${ i + 1 }. ${ BaseHandler.parsePlaceTemplate(places[i], repeatSymbol) }\n`;
    }

    const chooseSelectMenuButton: KeyboardButton = { text: I18n.t('ChooseForMeHandler.buttons.chooseSelectMenu.text') };
    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [
          [ chooseSelectMenuButton ]
      ],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };

    Amplitude.flush();

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static answerWithBtn (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('ChooseForMeHandler.messageInfo');

    const chooseSelectMenuButton: KeyboardButton = { text: I18n.t('ChooseForMeHandler.buttons.chooseSelectMenu.text') };

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [
          [ chooseSelectMenuButton ]
      ],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
