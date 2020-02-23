import {
  KeyboardButton,
  Message,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  SendMessageOptions
} from 'node-telegram-bot-api';
import LosTelegramBot from './LosTelegramBot';
import I18n from './I18n';

export default class ResponseManager {
  /**
   * Used by StartHandler
   *
   * @param chatId
   * @param message
   */
  static answerWithWaitForLocation (chatId: number, message?: string): Promise<Message> {
    // Respond with a message and keyboard
    // const verifiedMessage: string = message || "Great! Let's start. First things first, I'll need your location to only show you places around you.";
    const verifiedMessage: string = message || I18n.t('StartHandler.start');

    const sendLocationButton: KeyboardButton = { text: I18n.t('StartHandler.buttons.sendLocation'), request_location: true };

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [[ sendLocationButton ]],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  /**
   * Used by different handlers to get back to start of the process
   *
   * @param chatId
   * @param message
   */
  static answerWithStartFromBeginning (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('general.fromTheStart');

    const replyMarkup: ReplyKeyboardRemove = {
      remove_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  /**
   * Used by LocationHandler
   *
   * @param chatId
   * @param message
   */
  static answerWithFoodCategoriesMenu (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('LocationHandler.whatFood');

    const surpriseMeButton: KeyboardButton = { text: I18n.t('LocationHandler.buttons.chooseForMe') };
    const firstRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.sushi') },
      { text: I18n.t('LocationHandler.buttons.pizza') },
      { text: I18n.t('LocationHandler.buttons.shawerma') }
    ];
    const secondRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.veg') },
      { text: I18n.t('LocationHandler.buttons.noodles') },
      { text: I18n.t('LocationHandler.buttons.homey') }
    ];
    const thirdRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.bhs') }
    ];
    const fourthRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.salads') },
      { text: I18n.t('LocationHandler.buttons.soups') },
      { text: I18n.t('LocationHandler.buttons.pasta') }
    ];
    const fifthRowOfCategories: KeyboardButton[] = [
      { text: I18n.t('LocationHandler.buttons.snacks') },
      { text: I18n.t('LocationHandler.buttons.desserts') },
      { text: I18n.t('LocationHandler.buttons.children') }
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

  /**
   * Used by different handlers to get back to start of the process
   *
   * @param chatId
   * @param message
   */
  static answerWithNoChange (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || I18n.t('general.notRecognized');

    const messageOptions: SendMessageOptions = {
      parse_mode: 'Markdown'
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
