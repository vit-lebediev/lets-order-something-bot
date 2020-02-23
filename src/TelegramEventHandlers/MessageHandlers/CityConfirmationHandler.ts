import { Message } from 'node-telegram-bot-api';

import BaseHandler from '../BaseHandler';

export default class CityConfirmationHandler extends BaseHandler {
  static handle (msg: Message): Promise<Message> {
    // Not sure if I need this state - bad user experience
    // TODO IF requesting user is in USER_STATES.WAIT_FOR_CITY_CONFIRM
    //  - update currentCity in redis and go on
    return BaseHandler.answerWithStartFromBeginning(msg.chat.id);
  }
}
