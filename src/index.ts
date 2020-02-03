// Dependency imports
import TelegramBot, {
  KeyboardButton,
  Message,
  ReplyKeyboardMarkup,
  SendMessageOptions,
  User
} from 'node-telegram-bot-api';

// Projects imports
import LosRedisClient from './RedisClient';
import UserState, { SUPPORTED_CITIES, USER_STATES } from './UserStateInterface';

// Const initialization
const { LOS_BOT_TOKEN } = process.env;

// const LOS_BOT_TOKEN: string | undefined = process.env.LOS_BOT_TOKEN;
const REDIS_HOST: string = process.env.LOS_REDIS_HOST || 'localhost';
const REDIS_PORT: string | number = process.env.LOS_REDIS_PORT || 8001;

if (!LOS_BOT_TOKEN) {
  throw new Error('You HAVE to run a bot with LOS_BOT_TOKEN env var set!');
}

// const USER_STATE_MACHINE = {
//   waitForLocation: {
//     nextStates: [ 'waitForCityConfirm', '???' ]
//   },
//   waitForCityConfirm: {
//     nextStates: [ '???' ]
//   }
// };

// Init Redis
const redisClient: LosRedisClient = new LosRedisClient({
  host: REDIS_HOST,
  port: REDIS_PORT as number
});

redisClient.on('error', (err) => console.log(`REDIS ERROR: ${ err }`));

// Init TelegramBot
const LOSBot = new TelegramBot(LOS_BOT_TOKEN, { polling: true });

// Telegram Events handlers
LOSBot.onText(/^\/start/, (msg: Message) => {
  const user: User | undefined = msg.from;

  if (user === undefined) {
    return LOSBot.sendMessage(msg.chat.id, "We've got some issue retrieving your user ID...");
  }

  console.log(`/start command received. User name: ${ user.first_name }, ${ user.last_name }, User id: ${ user.id }, username: ${ user.username }`);

  // Update current user state in Redis
  const userRedisKey: string = `${ user.id }_userState`;

  // Should implement UserState, but redis lib swears
  const userState = { // :UserState
    currentState: USER_STATES.WAIT_FOR_LOCATION,
    currentCity: SUPPORTED_CITIES.UNKNOWN,
    lastUpdated: Math.round(Date.now() / 1000)
  };

  console.log(`Storing user state in Redis with key ${ userRedisKey }`);
  redisClient.hmset(userRedisKey, userState);

  // Respond with a message and keyboard
  const firstButton: KeyboardButton = { text: '📍 Send my Location', request_location: true };

  const replyMarkup: ReplyKeyboardMarkup = {
    keyboard: [[ firstButton ]],
    resize_keyboard: true
  };

  const messageOptions: SendMessageOptions = {
    reply_markup: replyMarkup
  };

  return LOSBot.sendMessage(msg.chat.id, "Great! Let's start. First things first, I'll need your location to only show you places around you.", messageOptions);
});

LOSBot.onText(/^\/help/, async (msg: Message) => {
  const user: User | undefined = msg.from;

  if (user === undefined) return LOSBot.sendMessage(msg.chat.id, "We've got some issue retrieving your user ID...");

  const userRedisKey = `${ user.id }_userState`;

  const obj = await redisClient.hgetallAsync(userRedisKey);

  const userState: UserState = {
    currentState: Number(obj.currentState),
    currentCity: Number(obj.currentCity),
    lastUpdated: Number(obj.lastUpdated)
  };

  console.log(`Retrieved user state from Redis (typeof ${ typeof userState }), last updated: ${ Math.round(Date.now() / 1000) - userState.lastUpdated } seconds ago`);

  return LOSBot.sendMessage(msg.chat.id, 'Help is not supported yet');
});

LOSBot.onText(/^\/settings/, (msg) => LOSBot.sendMessage(msg.chat.id, 'Settings currently are not supported. TBD.'));

LOSBot.on('message', async (msg: Message) => {
  // leave 'location' requests for dedicated handler
  if (msg.location) return new Promise(() => {});

  // get user state
  const user: User | undefined = msg.from;

  if (user === undefined) return LOSBot.sendMessage(msg.chat.id, "We've got some issue retrieving your user ID...");

  const userRedisKey = `${ user.id }_userState`;

  const obj = await redisClient.hgetallAsync(userRedisKey);

  // TODO if undefined - redirect to /start
  if (!obj.currentState) return;

  const userState: UserState = {
    currentState: Number(obj.currentState),
    currentCity: Number(obj.currentCity),
    lastUpdated: Number(obj.lastUpdated)
  };

  // switch userState
  switch (userState.currentState) {
    case USER_STATES.WAIT_FOR_LOCATION:
      // TODO IF requesting user is in USER_STATES.WAIT_FOR_LOCATION:
      //  - take msg.text and try to identify city.
      //  - update current state to USER_STATES.WAIT_FOR_CITY_CONFIRM
      //  - send user confirmation message with YES and NO buttons
      break;
    case USER_STATES.WAIT_FOR_CITY_CONFIRM:
      // TODO IF requesting user is in USER_STATES.WAIT_FOR_CITY_CONFIRM
      //  - update currentCity in redis and go on
      break;
    default:
      // TODO redirect to /start
  }

  console.log('Test - message came in');
});

LOSBot.on('location', (msg: Message) => {
  console.log('location event received.');
  console.log(msg);

  // TODO IF requesting user is in USER_STATES.WAIT_FOR_LOCATION states
  //    - update currentCity in redis and go on
});

LOSBot.on('polling_error', (err) => {
  console.log(`Polling Error: ${err}`);

  // TODO Save error log to Mongo
});
