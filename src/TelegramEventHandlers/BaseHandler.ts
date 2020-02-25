import {
  KeyboardButton,
  Message,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  SendMessageOptions
} from 'node-telegram-bot-api';

import LosTelegramBot from '../LosTelegramBot';
import I18n from '../I18n';

export default class BaseHandler {
  /**
   * Used by different handlers to get back to start of the process
   *
   * @param chatId
   * @param message
   */
  static answerWithStartFromBeginning (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('general.fromTheStart');

    const replyMarkup: ReplyKeyboardRemove = {
      remove_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  /**
   * Used by different handlers to get back to start of the process
   *
   * @param chatId
   * @param message
   */
  static answerWithNoChange (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('general.notRecognized');

    const messageOptions: SendMessageOptions = {
      parse_mode: 'Markdown'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static answerWithSectionsMenu (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('LocationHandler.menu');

    const surpriseMeButton: KeyboardButton = { text: I18n.t('LocationHandler.buttons.i_feel_lucky.text') };
    const sections: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.kitchens.text') },
      { text: I18n.t('LocationHandler.buttons.categories.text') }
    ];

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [
        [ surpriseMeButton ],
        sections
      ],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static getRepeatOrRestartMarkup (): ReplyKeyboardMarkup {
    const buttons: KeyboardButton[] = [
      { text: I18n.t('BaseHandler.buttons.repeat.text') },
      { text: I18n.t('BaseHandler.buttons.restart.text') }
    ];

    return {
      keyboard: [ buttons ],
      resize_keyboard: true
    } as ReplyKeyboardMarkup;
  }
}
