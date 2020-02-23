import { Message } from 'node-telegram-bot-api';

import UserStateInterface, { USER_STATES } from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';

// Message Handlers
import FoodCategoryHandler from './MessageHandlers/FoodCategoryHandler';
import TextLocationHandler from './MessageHandlers/TextLocationHandler';
import CityConfirmationHandler from './MessageHandlers/CityConfirmationHandler';
import ResponseManager from '../ResponseManager';

export default class MessageHandler {
  static async handle (msg: Message): Promise<Message> {
    // leave 'location' requests for dedicated handle
    if (msg.location) return new Promise(() => {});

    // get user state
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    // switch userState
    switch (userState.currentState) {
      case USER_STATES.WAIT_FOR_LOCATION: return TextLocationHandler.handle(msg);
      // not active state at the moment
      case USER_STATES.WAIT_FOR_CITY_CONFIRM: return CityConfirmationHandler.handle(msg);
      case USER_STATES.WAIT_FOR_FOOD_CATEGORY: return FoodCategoryHandler.handle(msg);

      default: return ResponseManager.answerWithStartFromBeginning(msg.chat.id);
    }
  }
}
