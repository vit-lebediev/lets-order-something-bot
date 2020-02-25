import { Message, ReplyKeyboardMarkup, SendMessageOptions } from 'node-telegram-bot-api';
import { Collection } from 'mongodb';
import { BaseLogger } from 'pino';
import i18n from 'i18n';

import BaseHandler from '../BaseHandler';
import UserStateInterface, { SECTIONS, SUPPORTED_CITIES, USER_STATES } from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import { KITCHEN_CATEGORIES } from '../../Constants';
import I18n from '../../I18n';
import LosTelegramBot from '../../LosTelegramBot';
import LosMongoClient from '../../LosMongoClient';

import Replacements = i18n.Replacements;
import RepeatOrRestartHandler from './RepeatOrRestartHandler';

const DEFAULT_NUMBER_OF_ANSWERS = 3;

export default class KitchenHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:KitchenHandler', userId: userState.userId });

    let kitchen: KITCHEN_CATEGORIES;

    switch (msg.text) {
      case I18n.t('SectionHandler.buttons.kitchens.random.text'): kitchen = KITCHEN_CATEGORIES.RANDOM; break;

      case I18n.t('SectionHandler.buttons.kitchens.homey.text'): kitchen = KITCHEN_CATEGORIES.HOMEY; break;
      case I18n.t('SectionHandler.buttons.kitchens.ukrainian.text'): kitchen = KITCHEN_CATEGORIES.UKRAINIAN; break;
      case I18n.t('SectionHandler.buttons.kitchens.east.text'): kitchen = KITCHEN_CATEGORIES.EAST; break;
      case I18n.t('SectionHandler.buttons.kitchens.italian.text'): kitchen = KITCHEN_CATEGORIES.ITALIAN; break;
      case I18n.t('SectionHandler.buttons.kitchens.european.text'): kitchen = KITCHEN_CATEGORIES.EUROPEAN; break;
      case I18n.t('SectionHandler.buttons.kitchens.american.text'): kitchen = KITCHEN_CATEGORIES.AMERICAN; break;
      case I18n.t('SectionHandler.buttons.kitchens.japanese.text'): kitchen = KITCHEN_CATEGORIES.JAPANESE; break;
      case I18n.t('SectionHandler.buttons.kitchens.chinese.text'): kitchen = KITCHEN_CATEGORIES.CHINESE; break;
      case I18n.t('SectionHandler.buttons.kitchens.korean.text'): kitchen = KITCHEN_CATEGORIES.KOREAN; break;
      case I18n.t('SectionHandler.buttons.kitchens.georgian.text'): kitchen = KITCHEN_CATEGORIES.GEORGIAN; break;
      case I18n.t('SectionHandler.buttons.kitchens.thai.text'): kitchen = KITCHEN_CATEGORIES.THAI; break;
      case I18n.t('SectionHandler.buttons.kitchens.mexican.text'): kitchen = KITCHEN_CATEGORIES.MEXICAN; break;

      case I18n.t('BaseHandler.buttons.restart.text'):
      default:
        logger.info("User selected 'restart'");

        return RepeatOrRestartHandler.handleRestart(msg);
    }

    logger.info(`User selected '${ msg.text }' kitchen, mapped to ${ kitchen }. Searching in '${ I18n.t(`cities.${ userState.currentCity }`) }' city`);

    userState.currentState = USER_STATES.WAIT_FOR_REPEAT_OR_RESTART;
    userState.lastSection = SECTIONS.KITCHEN;
    userState.lastCategory = kitchen;
    await UserStateManager.updateUserState(userState.userId, userState);

    if (kitchen === KITCHEN_CATEGORIES.RANDOM) {
      // get random kitchen category
      // @see https://stackblitz.com/edit/typescript-random-enum-value
      const kitchenCategoryKeys: string[] = Object.keys(KITCHEN_CATEGORIES);
      // in our ENUMs, key === enum value
      kitchen = kitchenCategoryKeys[Math.floor(Math.random() * kitchenCategoryKeys.length)] as KITCHEN_CATEGORIES;

      // await KitchenHandler.answerWithSearchingForRandomKitchen(msg.chat.id);
    }

    await KitchenHandler.answerWithSearchingForKitchen(msg.chat.id, kitchen);

    const places = await KitchenHandler.getRandomPlacesForKitchen(kitchen, userState.currentCity);

    logger.info(`${ places.length } places randomly selected: ${ places.map((item) => item.name).join(', ') }`);

    return KitchenHandler.answerWithPlacesToOrder(msg.chat.id, places);
  }

  static getRandomPlacesForKitchen (kitchen: KITCHEN_CATEGORIES, currentUserCity: SUPPORTED_CITIES | undefined): Promise<any[]> {
    // @ts-ignore
    const placesCollection: Collection = LosMongoClient.dbHandler.collection('places');

    return placesCollection.aggregate([
      {
        $match: {
          kitchens: {
            $elemMatch: { $eq: kitchen }
          },
          city: currentUserCity
        }
      },
      { $sample: { size: DEFAULT_NUMBER_OF_ANSWERS } } // @see https://stackoverflow.com/a/33578506/852399
    ]).toArray();
  }

  static answerWithSearchingForRandomKitchen (chatId: number): Promise<Message> {
    return LosTelegramBot.sendMessage(chatId, I18n.t('KitchenHandler.searchingForRandom'));
  }

  static answerWithSearchingForKitchen (chatId: number, kitchen: string): Promise<Message> {
    const replacements: Replacements = { kitchen: I18n.t(`SectionHandler.buttons.kitchens.${ kitchen.toLowerCase() }.text`) };

    return LosTelegramBot.sendMessage(chatId, I18n.t('KitchenHandler.searchingForKitchen', replacements));
  }

  static answerWithPlacesToOrder (chatId: number, places: any[]): Promise<Message> {
    let verifiedMessage: string = `${ I18n.t('FoodCategoryHandler.found') }\n\n`;

    for (let i = 0; i < places.length; i += 1) {
      const place = places[i];
      const kitchenCategories = place.kitchens ? place.kitchens.map(
        (kitchen: string) => I18n.t(`SectionHandler.buttons.kitchens.${ kitchen.toLowerCase() }.emoji`)
      ).join(' ') : '';
      const replacements: Replacements = { name: place.name, url: place.url, categories: kitchenCategories };
      verifiedMessage += `${ i + 1 }. ${ I18n.t('FoodCategoryHandler.placeTemplate', replacements) }\n`;
    }

    const replyMarkup: ReplyKeyboardMarkup = BaseHandler.getRepeatOrRestartMarkup();

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
