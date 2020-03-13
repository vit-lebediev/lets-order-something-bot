import { Message } from 'node-telegram-bot-api';
import { BaseLogger } from 'pino';
import { Collection } from 'mongodb';

import LosMongoClient, { FEEDBACKS_COLLECTION } from '../../LosMongoClient';
import BaseHandler from '../BaseHandler';
import I18n from '../../I18n';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import { USER_STATES } from '../../Constants';


export default class FeedbackHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:FeedbackHandler', userId: userState.userId });

    // @ts-ignore
    const feedbacksCollection: Collection = LosMongoClient.dbHandler.collection(FEEDBACKS_COLLECTION);

    if (msg.text === I18n.t('FeedbackHandler.buttons.back.text')) {
      logger.info("User selected 'back'");
    } else {
      logger.info(`User entered a feedback: '${ msg.text?.substr(0, 20) + (msg.text!.length > 20 ? "'...'" : "'") }. Saving it to Mongo...`);

      await feedbacksCollection.insertOne(
          { tgUserId: userState.userId, feedBackText: msg.text }
      );
    }

    userState.currentState = USER_STATES.WAIT_FOR_SECTION;
    await UserStateManager.updateUserState(userState.userId, userState);

    return BaseHandler.answerWithSectionsMenu(msg.chat.id, I18n.t('FeedbackHandler.messageThanks'));
  }
}