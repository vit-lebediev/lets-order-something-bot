import { Message, ReplyKeyboardMarkup, SendMessageOptions } from 'node-telegram-bot-api';
import { Collection } from 'mongodb';
import { BaseLogger } from 'pino';
import i18n from 'i18n';

import BaseHandler from '../BaseHandler';
import UserStateInterface, { SECTIONS, SUPPORTED_CITIES, USER_STATES } from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import LosMongoClient from '../../LosMongoClient';
import I18n from '../../I18n';
import LosTelegramBot from '../../LosTelegramBot';

import Replacements = i18n.Replacements;

export default class IFeelLuckyHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:IFeelLuckyHandler', userId: userState.userId });

    const place: any = await IFeelLuckyHandler.getRandomPlace(userState.currentCity);

    userState.currentState = USER_STATES.WAIT_FOR_REPEAT_OR_RESTART;
    userState.lastSection = SECTIONS.LUCKY;
    await UserStateManager.updateUserState(userState.userId, userState);

    logger.info(`Random place selected: ${ place[0].name }`);

    return IFeelLuckyHandler.answerWithRandomPlace(msg.chat.id, place[0]);
  }

  static getRandomPlace (currentUserCity: SUPPORTED_CITIES | undefined): Promise<any[]> {
    // @ts-ignore
    const placesCollection: Collection = LosMongoClient.dbHandler.collection('places');

    return placesCollection.aggregate([
      {
        $match: {
          city: currentUserCity
        }
      },
      { $sample: { size: 1 } } // @see https://stackoverflow.com/a/33578506/852399
    ]).toArray();
  }

  static answerWithRandomPlace (chatId: number, place: any): Promise<Message> {
    let verifiedMessage: string = `${ I18n.t('IFeelLuckyHandler.found') }\n\n`;

    const placeCategories: string = place.kitchens ? place.kitchens.map(
      (kitchen: string) => I18n.t(`SectionHandler.buttons.kitchens.${ kitchen.toLowerCase() }.emoji`)
    ).join(' ') : '';

    const replacements: Replacements = { name: place.name, url: place.url, categories: placeCategories };
    verifiedMessage += I18n.t('FoodCategoryHandler.placeTemplate', replacements);

    const replyMarkup: ReplyKeyboardMarkup = BaseHandler.getRepeatOrRestartMarkup();

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
