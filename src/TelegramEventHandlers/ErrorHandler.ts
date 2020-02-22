export default class ErrorHandler {
  static handle (err: Error) {
    console.log(`Polling Error: ${ err }`);

    // TODO Save error log to Mongo
  }
}
