// Projects imports
import LosTelegramBot from './LosTelegramBot';

// Event Handlers
import LocationHandler from './TelegramEventHandlers/LocationHandler';
import ErrorHandler from './TelegramEventHandlers/ErrorHandler';
import SettingsHandler from './TelegramEventHandlers/SettingsHandler';
import HelpHandler from './TelegramEventHandlers/HelpHandler';
import StartHandler from './TelegramEventHandlers/StartHandler';
import MessageHandler from './TelegramEventHandlers/MessageHandler';
import Logger from './Logger';

const logger = Logger.child({ module: 'Index' });

LosTelegramBot.onText(/^\/start/, StartHandler.handle);
LosTelegramBot.onText(/^\/help/, HelpHandler.handle);
LosTelegramBot.onText(/^\/settings/, SettingsHandler.handle);

LosTelegramBot.on('message', MessageHandler.handle);
LosTelegramBot.on('location', LocationHandler.handle);

LosTelegramBot.on('polling_error', ErrorHandler.handle);


process.on('uncaughtException', (e: Error) => {
  logger.fatal(`Unhandled exception: ${ e.message }`);
});

process.on('unhandledRejection', async (reason) => {
  if (reason) {
    const errReason = reason as Error;
    logger.fatal(`Unhandled promise rejection: ${ errReason.stack?.split('\n')[0] }.\n${ errReason.stack?.split('\n')[1] }`);
  } else {
    logger.fatal('Unhandled promise rejection.');
  }
});
