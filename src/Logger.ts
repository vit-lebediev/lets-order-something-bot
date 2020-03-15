import Pino, { LoggerOptions } from 'pino';

const ENV: string | undefined = process.env.LOS_BOT_ENV;

let pinoOptions: LoggerOptions;

if (ENV === 'DEV') {
  pinoOptions = {
    prettyPrint: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: true
    }
  };
} else {
  pinoOptions = {};
}

export default Pino(pinoOptions);
