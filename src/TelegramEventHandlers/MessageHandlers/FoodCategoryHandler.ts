import { Message, SendMessageOptions } from 'node-telegram-bot-api';
import { Collection } from 'mongodb';
import i18n from 'i18n';

import BaseHandler from '../BaseHandler';
import LosMongoClient from '../../LosMongoClient';
import I18n from '../../I18n';
import { FOOD_CATEGORIES } from '../../Constants';
import Logger from '../../Logger';
import LosTelegramBot from '../../LosTelegramBot';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';

import Replacements = i18n.Replacements;

export default class FoodCategoryHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    await FoodCategoryHandler.answerWithSearching(msg.chat.id);

    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    const logger = Logger.child({ module: 'MessageHandler:FoodCategoryHandler', userId: userState.userId});

    let category: FOOD_CATEGORIES;

    switch (msg.text) {
      case I18n.t('LocationHandler.buttons.sushi'): category = FOOD_CATEGORIES.SUSHI; break;
      case I18n.t('LocationHandler.buttons.pizza'): category = FOOD_CATEGORIES.PIZZA; break;
      case I18n.t('LocationHandler.buttons.shawerma'): category = FOOD_CATEGORIES.SHAWERMA; break;
      case I18n.t('LocationHandler.buttons.veg'): category = FOOD_CATEGORIES.VEGETARIAN; break;
      case I18n.t('LocationHandler.buttons.noodles'): category = FOOD_CATEGORIES.NOODLES_N_RICE; break;
      case I18n.t('LocationHandler.buttons.homey'): category = FOOD_CATEGORIES.HOMEY; break;
      case I18n.t('LocationHandler.buttons.bhs'): category = FOOD_CATEGORIES.BURGERS_N_HOTDOGS_N_SANDWICHES; break;
      case I18n.t('LocationHandler.buttons.salads'): category = FOOD_CATEGORIES.SALADS; break;
      case I18n.t('LocationHandler.buttons.soups'): category = FOOD_CATEGORIES.SOUPS; break;
      case I18n.t('LocationHandler.buttons.pasta'): category = FOOD_CATEGORIES.PASTA; break;
      case I18n.t('LocationHandler.buttons.snacks'): category = FOOD_CATEGORIES.SNACKS; break;
      case I18n.t('LocationHandler.buttons.children'): category = FOOD_CATEGORIES.CHILDREN_MENU; break;
      case I18n.t('LocationHandler.buttons.chooseForMe'):
      default:
        // TODO Special case, handle separately
        category = FOOD_CATEGORIES.SUSHI; break;
    }

    logger.info(`User selected '${ msg.text }' category, mapped to ${ category }. Searching in '${ I18n.t(`cities.${ userState.currentCity }`) }' city`);

    // @ts-ignore
    const placesCollection: Collection = LosMongoClient.dbHandler.collection('places');

    // TODO $sample may output the same document more than once in its result set. For more information, see Cursor Isolation.
    //  @see https://docs.mongodb.com/master/reference/operator/aggregation/sample/#pipe._S_sample
    const places = await placesCollection.aggregate([
      {
        $match: {
          categories: {
            $elemMatch: { $eq: category }
          },
          city: userState.currentCity
        }
      },
      { $sample: { size: 5 } } // @see https://stackoverflow.com/a/33578506/852399
    ]).toArray();

    logger.info(`${ places.length } places randomly selected: ${ places.map((item) => item.name).join(', ') }`);

    // TODO move to next state

    return FoodCategoryHandler.answerWithPlacesToOrder(msg.chat.id, places);
  }

  static answerWithSearching (chatId: number): Promise<Message> {
    const verifiedMessage: string = I18n.t('FoodCategoryHandler.searching');

    return LosTelegramBot.sendMessage(chatId, verifiedMessage);
  }

  static answerWithPlacesToOrder (chatId: number, places: any[]): Promise<Message> {
    let verifiedMessage: string = `${ I18n.t('FoodCategoryHandler.found') }\n\n`;

    for (let i = 0; i < places.length; i += 1) {
      const place = places[i];
      verifiedMessage += `${ i + 1 }. ${ I18n.t('FoodCategoryHandler.placeTemplate', { name: place.name, url: place.url } as Replacements) }\n`;
    }

    const messageOptions: SendMessageOptions = {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
