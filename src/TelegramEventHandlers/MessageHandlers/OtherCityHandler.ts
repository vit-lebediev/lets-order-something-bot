import { Message } from 'node-telegram-bot-api';
import { BaseLogger } from 'pino';
import { Collection } from 'mongodb';
import i18n from 'i18n';

import LosMongoClient, { OTHER_CITIES_COLLECTION } from '../../LosMongoClient';
import Logger from '../../Logger';
import BaseHandler from '../BaseHandler';
import StartHandler from '../StartHandler';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import { USER_STATES } from '../../Constants';
import I18n from '../../I18n';
import Amplitude, { AMPLITUDE_EVENTS } from '../../Amplitude/Amplitude';

import Replacements = i18n.Replacements;

export default class OtherCityHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);
    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:OtherCityHandler', userId: userState.userId });

    logger.info(`User entered '${ msg.text }' city.`);

    // @ts-ignore
    const otherCitiesCollection: Collection = LosMongoClient.dbHandler.collection(OTHER_CITIES_COLLECTION);
    await otherCitiesCollection.updateOne(
        { tgUserId: userState.userId },
        { $set: { tgUserId: userState.userId, city: msg.text } },
        { upsert: true }
    );

    logger.info(`Saved city '${ msg.text }' for user '${ userState.userId }' to db.${ OTHER_CITIES_COLLECTION }`);

    await Amplitude.logEvent(userState.userId, AMPLITUDE_EVENTS.USER_ENTERED_OTHER_CITY, {
      cityText: msg.text
    });

    userState.currentState = USER_STATES.WAIT_FOR_LOCATION;
    await UserStateManager.updateUserState(userState.userId, userState);

    return StartHandler.answerWithWaitForLocation(msg.chat.id, I18n.t('OtherCityHandler.thankYou', { city: msg.text } as Replacements));
  }
}
