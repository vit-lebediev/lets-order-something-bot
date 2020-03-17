import { Message } from 'node-telegram-bot-api';

import I18n from '../../I18n';
import BaseHandler from '../BaseHandler';
import UserStateInterface from '../../UserState/UserStateInterface';
import UserStateManager from '../../UserState/UserStateManager';
import { USER_STATES } from '../../Constants';

import Amplitude, { AMPLITUDE_EVENTS } from '../../Amplitude/Amplitude';

export default class ChooseForMeHandler extends BaseHandler {
  static async handle (msg: Message): Promise<Message> {
    const userState: UserStateInterface = await UserStateManager.getUserState(msg);

    if (msg.text === I18n.t('ChooseForMeHandler.buttons.chooseSelectMenu.text')) {
      await Amplitude.logEvent(userState.userId, AMPLITUDE_EVENTS.USER_SELECTED_GOTO_MENU);

      userState.currentState = USER_STATES.WAIT_FOR_SECTION;
      await UserStateManager.updateUserState(userState.userId, userState);

      return BaseHandler.answerWithSectionsMenu(msg.chat.id);
    }

    return this.answerWithUnrecognizedCommand(msg.chat.id);
  }
}
