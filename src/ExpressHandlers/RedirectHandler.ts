import Logger from '../Logger';
import Amplitude, { AMPLITUDE_EVENTS } from '../Amplitude/Amplitude';
import LosRedisClient from '../LosRedisClient';
import I18n from '../I18n';

export default class RedirectHandler {
  static async handle (req: any, res: any) {
    const redirectUUIDKey = req.query.rid;
    const redirectRedisKey = `redirect_${ redirectUUIDKey }`;

    const obj = await LosRedisClient.hgetallAsync(redirectRedisKey);

    if (!obj) return res.send(I18n.t('general.redirectExpired'));

    const {
      userId,
      placeId,
      placePosition,
      placeUrl
    } = obj;

    const logger = Logger.child({ module: 'Index', userId });

    logger.info(`Redirect request received. Place id: ${ placeId }`);

    // TODO increase user counter for this place

    // send Amplitude event
    await Amplitude.logEvent(userId as unknown as number, AMPLITUDE_EVENTS.USER_CLICKED_ON_PLACE, {
      placeId,
      placePosition
    });

    Amplitude.flush();

    return res.redirect(301, placeUrl);
  }
}
