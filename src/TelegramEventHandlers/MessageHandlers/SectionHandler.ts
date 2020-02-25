import {
  KeyboardButton,
  Message,
  ReplyKeyboardMarkup,
  SendMessageOptions, User
} from 'node-telegram-bot-api';
import { BaseLogger } from 'pino';

import I18n from '../../I18n';
import LosTelegramBot from '../../LosTelegramBot';
import UserStateInterface, { USER_STATES } from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import BaseHandler from '../BaseHandler';
import IFeelLuckyHandler from './IFeelLuckyHandler';

export default class SectionHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const user: User = UserStateManager.getUserFromMessage(msg);

    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:SectionHandler', userId: userState.userId });

    switch (msg.text) {
      case I18n.t('LocationHandler.buttons.kitchens.text'): {
        userState.currentState = USER_STATES.WAIT_FOR_KITCHEN;
        await UserStateManager.updateUserState(user.id, userState);

        logger.info(`User selected ${ I18n.t('LocationHandler.buttons.kitchens.text') } section`);

        return this.answerWithKitchensMenu(msg.chat.id);
      }
      case I18n.t('LocationHandler.buttons.categories.text'): {
        userState.currentState = USER_STATES.WAIT_FOR_FOOD_CATEGORY;
        await UserStateManager.updateUserState(user.id, userState);

        logger.info(`User selected ${ I18n.t('LocationHandler.buttons.categories.text') } section`);

        return this.answerWithFoodCategoriesMenu(msg.chat.id);
      }
      case I18n.t('LocationHandler.buttons.i_feel_lucky.text'):
      default:
        // TODO move to another state
        userState.currentState = USER_STATES.WAIT_FOR_REPEAT_OR_RESTART;
        await UserStateManager.updateUserState(user.id, userState);

        logger.info(`'User selected ${ I18n.t('LocationHandler.buttons.i_feel_lucky.text') } section'`);

        return IFeelLuckyHandler.handle(msg);
    }
  }

  /**
   * Used by SectionHandler
   *
   * @param chatId
   * @param message
   */
  static answerWithFoodCategoriesMenu (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('LocationHandler.whatFood');

    const surpriseMeButton: KeyboardButton = { text: I18n.t('LocationHandler.buttons.dont_know.text') };
    const firstRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.sushi.text') },
      { text: I18n.t('LocationHandler.buttons.pizza.text') },
      { text: I18n.t('LocationHandler.buttons.shawerma.text') }
    ];
    const secondRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.vegetarian.text') },
      { text: I18n.t('LocationHandler.buttons.noodles_n_rice.text') },
      { text: I18n.t('LocationHandler.buttons.homey.text') }
    ];
    const thirdRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.burgers.text') },
      { text: I18n.t('LocationHandler.buttons.hotdogs.text') },
      { text: I18n.t('LocationHandler.buttons.sandwiches.text') }
    ];
    const fourthRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.salads.text') },
      { text: I18n.t('LocationHandler.buttons.soups.text') },
      { text: I18n.t('LocationHandler.buttons.pasta.text') }
    ];
    const fifthRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.snacks.text') },
      { text: I18n.t('LocationHandler.buttons.desserts.text') },
      { text: I18n.t('LocationHandler.buttons.children_menu.text') }
    ];

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [
        [ surpriseMeButton ],
        firstRowOfCategories,
        secondRowOfCategories,
        thirdRowOfCategories,
        fourthRowOfCategories,
        fifthRowOfCategories
      ],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static answerWithKitchensMenu (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('SectionHandler.whatKitchen');

    const surpriseMeButton: KeyboardButton = { text: I18n.t('SectionHandler.buttons.kitchens.random.text') };
    const firstRowOfKitchens: KeyboardButton[] = [
      { text: I18n.t('SectionHandler.buttons.kitchens.homey.text') },
      { text: I18n.t('SectionHandler.buttons.kitchens.ukrainian.text') }
    ];
    const secondRowOfKitchens: KeyboardButton[] = [
      { text: I18n.t('SectionHandler.buttons.kitchens.east.text') },
      { text: I18n.t('SectionHandler.buttons.kitchens.italian.text') }
    ];
    const thirdRowOfKitchens: KeyboardButton[] = [
      { text: I18n.t('SectionHandler.buttons.kitchens.european.text') },
      { text: I18n.t('SectionHandler.buttons.kitchens.american.text') }
    ];
    const fourthRowOfKitchens: KeyboardButton[] = [
      { text: I18n.t('SectionHandler.buttons.kitchens.japanese.text') },
      { text: I18n.t('SectionHandler.buttons.kitchens.chinese.text') }
    ];
    const fifthRowOfKitchens: KeyboardButton[] = [
      { text: I18n.t('SectionHandler.buttons.kitchens.korean.text') },
      { text: I18n.t('SectionHandler.buttons.kitchens.georgian.text') }
    ];
    const sixthRowOfKitchens: KeyboardButton[] = [
      { text: I18n.t('SectionHandler.buttons.kitchens.thai.text') },
      { text: I18n.t('SectionHandler.buttons.kitchens.mexican.text') }
    ];

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [
        [ surpriseMeButton ],
        firstRowOfKitchens,
        secondRowOfKitchens,
        thirdRowOfKitchens,
        fourthRowOfKitchens,
        fifthRowOfKitchens,
        sixthRowOfKitchens
      ],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
