import { Message } from 'node-telegram-bot-api';
import { BaseLogger } from 'pino';

import BaseHandler from '../BaseHandler';
import I18n from '../../I18n';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import Logger from '../../Logger';
import RepeatOrRestartHandler from './RepeatOrRestartHandler';
import { SUPPORTED_CITIES, USER_STATES } from '../../Constants';

export default class TextLocationHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    // TODO IF requesting user is in USER_STATES.WAIT_FOR_LOCATION:
    //  - take msg.text and try to identify city.
    //  - update current state to USER_STATES.WAIT_FOR_CITY_CONFIRM
    //  - send user confirmation message with YES and NO buttons
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);
    const logger: BaseLogger = Logger.child({ module: 'MessageHandler:TextLocationHandler', userId: userState.userId });
    let city: SUPPORTED_CITIES = SUPPORTED_CITIES.OTHER;

    switch (msg.text) {
      case I18n.t('StartHandler.buttons.locations.sendLocationOdesa.text'): city = SUPPORTED_CITIES.ODESA; break;
      case I18n.t('StartHandler.buttons.locations.sendLocationOther.text'): city = SUPPORTED_CITIES.OTHER; break;
      default:
        logger.info('Error!!! not selected city');
    }

    logger.info(`User selected '${ msg.text }' city, mapped to ${ city }. `);
    if (city === SUPPORTED_CITIES.OTHER) {
      return BaseHandler.answerWithStartFromBeginning(msg.chat.id);
    }

    userState.currentState = USER_STATES.WAIT_FOR_SECTION;
    userState.currentCity = city;
    await UserStateManager.updateUserState(userState.userId, userState);

    return RepeatOrRestartHandler.handle(msg);
  }
}
