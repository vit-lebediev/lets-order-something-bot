import TelegramBot, { Message, User } from 'node-telegram-bot-api';

import LosTelegramBot from '../LosTelegramBot';
import UserStateInterface, { USER_STATES } from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';

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
      case USER_STATES.WAIT_FOR_LOCATION:
        // TODO IF requesting user is in USER_STATES.WAIT_FOR_LOCATION:
        //  - take msg.text and try to identify city.
        //  - update current state to USER_STATES.WAIT_FOR_CITY_CONFIRM
        //  - send user confirmation message with YES and NO buttons
        break;
      case USER_STATES.WAIT_FOR_CITY_CONFIRM:
        // TODO IF requesting user is in USER_STATES.WAIT_FOR_CITY_CONFIRM
        //  - update currentCity in redis and go on
        break;
      case USER_STATES.WAIT_FOR_FOOD_CATEGORY:
        // TODO based on category, randomly select 5 foods and send
        break;
      default:
        // TODO redirect to /start
    }

    return UserStateManager.answerWithStartFromBeginning(msg.chat.id);
  }
}
