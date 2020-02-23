import { Message } from 'node-telegram-bot-api';

export default interface EventHandlerInterface {
  handle (msg: Message): Promise<Message>; // static
} // eslint-disable-line semi
