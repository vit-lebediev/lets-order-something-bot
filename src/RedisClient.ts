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

  public readonly hgetallAsync = promisify(this.hgetall).bind(this);
}
