import Experss from 'express';
import bodyParser from 'body-parser';

// Projects imports
import LosTelegramBot from './LosTelegramBot';

// Event Handlers
// import LocationHandler from './TelegramEventHandlers/LocationHandler';
import ErrorHandler from './TelegramEventHandlers/ErrorHandler';
import SettingsHandler from './TelegramEventHandlers/SettingsHandler';
import HelpHandler from './TelegramEventHandlers/HelpHandler';
import StartHandler from './TelegramEventHandlers/StartHandler';
import MessageHandler from './TelegramEventHandlers/MessageHandler';
import Logger from './Logger';
import RedirectHandler from './ExpressHandlers/RedirectHandler';
import IndexHandler from './ExpressHandlers/IndexHandler';

const { LOS_BOT_TG_TOKEN } = process.env;

const logger = Logger.child({ module: 'Index' });

LosTelegramBot.onText(/^\/start/, StartHandler.handle);
LosTelegramBot.onText(/^\/help/, HelpHandler.handle);
LosTelegramBot.onText(/^\/settings/, SettingsHandler.handle);

LosTelegramBot.on('message', MessageHandler.handle);
// LosTelegramBot.on('location', LocationHandler.handle);

LosTelegramBot.on('polling_error', ErrorHandler.handle);

const express = Experss();

express.use(bodyParser.json());

express.post(`/bot${ LOS_BOT_TG_TOKEN }`, (req, res) => {
  LosTelegramBot.processUpdate(req.body);
  res.sendStatus(200);
});

express.get('/', IndexHandler.handle);
express.get('/r', RedirectHandler.handle);

express.listen(3000, () => {
  logger.info('Express is listening on port 3000');
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
