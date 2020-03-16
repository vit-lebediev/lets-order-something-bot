import {
  KeyboardButton,
  Message,
  ReplyKeyboardMarkup,
  SendMessageOptions
} from 'node-telegram-bot-api';
import i18n from 'i18n';

import LosTelegramBot from '../LosTelegramBot';
import Amplitude from '../Amplitude/Amplitude';
import I18n from '../I18n';
import Util from '../Util';
import LosRedisClient from '../LosRedisClient';

import Replacements = i18n.Replacements;

const uuid = require('uuid');

const { LOS_EXPRESS_HOST, LOS_EXPRESS_PORT } = process.env;

if (!LOS_EXPRESS_HOST || !LOS_EXPRESS_PORT) {
  throw new Error('LOS_EXPRESS_HOST and LOS_EXPRESS_PORT env vars need to be set');
}

export default class BaseHandler {
  /**
   * Used by different handlers to get back to start of the process
   *
   * @param chatId
   * @param message
   */
  static answerWithStartFromBeginning (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('general.fromTheStart');

    const messageOptions: SendMessageOptions = {
      parse_mode: 'Markdown'
    };

    Amplitude.flush();

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
    const replacements: Replacements = {
      IFeelLuckySection: I18n.t('LocationHandler.buttons.i_feel_lucky.text'),
      kitchenCategories: I18n.t('LocationHandler.buttons.kitchens.text'),
      foodCategories: I18n.t('LocationHandler.buttons.categories.text'),
      feedbackSection: I18n.t('LocationHandler.buttons.feedback.text')
    };
    const verifiedMessage: string = message || I18n.t('LocationHandler.menu', replacements);

    const surpriseMeButton: KeyboardButton = { text: I18n.t('LocationHandler.buttons.i_feel_lucky.text') };

    const sections: KeyboardButton[] = [
        { text: I18n.t('LocationHandler.buttons.kitchens.text') },
        { text: I18n.t('LocationHandler.buttons.categories.text') }
    ];

    const feedBackButton: KeyboardButton = { text: I18n.t('LocationHandler.buttons.feedback.text') };

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [
          [ surpriseMeButton ],
          sections,
          [ feedBackButton ]
      ],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    Amplitude.flush();

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static async answerWithPlacesToOrder (
      userId: number,
      chatId: number,
      places: any[],
      searchCategory: string,
      totalNumberOfPlaces: number,
      repeatSymbol?: string
  ): Promise<Message> {
    const foundText = I18n.t('FoodCategoryHandler.found', { searchCategory });

    let placesList = '';

    for (let i = 0; i < places.length; i += 1) {
      const place = places[i];

      // eslint-disable-next-line no-await-in-loop
      const redirectUUIDKey = await this.storeRedirectData(userId, place.num_id, i + 1, place.url);

      placesList += `${ i + 1 }. ${ BaseHandler.parsePlaceTemplate(places[i], redirectUUIDKey, repeatSymbol) }\n`;
    }

    const replacements: Replacements = { numberOfPlaces: totalNumberOfPlaces as unknown as string };
    const foundTextFollowup = I18n.t('FoodCategoryHandler.foundFollowup', replacements);

    // const verifiedMessage: string = `${ I18n.t('FoodCategoryHandler.found', replacements) }\n\n`;
    const verifiedMessage: string = `${ foundText }\n\n${ placesList }${ foundTextFollowup }`;

    const replyMarkup: ReplyKeyboardMarkup = BaseHandler.getRepeatOrRestartMarkup(repeatSymbol);

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };

    Amplitude.flush();

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static getRepeatOrRestartMarkup (repeatSymbol?: string): ReplyKeyboardMarkup {
    const verifiedRepeatSymbol = repeatSymbol || I18n.t('BaseHandler.buttons.repeat');
    const replacements: Replacements = { repeatSymbol: verifiedRepeatSymbol };

    const chooseForMe: KeyboardButton = { text: I18n.t('BaseHandler.buttons.chooseForMe.text') };
    const buttons: KeyboardButton[] = [
        { text: I18n.t('BaseHandler.buttons.repeat.text', replacements) },
        { text: I18n.t('BaseHandler.buttons.restart.text') }
    ];

    return {
      keyboard: [
          [ chooseForMe ],
          buttons
      ],
      resize_keyboard: true
    } as ReplyKeyboardMarkup;
  }

  static async storeRedirectData (userId: number, placeId: number, placePosition: number, placeUrl: string): Promise<string> {
    const redirectUUIDKey = uuid.v4();
    const redirectRedisKey = `redirect_${ redirectUUIDKey }`;

    const redirectDoc = {
      userId,
      placeId,
      placePosition,
      placeUrl
    };

    // @ts-ignore TODO fix this ts-ignore
    await LosRedisClient.hmsetAsync(redirectRedisKey, redirectDoc);
    await LosRedisClient.expireAsync(redirectRedisKey, 60 * 60 * 24); // expire in 24 hours

    return redirectUUIDKey;
  }

  static parsePlaceTemplate (place: any, redirectUUIDKey: string, repeatSymbol?: string): string {
    let kitchenCategoriesArray: string[] = place.kitchens ? place.kitchens.map(
        (kitchen: string) => I18n.t(`SectionHandler.buttons.kitchens.${ kitchen.toLowerCase() }.emoji`)
    ) : [];

    kitchenCategoriesArray = Util.shuffle(kitchenCategoriesArray);

    if (repeatSymbol) {
      const symbol: string[] = kitchenCategoriesArray.splice(kitchenCategoriesArray.indexOf(repeatSymbol), 1);

      if (symbol.length > 0) {
        kitchenCategoriesArray = symbol.concat(kitchenCategoriesArray);
      }
    }

    const kitchenCategories = kitchenCategoriesArray.join(' ');

    let foodCategoriesArray: string[] = place.categories ? place.categories.map(
        (foodCat: string) => I18n.t(`SectionHandler.buttons.foods.${ foodCat.toLowerCase() }.emoji`)
    ) : [];

    foodCategoriesArray = Util.shuffle(foodCategoriesArray);

    if (repeatSymbol) {
      const symbol: string[] = foodCategoriesArray.splice(foodCategoriesArray.indexOf(repeatSymbol), 1);

      if (symbol.length > 0) {
        foodCategoriesArray = symbol.concat(foodCategoriesArray);
      }
    }

    const foodCategories = foodCategoriesArray.join(' ');

    const losBotFullUrl = `http://${ LOS_EXPRESS_HOST }${ LOS_EXPRESS_PORT as unknown as number === 80 ? `:${ LOS_EXPRESS_PORT }` : '' }`;

    const replacements: Replacements = {
      name: place.name,
      url: `${ losBotFullUrl }/r?rid=${ redirectUUIDKey }`,
      kitchens: kitchenCategories,
      categories: foodCategories
    };

    return I18n.t('FoodCategoryHandler.placeTemplate', replacements);
  }
}
