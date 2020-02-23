import LosLogger from '../LosLogger';

const logger = LosLogger.child({ module: 'ErrorHandler' });

export default class ErrorHandler {
  static handle (err: Error) {
    logger.error(`Polling Error: ${ err }`);

    // TODO Save error log to Mongo
  }
}
