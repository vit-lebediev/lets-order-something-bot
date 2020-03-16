import { Message } from 'node-telegram-bot-api';
import { BaseLogger } from 'pino';

import BaseHandler from '../BaseHandler';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import FoodCategoryHandler from './FoodCategoryHandler';
import KitchenHandler from './KitchenHandler';
import IFeelLuckyHandler from './IFeelLuckyHandler';
import I18n from '../../I18n';
import Logger from '../../Logger';
import { SECTIONS, USER_STATES } from '../../Constants';
import Amplitude, { AMPLITUDE_EVENTS } from '../../Amplitude/Amplitude';
import LosTelegramBot from '../../LosTelegramBot';
import ChooseForMeHandler from './ChooseForMeHandler';

export default class RepeatOrRestartHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:RepeatOrRestartHandler', userId: userState.userId });

    const repeatRegExp: RegExp = new RegExp(`${ I18n.t('BaseHandler.buttons.repeat.regExp') }$`);

    if (repeatRegExp.test(msg.text as string)) {
      logger.info("User selected 'repeat'");

      return RepeatOrRestartHandler.handleRepeat(msg);
    }

    if (msg.text === I18n.t('BaseHandler.buttons.restart.text')) {
      logger.info("User selected 'restart'");

      return RepeatOrRestartHandler.handleRestart(msg);
    }

    if (msg.text === I18n.t('BaseHandler.buttons.chooseForMe.text')) {
      logger.info("User selected 'chooseForMe'");

      return RepeatOrRestartHandler.handleChooseForMe(msg);
    }

    return LosTelegramBot.sendMessage(msg.chat.id, I18n.t('general.unrecognizedCommand'));
  }

  static async handleRepeat (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    await Amplitude.logEvent(userState.userId, AMPLITUDE_EVENTS.USER_SELECTED_REPEAT, {
      lastSection: userState.lastSection,
      lastCategory: userState.lastCategory
    });

    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:RepeatOrRestartHandler', userId: userState.userId });
    logger.info(`Last user section was '${ userState.lastSection }', last category - '${ userState.lastCategory }'`);

    switch (userState.lastSection) {
      case SECTIONS.FOOD: {
        const message: Message = msg;
        message.text = I18n.t(`SectionHandler.buttons.foods.${ userState.lastCategory?.toLowerCase() }.text`);
        return FoodCategoryHandler.handle(message);
      }
      case SECTIONS.KITCHEN: {
        const message: Message = msg;
        message.text = I18n.t(`SectionHandler.buttons.kitchens.${ userState.lastCategory?.toLowerCase() }.text`);
        return KitchenHandler.handle(message);
      }
      case SECTIONS.LUCKY:
      default:
        return IFeelLuckyHandler.handle(msg);
    }
  }

  static async handleRestart (msg: Message): Promise<Message> {
    // update user state to WAIT_FOR_SECTION
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    await Amplitude.logEvent(userState.userId, AMPLITUDE_EVENTS.USER_SELECTED_RESTART);

    userState.currentState = USER_STATES.WAIT_FOR_SECTION;
    await UserStateManager.updateUserState(userState.userId, userState);

    // answer with sections menu
    return BaseHandler.answerWithSectionsMenu(msg.chat.id);
  }

  static async handleChooseForMe (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);
    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:FoodCategoryHandler', userId: userState.userId });

    await Amplitude.logEvent(userState.userId, AMPLITUDE_EVENTS.USER_SELECTED_CHOOSE_FOR_ME);

    let places = [];
    if (userState.lastSelectedPlaces) {
      places = JSON.parse(userState.lastSelectedPlaces);
    }

    const placeNumber = Math.floor(Math.random() * places.length);
    logger.info(`${ places[placeNumber].name } place randomly selected (of ${ places.length }): ${ places.map((item: any) => item.name).join(', ') }`);

    userState.currentState = USER_STATES.WAIT_FOR_CHOOSE_AFTER_SELECT;
    await UserStateManager.updateUserState(userState.userId, userState);

    return ChooseForMeHandler.answerWithBtnGoToSectionsMenu(msg.chat.id, [ places[placeNumber] ]);
  }
}
