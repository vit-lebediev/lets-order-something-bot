import { Message, User } from 'node-telegram-bot-api';

import UserStateInterface from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';

// Message Handlers
import BaseHandler from './BaseHandler';
import FoodCategoryHandler from './MessageHandlers/FoodCategoryHandler';
import TextLocationHandler from './MessageHandlers/TextLocationHandler';
import CityConfirmationHandler from './MessageHandlers/CityConfirmationHandler';
import SectionHandler from './MessageHandlers/SectionHandler';
import KitchenHandler from './MessageHandlers/KitchenHandler';
import RepeatOrRestartHandler from './MessageHandlers/RepeatOrRestartHandler';
import OtherCityHandler from './MessageHandlers/OtherCityHandler';
import FeedbackHandler from './MessageHandlers/FeedbackHandler';
import { USER_STATE_EXPIRED_ERROR_CODE } from '../Errors/UserStateExpiredError';

import { USER_STATES } from '../Constants';
import UserProfileManager from '../UserProfile/UserProfileManager';
import LosTelegramBot from '../LosTelegramBot';
import I18n from '../I18n';

const startCommandRegExp = /^\/start/;
const helpCommandRegExp = /^\/help/;
const settingsCommandRegExp = /^\/settings/;

export default class MessageHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    // leave 'location' requests for dedicated handler
    if (msg.location) return new Promise(() => {});

    if (msg.text && (
      startCommandRegExp.test(msg.text)
      || helpCommandRegExp.test(msg.text)
      || settingsCommandRegExp.test(msg.text)
    )) {
      // leave all 'commands' to their dedicated handlers
      return new Promise(() => {});
    }

    // get user state
    let userState: UserStateInterface;
    try {
      userState = await UserStateManager.getUserState(msg);
    } catch (e) {
      if (e.code === USER_STATE_EXPIRED_ERROR_CODE) {
        const user: User = UserProfileManager.getUserFromMessage(msg);

        const newUserState: UserStateInterface = {
          currentState: USER_STATES.WAIT_FOR_SECTION
        } as UserStateInterface;

        await UserStateManager.updateUserState(user.id, newUserState);

        await LosTelegramBot.sendMessage(msg.chat.id, I18n.t('general.stateExpired'));

        return BaseHandler.answerWithSectionsMenu(msg.chat.id);
      }

      throw e;
    }

    // switch userState
    switch (userState.currentState) {
      case USER_STATES.WAIT_FOR_LOCATION: return TextLocationHandler.handle(msg);
      case USER_STATES.WAIT_FOR_TEXT_CITY_OTHER: return OtherCityHandler.handle(msg);
      // not active state at the moment
      case USER_STATES.WAIT_FOR_CITY_CONFIRM: return CityConfirmationHandler.handle(msg);
      case USER_STATES.WAIT_FOR_SECTION: return SectionHandler.handle(msg);
      case USER_STATES.WAIT_FOR_FEEDBACK: return FeedbackHandler.handle(msg);
      case USER_STATES.WAIT_FOR_FOOD_CATEGORY: return FoodCategoryHandler.handle(msg);
      case USER_STATES.WAIT_FOR_KITCHEN: return KitchenHandler.handle(msg);
      case USER_STATES.WAIT_FOR_REPEAT_OR_RESTART: return RepeatOrRestartHandler.handle(msg);

      default: return BaseHandler.answerWithStartFromBeginning(msg.chat.id);
    }
  }
}
