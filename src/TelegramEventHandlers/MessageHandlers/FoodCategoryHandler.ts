import { Message } from 'node-telegram-bot-api';

import BaseHandler from '../BaseHandler';
import LosMongoClient from '../../LosMongoClient';

export default class FoodCategoryHandler extends BaseHandler {
  static handle (msg: Message): Promise<Message> {
    // TODO based on category, randomly select 5 foods and send

    // match category to enum

    // search for places in category
    // return 5 places
    // move to next state

    return BaseHandler.answerWithNoChange(msg.chat.id);
  }
}
