// Init TelegramBot
import TelegramBot from 'node-telegram-bot-api';

const { LOS_BOT_TG_TOKEN, LOS_BOT_ENV, LOS_EXPRESS_HOST } = process.env;

if (!LOS_BOT_TG_TOKEN || !LOS_BOT_ENV || !LOS_EXPRESS_HOST) {
  throw new Error('You HAVE to run a bot with LOS_BOT_TG_TOKEN, LOS_BOT_ENV and LOS_EXPRESS_HOST env var set!');
}

const supportedEnvs: Array<string> = [ 'DEV', 'PROD' ];

if (supportedEnvs.indexOf(LOS_BOT_ENV) === -1) {
  throw new Error(`LOS_BOT_ENV MUST be set to one of these values: ${ supportedEnvs.join(', ') }`);
}

const LOSBot = new TelegramBot(LOS_BOT_TG_TOKEN, { polling: (LOS_BOT_ENV === 'DEV') });

if (LOS_BOT_ENV === 'PROD') {
  LOSBot.setWebHook(`https://${ LOS_EXPRESS_HOST }/bot${ LOS_BOT_TG_TOKEN }`);
}

export default LOSBot;
