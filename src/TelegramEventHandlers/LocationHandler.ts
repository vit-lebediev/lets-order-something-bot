// Dependency imports
import { Message, User } from 'node-telegram-bot-api';
import NodeGeocoder, {
  Entry,
  Geocoder,
  Location,
  Options
} from 'node-geocoder';

// Projects imports
import i18n from 'i18n';
import LosTelegramBot from '../LosTelegramBot';
import UserStateInterface from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';
import BaseHandler from './BaseHandler';
import Logger from '../Logger';
import I18n from '../I18n';
import { SUPPORTED_CITIES, USER_STATES } from '../Constants';

import Replacements = i18n.Replacements;

const logger = Logger.child({ module: 'LocationHandler' });

const { LOS_BOT_OC_TOKEN } = process.env;

if (LOS_BOT_OC_TOKEN === undefined) {
  throw new Error('You need to set LOS_BOT_OC_TOKEN env var');
}

// init Geocoder
const geocoderOptions: Options = {
  provider: 'opencage',
  apiKey: LOS_BOT_OC_TOKEN,
  formatter: null
};

const geocoderClient: Geocoder = NodeGeocoder(geocoderOptions);

export default class LocationHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const user: User = UserStateManager.getUserFromMessage(msg);

    logger.info(`/location command received. User name: ${ user.first_name }, ${ user.last_name }, User id: ${ user.id }, username: ${ user.username }`);

    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    // verify we're in a proper state for this event...
    if (userState.currentState !== USER_STATES.WAIT_FOR_LOCATION) {
      logger.warn(`User state mismatch: current state ${ userState.currentState } !== ${ USER_STATES.WAIT_FOR_LOCATION }`);
      return BaseHandler.answerWithStartFromBeginning(msg.chat.id);
    }

    logger.info('Querying for a city by coordinates...');

    if (msg.location === undefined) return LosTelegramBot.sendMessage(msg.chat.id, I18n.t('LocationHandler.errorGeocoding'));

    const requestLocation: Location = {
      lat: msg.location.latitude,
      lon: msg.location.longitude
    };

    const placeAtLocation: Entry[] = await geocoderClient.reverse(requestLocation);

    // check if user city is supported
    const userCityString: string | undefined = placeAtLocation[0].city;
    logger.info(`User city de-Geocoded: ${ userCityString }`);
    const userCity: SUPPORTED_CITIES | null = UserStateManager.getCityFromString(userCityString);

    if (userCity === null) {
      logger.warn('User city not supported');
      return BaseHandler.answerWithStartFromBeginning(
          msg.chat.id,
          I18n.t('LocationHandler.errorCityNotSupported', { city: userCityString } as Replacements)
      );
    }

    // update user state
    userState.currentCity = userCity;
    userState.currentState = USER_STATES.WAIT_FOR_SECTION;
    await UserStateManager.updateUserState(user.id, userState);

    return BaseHandler.answerWithSectionsMenu(msg.chat.id);
  }
}
