// Dependency imports
import { Message, User } from 'node-telegram-bot-api';
import NodeGeocoder, {
  Entry,
  Geocoder,
  Location,
  Options
} from 'node-geocoder';

// Projects imports
import LosTelegramBot from '../LosTelegramBot';
import UserStateInterface, { SUPPORTED_CITIES, USER_STATES } from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';
import ResponseManager from '../ResponseManager';
import Logger from '../Logger';

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

export default class LocationHandler {
  static async handle (msg: Message): Promise<Message> {
    const user: User = UserStateManager.getUserFromMessage(msg);

    logger.info(`/location command received. User name: ${ user.first_name }, ${ user.last_name }, User id: ${ user.id }, username: ${ user.username }`);

    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    // verify we're in a proper state for this event...
    if (userState.currentState !== USER_STATES.WAIT_FOR_LOCATION) {
      logger.warn(`User state mismatch: current state ${ userState.currentState } !== ${ USER_STATES.WAIT_FOR_LOCATION }`);
      return ResponseManager.answerWithStartFromBeginning(msg.chat.id);
    }

    logger.info('Querying for a city by coordinates...');

    if (msg.location === undefined) return LosTelegramBot.sendMessage(msg.chat.id, 'Что-то не так с получением ваших геоданных, попробуйте еще раз...');

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
      return ResponseManager.answerWithStartFromBeginning(msg.chat.id, `Unfortunately, but ${ userCityString } city is not supported yet. 
      Try waiting, or moving to another place!`);
    }

    // update user state
    userState.currentCity = userCity;
    userState.currentState = USER_STATES.WAIT_FOR_FOOD_CATEGORY;
    await UserStateManager.updateUserState(user.id, userState);

    return ResponseManager.answerWithFoodCategoriesMenu(msg.chat.id);
  }
}