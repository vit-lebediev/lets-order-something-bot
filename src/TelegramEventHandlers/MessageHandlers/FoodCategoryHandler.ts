import { Message } from 'node-telegram-bot-api';

import ResponseManager from '../../ResponseManager';

export default class FoodCategoryHandler {
  static handle (msg: Message): Promise<Message> {
    // TODO based on category, randomly select 5 foods and send
    return ResponseManager.answerWithNoChange(msg.chat.id);
  }
}
