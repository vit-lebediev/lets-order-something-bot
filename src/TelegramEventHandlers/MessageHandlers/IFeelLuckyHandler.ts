import { Message, ReplyKeyboardMarkup, SendMessageOptions } from 'node-telegram-bot-api';
import { Collection } from 'mongodb';
import { BaseLogger } from 'pino';

import BaseHandler from '../BaseHandler';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import LosMongoClient, { PLACES_COLLECTION } from '../../LosMongoClient';
import I18n from '../../I18n';
import LosTelegramBot from '../../LosTelegramBot';
import { SECTIONS, SUPPORTED_CITIES, USER_STATES } from '../../Constants';
import UserProfileInterface from '../../UserProfile/UserProfileInterface';
import UserProfileManager from '../../UserProfile/UserProfileManager';
import Amplitude, { AMPLITUDE_EVENTS } from '../../Amplitude/Amplitude';

export default class IFeelLuckyHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);
    const userProfile: UserProfileInterface = await UserProfileManager.getUserProfile(msg);

    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:IFeelLuckyHandler', userId: userState.userId });

    const places: any[] = await IFeelLuckyHandler.getRandomPlace(userProfile.currentCity);

    if (places.length === 0) {
      throw new Error(`No places stored for the city! ${ userProfile.currentCity }`);
    }

    const place = places.pop();

    await Amplitude.logEvent(userState.userId, AMPLITUDE_EVENTS.USER_SELECTED_I_FEEL_LUCKY, {
      placeName: place.name,
      placeId: place.num_id
    });

    userState.currentState = USER_STATES.WAIT_FOR_REPEAT_OR_RESTART;
    userState.lastSection = SECTIONS.LUCKY;
    await UserStateManager.updateUserState(userState.userId, userState);

    logger.info(`Random place selected: ${ place.name }`);

    return IFeelLuckyHandler.answerWithRandomPlace(userProfile.tgUserId, msg.chat.id, place);
  }

  static getRandomPlace (currentUserCity: SUPPORTED_CITIES | undefined): Promise<any[]> {
    // @ts-ignore
    const placesCollection: Collection = LosMongoClient.dbHandler.collection(PLACES_COLLECTION);

    return placesCollection.aggregate([
        {
          $match: {
            city: currentUserCity
          }
        },
        { $sample: { size: 1 } } // @see https://stackoverflow.com/a/33578506/852399
    ]).toArray();
  }

  static async answerWithRandomPlace (userId: number, chatId: number, place: any): Promise<Message> {
    const redirectUUIDKey = await this.storeRedirectData(userId, place.num_id, 0, place.url);
    const verifiedMessage: string = `${ I18n.t('IFeelLuckyHandler.found') }\n\n${ BaseHandler.parsePlaceTemplate(place, redirectUUIDKey) }`;

    const replyMarkup: ReplyKeyboardMarkup = BaseHandler.getRepeatOrRestartMarkup(true, I18n.t('LocationHandler.buttons.i_feel_lucky.emoji'));

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };

    Amplitude.flush();

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
