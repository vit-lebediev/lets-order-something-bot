import TelegramBot, { Message } from 'node-telegram-bot-api';

import UserStateManager from '../../UserState/UserStateManager';

export default class TextLocationHandler {
  static handle (msg: Message): Promise<TelegramBot.Message> {
    // TODO IF requesting user is in USER_STATES.WAIT_FOR_LOCATION:
    //  - take msg.text and try to identify city.
    //  - update current state to USER_STATES.WAIT_FOR_CITY_CONFIRM
    //  - send user confirmation message with YES and NO buttons
    return UserStateManager.answerWithStartFromBeginning(msg.chat.id);
  }
}
