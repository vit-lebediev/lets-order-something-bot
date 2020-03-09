import {
  Message,
  SendMessageOptions
} from 'node-telegram-bot-api';
import { BaseLogger } from 'pino';
import { Collection } from 'mongodb';

import LosMongoClient from '../../LosMongoClient';
import LosTelegramBot from '../../LosTelegramBot';
import BaseHandler from '../BaseHandler';
import I18n from '../../I18n';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import { USER_STATES } from '../../Constants';

export default class FeedBackHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);
    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:FeedBackHandler', userId: userState.userId });

    logger.info(`User entered '${ msg.text }'.`);

    // @ts-ignore
    const feedBacksCollection: Collection = LosMongoClient.dbHandler.collection('feedBacks');
    await feedBacksCollection.insertOne(
        { userTgId: userState.userId, feedBackText: msg.text }
    );

    logger.info(`Save feedback '${ msg.text }' from user '${ userState.userId }' to db.feedBacks`);

    userState.currentState = USER_STATES.WAIT_FOR_SECTION;
    await UserStateManager.updateUserState(userState.userId, userState);

    return BaseHandler.answerWithStartFromBeginning(msg.chat.id);
  }

  static answerWithFeedBack (chatId: number, message?: string): Promise<Message> {
      const verifiedMessage: string = message || I18n.t('FeedBackHandler.inputPrompt');

      const messageOptions: SendMessageOptions = {
          parse_mode: 'Markdown'
      };

      return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
