import { Db, MongoClient, MongoClientOptions } from 'mongodb';

const MONGO_HOST: string | undefined = process.env.LOS_MONGO_HOST;
const MONGO_PORT: string | number | undefined = process.env.LOS_MONGO_PORT;
const MONGO_DB: string | undefined = process.env.LOS_MONGO_DB;
const MONGO_USER: string | undefined = process.env.LOS_MONGO_USER;
const MONGO_PASS: string | undefined = process.env.LOS_MONGO_PASS;

if (MONGO_HOST === undefined || !MONGO_PORT === undefined || MONGO_DB === undefined || MONGO_USER === undefined || MONGO_PASS === undefined) {
  throw new Error('You need to set MONGO_HOST and MONGO_PORT env vars');
}

class LosMongoClient {
  clientHandler: MongoClient | null;

  dbHandler: Db | null;

  constructor () {
    this.clientHandler = null;
    this.dbHandler = null;

    this.init();
  }

  async init () {
    const mongoURL: string = `mongodb://${ MONGO_HOST }:${ MONGO_PORT }`;
    const mongoOptions: MongoClientOptions = {
      auth: {
        user: MONGO_USER as string,
        password: MONGO_PASS as string
      },

      // DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, and will be removed in a future version.
      // To use the new Server Discover and Monitoring engine, pass option { useUnifiedTopology: true } to the MongoClient constructor.
      useUnifiedTopology: true
    };

    this.clientHandler = await MongoClient.connect(mongoURL, mongoOptions);
    this.dbHandler = this.clientHandler.db(MONGO_DB);
  }
}

export default new LosMongoClient();
