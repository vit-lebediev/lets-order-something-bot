import Experss from 'express';

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
import RedirectHandler from './ExpressHandlers/RedirectHandler';
import IndexHandler from './ExpressHandlers/IndexHandler';

const express = Experss();

const { LOS_EXPRESS_PORT } = process.env;

if (!LOS_EXPRESS_PORT) {
  throw new Error('LOS_EXPRESS_HOST and LOS_EXPRESS_PORT env vars need to be set');
}

const logger = Logger.child({ module: 'Index' });

LosTelegramBot.onText(/^\/start/, StartHandler.handle);
LosTelegramBot.onText(/^\/help/, HelpHandler.handle);
LosTelegramBot.onText(/^\/settings/, SettingsHandler.handle);

LosTelegramBot.on('message', MessageHandler.handle);
LosTelegramBot.on('location', LocationHandler.handle);

LosTelegramBot.on('polling_error', ErrorHandler.handle);

express.get('/', IndexHandler.handle);
express.get('/r', RedirectHandler.handle);

express.listen(LOS_EXPRESS_PORT, () => {
  logger.info(`Express is listening on port ${ LOS_EXPRESS_PORT }`);
});

process.on('uncaughtException', (e: Error) => {
  logger.fatal(`Unhandled exception: ${ e.message }`);
  if (e.stack) logger.fatal(e.stack);
});

process.on('unhandledRejection', async (reason) => {
  if (reason) {
    const errReason = reason as Error;
    logger.fatal(`Unhandled promise rejection: ${ errReason.stack?.split('\n')[0] }.\n${ errReason.stack?.split('\n')[1] }`);
    if (errReason.stack) logger.fatal(errReason.stack);
  } else {
    logger.fatal('Unhandled promise rejection.');
  }
});
