import { Message, SendMessageOptions } from 'node-telegram-bot-api';
import { Collection } from 'mongodb';
import i18n from 'i18n';
import { BaseLogger } from 'pino';

import BaseHandler from '../BaseHandler';
import LosMongoClient from '../../LosMongoClient';
import I18n from '../../I18n';
import { FOOD_CATEGORIES } from '../../Constants';
import Logger from '../../Logger';
import LosTelegramBot from '../../LosTelegramBot';
import UserStateInterface, { SUPPORTED_CITIES } from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';

import Replacements = i18n.Replacements;

const DEFAULT_NUMBER_OF_ANSWERS = 3;

export default class FoodCategoryHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:FoodCategoryHandler', userId: userState.userId });

    let category: FOOD_CATEGORIES;

    switch (msg.text) {
      case I18n.t('LocationHandler.buttons.sushi.text'): category = FOOD_CATEGORIES.SUSHI; break;
      case I18n.t('LocationHandler.buttons.pizza.text'): category = FOOD_CATEGORIES.PIZZA; break;
      case I18n.t('LocationHandler.buttons.shawerma.text'): category = FOOD_CATEGORIES.SHAWERMA; break;
      case I18n.t('LocationHandler.buttons.vegetarian.text'): category = FOOD_CATEGORIES.VEGETARIAN; break;
      case I18n.t('LocationHandler.buttons.noodles_n_rice.text'): category = FOOD_CATEGORIES.NOODLES_N_RICE; break;
      case I18n.t('LocationHandler.buttons.homey.text'): category = FOOD_CATEGORIES.HOMEY; break;
      case I18n.t('LocationHandler.buttons.burgers.text'): category = FOOD_CATEGORIES.BURGERS; break;
      case I18n.t('LocationHandler.buttons.hotdogs.text'): category = FOOD_CATEGORIES.HOTDOGS; break;
      case I18n.t('LocationHandler.buttons.sandwiches.text'): category = FOOD_CATEGORIES.SANDWICHES; break;
      case I18n.t('LocationHandler.buttons.salads.text'): category = FOOD_CATEGORIES.SALADS; break;
      case I18n.t('LocationHandler.buttons.soups.text'): category = FOOD_CATEGORIES.SOUPS; break;
      case I18n.t('LocationHandler.buttons.pasta.text'): category = FOOD_CATEGORIES.PASTA; break;
      case I18n.t('LocationHandler.buttons.snacks.text'): category = FOOD_CATEGORIES.SNACKS; break;
      case I18n.t('LocationHandler.buttons.desserts.text'): category = FOOD_CATEGORIES.DESSERTS; break;
      case I18n.t('LocationHandler.buttons.children_menu.text'): category = FOOD_CATEGORIES.CHILDREN_MENU; break;
      case I18n.t('LocationHandler.buttons.dont_know.text'):
      default:
        // TODO Special case, handle separately
        category = FOOD_CATEGORIES.DONT_KNOW; break;
    }

    logger.info(`User selected '${ msg.text }' category, mapped to ${ category }. Searching in '${ I18n.t(`cities.${ userState.currentCity }`) }' city`);

    let places: any[];

    if (category === FOOD_CATEGORIES.DONT_KNOW) {
      await FoodCategoryHandler.answerWithSearchingFoeAllCategories(msg.chat.id);
      places = await FoodCategoryHandler.getRandomPlacesForAllCategories(userState.currentCity);
    } else {
      await FoodCategoryHandler.answerWithSearchingForCategory(msg.chat.id);
      places = await FoodCategoryHandler.getRandomPlacesForCategory(category, userState.currentCity);
    }

    logger.info(`${ places.length } places randomly selected: ${ places.map((item) => item.name).join(', ') }`);

    // TODO move to next state

    return FoodCategoryHandler.answerWithPlacesToOrder(msg.chat.id, places);
  }

  static async getRandomPlacesForAllCategories (currentUserCity: SUPPORTED_CITIES | undefined): Promise<any[]> {
    // @ts-ignore
    const placesCollection: Collection = LosMongoClient.dbHandler.collection('places');

    return placesCollection.aggregate([
      {
        $match: {
          city: currentUserCity
        }
      },
      { $sample: { size: DEFAULT_NUMBER_OF_ANSWERS } } // @see https://stackoverflow.com/a/33578506/852399
    ]).toArray();
  }

  static async getRandomPlacesForCategory (category: FOOD_CATEGORIES, currentUserCity: SUPPORTED_CITIES | undefined): Promise<any[]> {
    // @ts-ignore
    const placesCollection: Collection = LosMongoClient.dbHandler.collection('places');

    // TODO $sample may output the same document more than once in its result set. For more information, see Cursor Isolation.
    //  @see https://docs.mongodb.com/master/reference/operator/aggregation/sample/#pipe._S_sample
    return placesCollection.aggregate([
      {
        $match: {
          categories: {
            $elemMatch: { $eq: category }
          },
          city: currentUserCity
        }
      },
      { $sample: { size: DEFAULT_NUMBER_OF_ANSWERS } } // @see https://stackoverflow.com/a/33578506/852399
    ]).toArray();
  }

  static answerWithSearchingFoeAllCategories (chatId: number): Promise<Message> {
    const verifiedMessage: string = I18n.t('FoodCategoryHandler.searchingForAll');

    return LosTelegramBot.sendMessage(chatId, verifiedMessage);
  }

  static answerWithSearchingForCategory (chatId: number): Promise<Message> {
    const verifiedMessage: string = I18n.t('FoodCategoryHandler.searching');

    return LosTelegramBot.sendMessage(chatId, verifiedMessage);
  }

  static answerWithPlacesToOrder (chatId: number, places: any[]): Promise<Message> {
    let verifiedMessage: string = `${ I18n.t('FoodCategoryHandler.found') }\n\n`;

    for (let i = 0; i < places.length; i += 1) {
      const place = places[i];
      const placeCategories = place.categories.map((cat: string) => I18n.t(`LocationHandler.buttons.${ cat.toLowerCase() }.emoji`)).join(' ');
      const replacements: Replacements = { name: place.name, url: place.url, categories: placeCategories };
      verifiedMessage += `${ i + 1 }. ${ I18n.t('FoodCategoryHandler.placeTemplate', replacements) }\n`;
    }

    const messageOptions: SendMessageOptions = {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
