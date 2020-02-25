import { Message, ReplyKeyboardMarkup, SendMessageOptions } from 'node-telegram-bot-api';
import { Collection } from 'mongodb';
import i18n from 'i18n';
import { BaseLogger } from 'pino';

import BaseHandler from '../BaseHandler';
import LosMongoClient from '../../LosMongoClient';
import I18n from '../../I18n';
import { FOOD_CATEGORIES } from '../../Constants';
import Logger from '../../Logger';
import LosTelegramBot from '../../LosTelegramBot';
import UserStateInterface, { SECTIONS, SUPPORTED_CITIES, USER_STATES } from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';

import Replacements = i18n.Replacements;

const DEFAULT_NUMBER_OF_ANSWERS = 3;

export default class FoodCategoryHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:FoodCategoryHandler', userId: userState.userId });

    let category: FOOD_CATEGORIES;

    switch (msg.text) {
      case I18n.t('SectionHandler.buttons.foods.sushi.text'): category = FOOD_CATEGORIES.SUSHI; break;
      case I18n.t('SectionHandler.buttons.foods.pizza.text'): category = FOOD_CATEGORIES.PIZZA; break;
      case I18n.t('SectionHandler.buttons.foods.shawerma.text'): category = FOOD_CATEGORIES.SHAWERMA; break;
      case I18n.t('SectionHandler.buttons.foods.vegetarian.text'): category = FOOD_CATEGORIES.VEGETARIAN; break;
      case I18n.t('SectionHandler.buttons.foods.noodles_n_rice.text'): category = FOOD_CATEGORIES.NOODLES_N_RICE; break;
      case I18n.t('SectionHandler.buttons.foods.homey.text'): category = FOOD_CATEGORIES.HOMEY; break;
      case I18n.t('SectionHandler.buttons.foods.burgers.text'): category = FOOD_CATEGORIES.BURGERS; break;
      case I18n.t('SectionHandler.buttons.foods.hotdogs.text'): category = FOOD_CATEGORIES.HOTDOGS; break;
      case I18n.t('SectionHandler.buttons.foods.sandwiches.text'): category = FOOD_CATEGORIES.SANDWICHES; break;
      case I18n.t('SectionHandler.buttons.foods.salads.text'): category = FOOD_CATEGORIES.SALADS; break;
      case I18n.t('SectionHandler.buttons.foods.soups.text'): category = FOOD_CATEGORIES.SOUPS; break;
      case I18n.t('SectionHandler.buttons.foods.pasta.text'): category = FOOD_CATEGORIES.PASTA; break;
      case I18n.t('SectionHandler.buttons.foods.snacks.text'): category = FOOD_CATEGORIES.SNACKS; break;
      case I18n.t('SectionHandler.buttons.foods.desserts.text'): category = FOOD_CATEGORIES.DESSERTS; break;
      case I18n.t('SectionHandler.buttons.foods.children_menu.text'): category = FOOD_CATEGORIES.CHILDREN_MENU; break;
      case I18n.t('SectionHandler.buttons.foods.dont_know.text'):
      default: category = FOOD_CATEGORIES.DONT_KNOW; break;
    }

    logger.info(`User selected '${ msg.text }' category, mapped to ${ category }. Searching in '${ I18n.t(`cities.${ userState.currentCity }`) }' city`);

    let places: any[];

    userState.currentState = USER_STATES.WAIT_FOR_REPEAT_OR_RESTART;
    userState.lastSection = SECTIONS.FOOD;
    userState.lastCategory = category;
    await UserStateManager.updateUserState(userState.userId, userState);

    if (category === FOOD_CATEGORIES.DONT_KNOW) {
      await FoodCategoryHandler.answerWithSearchingForAllCategories(msg.chat.id);
      places = await FoodCategoryHandler.getRandomPlacesForAllCategories(userState.currentCity);
    } else {
      await FoodCategoryHandler.answerWithSearchingForCategory(msg.chat.id);
      places = await FoodCategoryHandler.getRandomPlacesForCategory(category, userState.currentCity);
    }

    logger.info(`${ places.length } places randomly selected: ${ places.map((item) => item.name).join(', ') }`);

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

  static answerWithSearchingForAllCategories (chatId: number): Promise<Message> {
    return LosTelegramBot.sendMessage(chatId, I18n.t('FoodCategoryHandler.searchingForAll'));
  }

  static answerWithSearchingForCategory (chatId: number): Promise<Message> {
    return LosTelegramBot.sendMessage(chatId, I18n.t('FoodCategoryHandler.searching'));
  }

  static answerWithPlacesToOrder (chatId: number, places: any[]): Promise<Message> {
    let verifiedMessage: string = `${ I18n.t('FoodCategoryHandler.found') }\n\n`;

    for (let i = 0; i < places.length; i += 1) {
      const place = places[i];
      const placeCategories = place.kitchens ? place.categories.map(
        (cat: string) => I18n.t(`SectionHandler.buttons.foods.${ cat.toLowerCase() }.emoji`)
      ).join(' ') : '';
      const replacements: Replacements = { name: place.name, url: place.url, categories: placeCategories };
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
