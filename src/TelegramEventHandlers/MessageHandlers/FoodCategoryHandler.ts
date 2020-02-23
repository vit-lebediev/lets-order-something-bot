import { Message } from 'node-telegram-bot-api';

import UserStateManager from '../../UserState/UserStateManager';

export default class FoodCategoryHandler {
  static handle (msg: Message): Promise<Message> {
    // TODO based on category, randomly select 5 foods and send
    return UserStateManager.answerWithStartFromBeginning(msg.chat.id);
  }
}
