import {
  KeyboardButton,
  Message,
  ReplyKeyboardMarkup,
  SendMessageOptions
} from 'node-telegram-bot-api';
import { BaseLogger } from 'pino';

import I18n from '../../I18n';
import LosTelegramBot from '../../LosTelegramBot';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import BaseHandler from '../BaseHandler';
import IFeelLuckyHandler from './IFeelLuckyHandler';
import { USER_STATES } from '../../Constants';
import Amplitude, { AMPLITUDE_EVENTS } from '../../Amplitude/Amplitude';

export default class SectionHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:SectionHandler', userId: userState.userId });

    switch (msg.text) {
      case I18n.t('LocationHandler.buttons.kitchens.text'): {
        await Amplitude.logEvent(userState.userId, AMPLITUDE_EVENTS.USER_SELECTED_KITCHENS_SECTION);

        userState.currentState = USER_STATES.WAIT_FOR_KITCHEN;
        await UserStateManager.updateUserState(userState.userId, userState);

        logger.info(`User selected ${ I18n.t('LocationHandler.buttons.kitchens.text') } section`);

        return this.answerWithKitchensMenu(msg.chat.id);
      }

      case I18n.t('LocationHandler.buttons.categories.text'): {
        await Amplitude.logEvent(userState.userId, AMPLITUDE_EVENTS.USER_SELECTED_FOOD_SECTION);

        userState.currentState = USER_STATES.WAIT_FOR_FOOD_CATEGORY;
        await UserStateManager.updateUserState(userState.userId, userState);

        logger.info(`User selected ${ I18n.t('LocationHandler.buttons.categories.text') } section`);

        return this.answerWithFoodCategoriesMenu(msg.chat.id);
      }

      case I18n.t('LocationHandler.buttons.i_feel_lucky.text'): {
        userState.currentState = USER_STATES.WAIT_FOR_REPEAT_OR_RESTART;
        await UserStateManager.updateUserState(userState.userId, userState);

        logger.info(`'User selected ${ I18n.t('LocationHandler.buttons.i_feel_lucky.text') } section'`);

        return IFeelLuckyHandler.handle(msg);
      }

      case I18n.t('LocationHandler.buttons.feedback.text'): {
        await Amplitude.logEvent(userState.userId, AMPLITUDE_EVENTS.USER_SELECTED_FEEDBACK_SECTION);

        userState.currentState = USER_STATES.WAIT_FOR_FEEDBACK;
        await UserStateManager.updateUserState(userState.userId, userState);

        logger.info(`User selected ${ I18n.t('LocationHandler.buttons.feedback.text') } section`);

        return this.answerWithFeedback(msg.chat.id);
      }

      default:
        return BaseHandler.answerWithUnrecognizedCommand(msg.chat.id);
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

    const functionButtons: KeyboardButton[] = [
        { text: I18n.t('SectionHandler.buttons.foods.random.text') },
        { text: I18n.t('BaseHandler.buttons.restart.text') }
    ];

    const zeroRowOfCategories: KeyboardButton[] = [
        { text: I18n.t('SectionHandler.buttons.foods.breakfast.text') },
        { text: I18n.t('SectionHandler.buttons.foods.lunch.text') },
        { text: I18n.t('SectionHandler.buttons.foods.meat_grill.text') }
    ];

    const firstRowOfCategories: KeyboardButton[] = [
        { text: I18n.t('SectionHandler.buttons.foods.sushi.text') },
        { text: I18n.t('SectionHandler.buttons.foods.pizza.text') },
        { text: I18n.t('SectionHandler.buttons.foods.shawerma.text') }
    ];

    const secondRowOfCategories: KeyboardButton[] = [
        { text: I18n.t('SectionHandler.buttons.foods.vegetarian.text') },
        { text: I18n.t('SectionHandler.buttons.foods.noodles_n_rice.text') },
        { text: I18n.t('SectionHandler.buttons.foods.homey.text') }
    ];

    const thirdRowOfCategories: KeyboardButton[] = [
        { text: I18n.t('SectionHandler.buttons.foods.burgers.text') },
        { text: I18n.t('SectionHandler.buttons.foods.hotdogs.text') },
        { text: I18n.t('SectionHandler.buttons.foods.sandwiches.text') }
    ];

    const fourthRowOfCategories: KeyboardButton[] = [
        { text: I18n.t('SectionHandler.buttons.foods.salads.text') },
        { text: I18n.t('SectionHandler.buttons.foods.soups.text') },
        { text: I18n.t('SectionHandler.buttons.foods.pasta.text') }
    ];

    const fifthRowOfCategories: KeyboardButton[] = [
        { text: I18n.t('SectionHandler.buttons.foods.snacks.text') },
        { text: I18n.t('SectionHandler.buttons.foods.desserts.text') },
        { text: I18n.t('SectionHandler.buttons.foods.children_menu.text') }
    ];

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [
          functionButtons,
          zeroRowOfCategories,
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

    Amplitude.flush();

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static answerWithKitchensMenu (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('SectionHandler.whatKitchen');

    const functionButtons: KeyboardButton[] = [
        { text: I18n.t('SectionHandler.buttons.kitchens.random.text') },
        { text: I18n.t('BaseHandler.buttons.restart.text') }
    ];

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
          functionButtons,
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

    Amplitude.flush();

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static answerWithFeedback (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('FeedbackHandler.inputPrompt');

    const backButton: KeyboardButton = { text: I18n.t('FeedbackHandler.buttons.back.text') };

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [
          [ backButton ]
      ],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    Amplitude.flush();

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
