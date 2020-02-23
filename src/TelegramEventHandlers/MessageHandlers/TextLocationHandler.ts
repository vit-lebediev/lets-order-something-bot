import { Message } from 'node-telegram-bot-api';

import ResponseManager from '../../ResponseManager';

export default class TextLocationHandler {
  static handle (msg: Message): Promise<Message> {
    // TODO IF requesting user is in USER_STATES.WAIT_FOR_LOCATION:
    //  - take msg.text and try to identify city.
    //  - update current state to USER_STATES.WAIT_FOR_CITY_CONFIRM
    //  - send user confirmation message with YES and NO buttons
    return ResponseManager.answerWithStartFromBeginning(msg.chat.id);
  }
}
