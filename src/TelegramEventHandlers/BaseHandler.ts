import {
  KeyboardButton,
  Message,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  SendMessageOptions
} from 'node-telegram-bot-api';
import i18n from 'i18n';

import LosTelegramBot from '../LosTelegramBot';
import I18n from '../I18n';

import Replacements = i18n.Replacements;

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

  static answerWithPlacesToOrder (chatId: number, places: any[], repeatSymbol?: string): Promise<Message> {
    let verifiedMessage: string = `${ I18n.t('FoodCategoryHandler.found') }\n\n`;

    for (let i = 0; i < places.length; i += 1) {
      const place = places[i];

      const kitchenCategories = place.kitchens ? place.kitchens.map(
        (kitchen: string) => I18n.t(`SectionHandler.buttons.kitchens.${ kitchen.toLowerCase() }.emoji`)
      ).join(' ') : '';

      const foodCategories = place.categories ? place.categories.map(
        (foodCat: string) => I18n.t(`SectionHandler.buttons.foods.${ foodCat.toLowerCase() }.emoji`)
      ).join(' ') : '';

      const replacements: Replacements = {
        name: place.name,
        url: place.url,
        kitchens: kitchenCategories,
        categories: foodCategories
      };

      verifiedMessage += `${ i + 1 }. ${ I18n.t('FoodCategoryHandler.placeTemplate', replacements) }\n`;
    }

    const replyMarkup: ReplyKeyboardMarkup = BaseHandler.getRepeatOrRestartMarkup(repeatSymbol);

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static getRepeatOrRestartMarkup (repeatSymbol?: string): ReplyKeyboardMarkup {
    const verifiedRepeatSymbol = repeatSymbol || I18n.t('BaseHandler.buttons.repeat');
    const replacements: Replacements = { repeatSymbol: verifiedRepeatSymbol };

    const buttons: KeyboardButton[] = [
      { text: I18n.t('BaseHandler.buttons.repeat.text', replacements) },
      { text: I18n.t('BaseHandler.buttons.restart.text') }
    ];

    return {
      keyboard: [ buttons ],
      resize_keyboard: true
    } as ReplyKeyboardMarkup;
  }
}
