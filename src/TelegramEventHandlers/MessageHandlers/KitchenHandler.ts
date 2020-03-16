import { Message } from 'node-telegram-bot-api';
import { Collection } from 'mongodb';
import { BaseLogger } from 'pino';
import i18n from 'i18n';

import BaseHandler from '../BaseHandler';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import {
  DEFAULT_NUMBER_OF_ANSWERS,
  KITCHEN_CATEGORIES,
  SECTIONS,
  SUPPORTED_CITIES,
  USER_STATES
} from '../../Constants';
import I18n from '../../I18n';
import LosTelegramBot from '../../LosTelegramBot';
import LosMongoClient from '../../LosMongoClient';
import RepeatOrRestartHandler from './RepeatOrRestartHandler';
import UserProfileInterface from '../../UserProfile/UserProfileInterface';
import UserProfileManager from '../../UserProfile/UserProfileManager';
import Amplitude, { AMPLITUDE_EVENTS } from '../../Amplitude/Amplitude';
import Util from '../../Util';

import Replacements = i18n.Replacements;

const PLACES_COLLECTION = 'places';

export default class KitchenHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);
    const userProfile: UserProfileInterface = await UserProfileManager.getUserProfile(msg);

    if (!userProfile.currentCity) {
      // TODO redirect to location request
      throw new Error('User current City is not set');
    }

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
        logger.info("User selected 'restart'");
        return RepeatOrRestartHandler.handleRestart(msg);

      default:
        return LosTelegramBot.sendMessage(msg.chat.id, I18n.t('general.unrecognizedCommand'));
    }

    logger.info(`User selected '${ msg.text }' kitchen, mapped to ${ kitchen }. Searching in '${ I18n.t(`cities.${ userProfile.currentCity }`) }' city`);

    await Amplitude.logEvent(userState.userId, AMPLITUDE_EVENTS.USER_SELECTED_KITCHEN, {
      kitchenCategory: kitchen
    });

    userState.currentState = USER_STATES.WAIT_FOR_REPEAT_OR_RESTART;
    userState.lastSection = SECTIONS.KITCHEN;
    userState.lastCategory = kitchen;
    await UserStateManager.updateUserState(userState.userId, userState);

    const repeatSymbol: string = I18n.t(`SectionHandler.buttons.kitchens.${ kitchen.toLowerCase() }.emoji`);

    if (kitchen === KITCHEN_CATEGORIES.RANDOM) {
      // get random kitchen category
      // @see https://stackblitz.com/edit/typescript-random-enum-value
      const kitchenCategoryKeys: string[] = Object.keys(KITCHEN_CATEGORIES);
      // in our ENUMs, key === enum value, so we can randomly select a key
      while (kitchen === KITCHEN_CATEGORIES.RANDOM) kitchen = kitchenCategoryKeys[Math.floor(Math.random() * kitchenCategoryKeys.length)] as KITCHEN_CATEGORIES;
    }

    await KitchenHandler.answerWithSearchingForKitchen(msg.chat.id, kitchen);

    const places = await KitchenHandler.getRandomPlacesForKitchen(kitchen, userProfile.currentCity);
    const totalPlacesNumber = await KitchenHandler.getNumberOfPlacesInCategory(kitchen, userProfile.currentCity);

    logger.info(`${ places.length } places randomly selected (of ${ totalPlacesNumber }): ${ places.map((item) => item.name).join(', ') }`);

    await Util.wait(1.4);

    return BaseHandler.answerWithPlacesToOrder(userProfile.tgUserId, msg.chat.id, places, msg.text, totalPlacesNumber, repeatSymbol);
  }

  static getRandomPlacesForKitchen (kitchen: KITCHEN_CATEGORIES, currentUserCity: SUPPORTED_CITIES): Promise<any[]> {
    // @ts-ignore
    const placesCollection: Collection = LosMongoClient.dbHandler.collection(PLACES_COLLECTION);

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

  static async getNumberOfPlacesInCategory (kitchen: KITCHEN_CATEGORIES, currentUserCity: SUPPORTED_CITIES): Promise<number> {
    // @ts-ignore
    const placesCollection: Collection = LosMongoClient.dbHandler.collection(PLACES_COLLECTION);

    return placesCollection.countDocuments({
      kitchens: {
        $elemMatch: { $eq: kitchen }
      },
      city: currentUserCity
    });
  }

  static answerWithSearchingForKitchen (chatId: number, kitchen: string): Promise<Message> {
    const replacements: Replacements = { kitchen: I18n.t(`SectionHandler.buttons.kitchens.${ kitchen.toLowerCase() }.text`) };

    return LosTelegramBot.sendMessage(chatId, I18n.t('KitchenHandler.searchingForKitchen', replacements));
  }
}
