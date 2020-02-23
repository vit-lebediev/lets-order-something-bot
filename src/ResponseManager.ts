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
    const verifiedMessage: string = message || I18n('StartHandler.start');

    const sendLocationButton: KeyboardButton = { text: '📍 Send my Location', request_location: true };

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [[ sendLocationButton ]],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static answerWithStartFromBeginning (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || 'Start from the start';

    const replyMarkup: ReplyKeyboardRemove = {
      remove_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }

  static answerWithFoodCategoriesMenu (chatId: number, message?: string): Promise<Message> {
    const verifiedMessage: string = message || "Good! What kind of food you're up to?";

    const surpriseMeButton: KeyboardButton = { text: "'🐙 I don't know... Choose for me!" };
    const firstRowOfCategories: KeyboardButton[] = [
      { text: '🍣 Sushi' }, { text: '🍕 Pizza' }, { text: '🥡 Wok' }
    ];

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [
        [ surpriseMeButton ],
        firstRowOfCategories
      ],
      resize_keyboard: true
    };

    const messageOptions: SendMessageOptions = {
      reply_markup: replyMarkup
    };

    return LosTelegramBot.sendMessage(chatId, verifiedMessage, messageOptions);
  }
}
