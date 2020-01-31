import { promisify } from 'util';
import { RedisClient } from 'redis';

const REDIS_HOST: string = process.env.LOS_REDIS_HOST || 'localhost';
const REDIS_PORT: string | number = process.env.LOS_REDIS_PORT || 8001;

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

  public readonly hgetallAsync = promisify(this.hgetall).bind(this);
}

export default new LosRedisClient({
  host: REDIS_HOST,
  port: REDIS_PORT as number
});
