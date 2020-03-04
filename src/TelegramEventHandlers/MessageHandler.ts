import { Message } from 'node-telegram-bot-api';

import UserStateInterface from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';
// Message Handlers
import FoodCategoryHandler from './MessageHandlers/FoodCategoryHandler';
import TextLocationHandler from './MessageHandlers/TextLocationHandler';
import CityConfirmationHandler from './MessageHandlers/CityConfirmationHandler';
import BaseHandler from './BaseHandler';
import SectionHandler from './MessageHandlers/SectionHandler';
import KitchenHandler from './MessageHandlers/KitchenHandler';
import RepeatOrRestartHandler from './MessageHandlers/RepeatOrRestartHandler';
import { USER_STATES } from '../Constants';

const startCommandRegExp = /^\/start/;
const helpCommandRegExp = /^\/help/;
const settingsCommandRegExp = /^\/settings/;

export default class MessageHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    // leave 'location' requests for dedicated handle
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
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    // switch userState
    switch (userState.currentState) {
      case USER_STATES.WAIT_FOR_LOCATION: return TextLocationHandler.handle(msg);
      // not active state at the moment
      case USER_STATES.WAIT_FOR_CITY_CONFIRM: return CityConfirmationHandler.handle(msg);
      case USER_STATES.WAIT_FOR_SECTION: return SectionHandler.handle(msg);
      case USER_STATES.WAIT_FOR_FOOD_CATEGORY: return FoodCategoryHandler.handle(msg);
      case USER_STATES.WAIT_FOR_KITCHEN: return KitchenHandler.handle(msg);
      case USER_STATES.WAIT_FOR_REPEAT_OR_RESTART: return RepeatOrRestartHandler.handle(msg);

      default: return BaseHandler.answerWithStartFromBeginning(msg.chat.id);
    }
  }
}
