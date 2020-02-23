import TelegramBot, { Message, User } from 'node-telegram-bot-api';

import LosTelegramBot from '../LosTelegramBot';
import UserStateInterface, { USER_STATES } from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';

// Message Handlers
import FoodCategoryHandler from './MessageHandlers/FoodCategoryHandler';
import TextLocationHandler from './MessageHandlers/TextLocationHandler';
import CityConfirmationHandler from './MessageHandlers/CityConfirmationHandler';

export default class MessageHandler {
  static async handle (msg: Message): Promise<TelegramBot.Message> {
    // leave 'location' requests for dedicated handle
    if (msg.location) return new Promise(() => {});

    // get user state
    const user: User | undefined = msg.from;
    if (user === undefined) return LosTelegramBot.sendMessage(msg.chat.id, "We've got some issue retrieving your user ID...");

    const userState: UserStateInterface | null = await UserStateManager.getUserState(user.id);

    if (userState === null) {
      return UserStateManager.answerWithWaitForLocation(msg.chat.id);
    }

    // switch userState
    switch (userState.currentState) {
      case USER_STATES.WAIT_FOR_LOCATION: return TextLocationHandler.handle(msg);
      // not active state at the moment
      case USER_STATES.WAIT_FOR_CITY_CONFIRM: return CityConfirmationHandler.handle(msg);
      case USER_STATES.WAIT_FOR_FOOD_CATEGORY: return FoodCategoryHandler.handle(msg);

      default: return UserStateManager.answerWithStartFromBeginning(msg.chat.id);
    }
  }
}
