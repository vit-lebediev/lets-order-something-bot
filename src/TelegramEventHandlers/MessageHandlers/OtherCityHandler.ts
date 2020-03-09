import {
  Message,
  ReplyKeyboardRemove,
  SendMessageOptions
} from 'node-telegram-bot-api';
import { BaseLogger } from 'pino';
import { Collection } from 'mongodb';

import LosMongoClient from '../../LosMongoClient';
import LosTelegramBot from '../../LosTelegramBot';
import BaseHandler from '../BaseHandler';
import I18n from '../../I18n';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import { USER_STATES } from '../../Constants';
import StartHandler from '../StartHandler';

export default class OtherCityHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);
    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:OtherCityHandler', userId: userState.userId });

    logger.info(`User entered '${ msg.text }' city.`);

    // @ts-ignore
    const otherCitiesCollection: Collection = LosMongoClient.dbHandler.collection('otherCities');
    await otherCitiesCollection.updateOne(
        { userTgId: userState.userId },
        { $set: { userTgId: userState.userId, city: msg.text } },
        { upsert: true }
    );

    logger.info(`Save city '${ msg.text }' for user '${ userState.userId }' to db.otherCities`);

    userState.currentState = USER_STATES.WAIT_FOR_LOCATION;
    await UserStateManager.updateUserState(userState.userId, userState);

    return StartHandler.answerWithWaitForLocation(msg.chat.id);
  }
}
