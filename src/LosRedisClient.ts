import { promisify } from 'util';
import { RedisClient } from 'redis';

import Logger from './Logger';

const logger = Logger.child({ module: 'LosRedisClient' });

const REDIS_HOST: string | undefined = process.env.LOS_REDIS_HOST;
const REDIS_PORT: string | number | undefined = process.env.LOS_REDIS_PORT;

if (REDIS_HOST === undefined || !REDIS_PORT === undefined) {
  throw new Error('You need to set REDIS_HOST and REDIS_PORT env vars');
}

/**
 * Async/await wrapper class around RedisClient.
 *
 * TODO It would be nice to make those properties a methods, so that they
 *  show up as methods when called
 *
 * @see https://stackoverflow.com/a/59526836/852399
 */
class LosRedisClient extends RedisClient {
  public readonly getAsync = promisify(this.get).bind(this);

  public readonly setAsync = promisify(this.set).bind(this);

  public readonly hmsetAsync = promisify(this.hmset).bind(this);
  // public readonly hmsetAsync: (key: [string, ...(string | number)[]], item: Object) => Promise<'OK'> = promisify(this.hmset).bind(this);
  // public readonly hmsetAsync: (key: string, item: string) => Promise<'OK'> = promisify(this.hmset).bind(this);
  // public readonly hmsetAsync: (key: string, item: Object) => Promise<'OK'> = (key: string, item: Object) => {
  //   return new Promise((resolve, reject) => {
  //     this.hmset(key, item, (error: Error, result: 'OK') => {
  //       if (error) reject(error);
  //       else resolve(result);
  //     });
  //   });
  // };

  public readonly hgetallAsync = promisify(this.hgetall).bind(this);

  public readonly expireAsync = promisify(this.expire).bind(this);
}

const redisClient: LosRedisClient = new LosRedisClient({
  host: REDIS_HOST,
  port: REDIS_PORT as unknown as number // this shitty line is to make (strict) linter happy
});

redisClient.on('error', (err) => logger.error(`REDIS ERROR: ${ err }`));

export default redisClient;
