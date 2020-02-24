// Dependency imports
import {
  KeyboardButton,
  Message,
  ReplyKeyboardMarkup,
  SendMessageOptions,
  User
} from 'node-telegram-bot-api';
import NodeGeocoder, {
  Entry,
  Geocoder,
  Location,
  Options
} from 'node-geocoder';

// Projects imports
import i18n from 'i18n';
import LosTelegramBot from '../LosTelegramBot';
import UserStateInterface, { SUPPORTED_CITIES, USER_STATES } from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';
import BaseHandler from './BaseHandler';
import Logger from '../Logger';
import I18n from '../I18n';

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

export default class LocationHandler {
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
    userState.currentState = USER_STATES.WAIT_FOR_FOOD_CATEGORY;
    await UserStateManager.updateUserState(user.id, userState);

    return LocationHandler.answerWithFoodCategoriesMenu(msg.chat.id);
  }

  /**
   * Used by LocationHandler
   *
   * @param chatId
   * @param message
   */
  static answerWithFoodCategoriesMenu (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('LocationHandler.whatFood');

    const surpriseMeButton: KeyboardButton = { text: I18n.t('LocationHandler.buttons.dont_know.text') };
    const firstRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.sushi.text') },
      { text: I18n.t('LocationHandler.buttons.pizza.text') },
      { text: I18n.t('LocationHandler.buttons.shawerma.text') }
    ];
    const secondRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.vegetarian.text') },
      { text: I18n.t('LocationHandler.buttons.noodles_n_rice.text') },
      { text: I18n.t('LocationHandler.buttons.homey.text') }
    ];
    const thirdRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.burgers.text') },
      { text: I18n.t('LocationHandler.buttons.hotdogs.text') },
      { text: I18n.t('LocationHandler.buttons.sandwiches.text') }
    ];
    const fourthRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.salads.text') },
      { text: I18n.t('LocationHandler.buttons.soups.text') },
      { text: I18n.t('LocationHandler.buttons.pasta.text') }
    ];
    const fifthRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.snacks.text') },
      { text: I18n.t('LocationHandler.buttons.desserts.text') },
      { text: I18n.t('LocationHandler.buttons.children_menu.text') }
    ];

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [
        [ surpriseMeButton ],
        firstRowOfCategories,
        secondRowOfCategories,
        thirdRowOfCategories,
        fourthRowOfCategories,
        fifthRowOfCategories
      ],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
