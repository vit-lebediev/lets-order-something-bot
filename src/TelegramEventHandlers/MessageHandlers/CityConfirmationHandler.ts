import { Message } from 'node-telegram-bot-api';

import ResponseManager from '../../ResponseManager';

export default class CityConfirmationHandler {
  static handle (msg: Message): Promise<Message> {
    // Not sure if I need this state - bad user experience
    // TODO IF requesting user is in USER_STATES.WAIT_FOR_CITY_CONFIRM
    //  - update currentCity in redis and go on
    return ResponseManager.answerWithStartFromBeginning(msg.chat.id);
  }
}
