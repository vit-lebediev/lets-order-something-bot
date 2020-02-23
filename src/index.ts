// Projects imports
import LosTelegramBot from './LosTelegramBot';

// Evnet Handlers
import LocationHandler from './TelegramEventHandlers/LocationHandler';
import ErrorHandler from './TelegramEventHandlers/ErrorHandler';
import SettingsHandler from './TelegramEventHandlers/SettingsHandler';
import HelpHandler from './TelegramEventHandlers/HelpHandler';
import StartHandler from './TelegramEventHandlers/StartHandler';
import MessageHandler from './TelegramEventHandlers/MessageHandler';

// const USER_STATE_MACHINE = {
//   waitForLocation: {
//     nextStates: [ 'waitForCityConfirm', '???' ]
//   },
//   waitForCityConfirm: {
//     nextStates: [ '???' ]
//   }
// };

LosTelegramBot.onText(/^\/start/, StartHandler.handle);
LosTelegramBot.onText(/^\/help/, HelpHandler.handle);
LosTelegramBot.onText(/^\/settings/, SettingsHandler.handle);

LosTelegramBot.on('message', MessageHandler.handle);
LosTelegramBot.on('location', LocationHandler.handle);

LosTelegramBot.on('polling_error', ErrorHandler.handle);
