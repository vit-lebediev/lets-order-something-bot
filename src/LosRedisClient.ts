import { promisify } from 'util';
import { RedisClient } from 'redis';

/**
 * Async/await wrapper class around RedisClient.
 *
 * TODO It would be nice to make those properties a methods, so that they
 *  show up as methods when called
 *
 * @see https://stackoverflow.com/a/59526836/852399
 */
export default class LosRedisClient extends RedisClient {
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
}
