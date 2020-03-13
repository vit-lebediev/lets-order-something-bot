import { Message } from 'node-telegram-bot-api';
import { Collection } from 'mongodb';
import i18n from 'i18n';
import { BaseLogger } from 'pino';

import BaseHandler from '../BaseHandler';
import LosMongoClient, { PLACES_COLLECTION } from '../../LosMongoClient';
import I18n from '../../I18n';
import {
  DEFAULT_NUMBER_OF_ANSWERS,
  FOOD_CATEGORIES,
  SECTIONS,
  SUPPORTED_CITIES,
  USER_STATES
} from '../../Constants';
import Logger from '../../Logger';
import LosTelegramBot from '../../LosTelegramBot';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import RepeatOrRestartHandler from './RepeatOrRestartHandler';
import UserProfileInterface from '../../UserProfile/UserProfileInterface';
import UserProfileManager from '../../UserProfile/UserProfileManager';
import Amplitude, { AMPLITUDE_EVENTS } from '../../Amplitude/Amplitude';

import Replacements = i18n.Replacements;

export default class FoodCategoryHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);
    const userProfile: UserProfileInterface = await UserProfileManager.getUserProfile(msg);

    if (!userProfile.currentCity) {
      // TODO redirect to location request
      throw new Error('User current City is not set');
    }

    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:FoodCategoryHandler', userId: userState.userId });

    let category: FOOD_CATEGORIES;

    switch (msg.text) {
      case I18n.t('SectionHandler.buttons.foods.random.text'): category = FOOD_CATEGORIES.RANDOM; break;

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

      case I18n.t('BaseHandler.buttons.restart.text'):
      default:
        logger.info("User selected 'restart'");

        return RepeatOrRestartHandler.handleRestart(msg);
    }

    logger.info(`User selected '${ msg.text }' category, mapped to ${ category }. Searching in '${ I18n.t(`cities.${ userProfile.currentCity }`) }' city`);

    await Amplitude.logEvent(userState.userId, AMPLITUDE_EVENTS.USER_SELECTED_FOOD, {
      foodCategory: category
    });

    userState.currentState = USER_STATES.WAIT_FOR_REPEAT_OR_RESTART;
    userState.lastSection = SECTIONS.FOOD;
    userState.lastCategory = category;
    await UserStateManager.updateUserState(userState.userId, userState);

    const repeatSymbol: string = I18n.t(`SectionHandler.buttons.foods.${ category.toLowerCase() }.emoji`);

    if (category === FOOD_CATEGORIES.RANDOM) {
      // get random kitchen category
      // @see https://stackblitz.com/edit/typescript-random-enum-value
      const foodCategoryKeys: string[] = Object.keys(FOOD_CATEGORIES);
      // in our ENUMs, key === enum value, so we can randomly select a key
      while (category === FOOD_CATEGORIES.RANDOM) category = foodCategoryKeys[Math.floor(Math.random() * foodCategoryKeys.length)] as FOOD_CATEGORIES;
    }

    await FoodCategoryHandler.answerWithSearchingForCategory(msg.chat.id, category);

    const places = await FoodCategoryHandler.getRandomPlacesForCategory(category, userProfile.currentCity);
    const totalPlacesNumber = await FoodCategoryHandler.getNumberOfPlacesInCategory(category, userProfile.currentCity);

    logger.info(`${ places.length } places randomly selected (of ${ totalPlacesNumber }): ${ places.map((item: any) => item.name).join(', ') }`);

    return BaseHandler.answerWithPlacesToOrder(msg.chat.id, places, totalPlacesNumber, repeatSymbol);
  }

  static async getRandomPlacesForAllCategories (currentUserCity: SUPPORTED_CITIES | undefined): Promise<any[]> {
    // @ts-ignore
    const placesCollection: Collection = LosMongoClient.dbHandler.collection(PLACES_COLLECTION);

    return placesCollection.aggregate([
        {
          $match: {
            city: currentUserCity
          }
        },
        { $sample: { size: DEFAULT_NUMBER_OF_ANSWERS } } // @see https://stackoverflow.com/a/33578506/852399
    ]).toArray();
  }

  static async getRandomPlacesForCategory (category: FOOD_CATEGORIES, currentUserCity: SUPPORTED_CITIES): Promise<any[]> {
    // @ts-ignore
    const placesCollection: Collection = LosMongoClient.dbHandler.collection(PLACES_COLLECTION);

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

  static async getNumberOfPlacesInCategory (category: FOOD_CATEGORIES, currentUserCity: SUPPORTED_CITIES): Promise<number> {
    // @ts-ignore
    const placesCollection: Collection = LosMongoClient.dbHandler.collection(PLACES_COLLECTION);

    return placesCollection.countDocuments({
      categories: {
        $elemMatch: { $eq: category }
      },
      city: currentUserCity
    });
  }

  static answerWithSearchingForCategory (chatId: number, foodCategory: string): Promise<Message> {
    const replacements: Replacements = { foodCat: I18n.t(`SectionHandler.buttons.foods.${ foodCategory.toLowerCase() }.text`) };

    return LosTelegramBot.sendMessage(chatId, I18n.t('FoodCategoryHandler.searchingForFoodCategory', replacements));
  }
}
