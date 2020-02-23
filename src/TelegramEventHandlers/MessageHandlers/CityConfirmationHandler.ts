import TelegramBot, { Message } from 'node-telegram-bot-api';

import UserStateManager from '../../UserState/UserStateManager';

export default class CityConfirmationHandler {
  static handle (msg: Message): Promise<TelegramBot.Message> {
    // Not sure if I need this state - bad user experience
    // TODO IF requesting user is in USER_STATES.WAIT_FOR_CITY_CONFIRM
    //  - update currentCity in redis and go on
    return UserStateManager.answerWithStartFromBeginning(msg.chat.id);
  }
}
