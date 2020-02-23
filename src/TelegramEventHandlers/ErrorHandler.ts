import Logger from '../Logger';

const logger = Logger.child({ module: 'ErrorHandler' });

export default class ErrorHandler {
  static handle (err: Error) {
    logger.error(`Polling Error: ${ err }`);

    // TODO Save error log to Mongo
  }
}
