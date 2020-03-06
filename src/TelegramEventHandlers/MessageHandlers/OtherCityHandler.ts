import {
  Message,
  ReplyKeyboardRemove,
  SendMessageOptions
} from 'node-telegram-bot-api';
import { BaseLogger } from 'pino';
import LosTelegramBot from '../../LosTelegramBot';
import BaseHandler from '../BaseHandler';
import I18n from '../../I18n';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import { USER_STATES } from '../../Constants';
import StartHandler from '../StartHandler';

export default class OtherCityHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);
    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:OtherCityHandler', userId: userState.userId });
    logger.info(`User entered '${ msg.text }' city.`);

    userState.currentState = USER_STATES.WAIT_FOR_LOCATION;
    await UserStateManager.updateUserState(userState.userId, userState);

    return StartHandler.handle(msg);
  }

  static answerWithPromptEnterCity (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('OtherCityHandler.inputPrompt');

    const replyMarkup: ReplyKeyboardRemove = {
      remove_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
