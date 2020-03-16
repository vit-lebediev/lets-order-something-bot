import Axios from 'axios';

import Logger from '../Logger';
import { AmplitudeEvent } from './AmplitudeEvent';
import { version } from '../../package.json';
import UserStateInterface from '../UserState/UserStateInterface';
import UserStateManager from '../UserState/UserStateManager';
import UserProfileInterface from '../UserProfile/UserProfileInterface';
import UserProfileManager from '../UserProfile/UserProfileManager';

const logger = Logger.child({ module: 'Amplitude' });

const AMPLITUDE_API_URL = 'https://api.amplitude.com/2/httpapi';

const { LOS_AMPLITUDE_API_KEY } = process.env;

if (LOS_AMPLITUDE_API_KEY === undefined) {
  throw new Error('You need to specify LOS_AMPLITUDE_API_KEY env parameter');
}

export enum AMPLITUDE_EVENTS {
  USER_SELECTED_START = 'userSelectedStart',
  USER_SELECTED_SETTINGS = 'userSelectedSettings',
  USER_SELECTED_HELP = 'userSelectedHelp',
  USER_SELECTED_I_FEEL_LUCKY = 'userSelectedIFeelLucky',
  USER_SELECTED_REPEAT = 'userSelectedRepeat',
  USER_SELECTED_RESTART = 'userSelectedRestart',
  USER_SELECTED_KITCHENS_SECTION = 'userSelectedKitchensSection',
  USER_SELECTED_KITCHEN = 'userSelectedKitchen',
  USER_SELECTED_FOOD_SECTION = 'userSelectedFoodSection',
  USER_SELECTED_FOOD = 'userSelectedFood',
  USER_SELECTED_FEEDBACK_SECTION = 'userSelectedFeedbackSection',
  USER_SELECTED_CITY = 'userSelectedCity',
  USER_LEFT_FEEDBACK = 'userLeftFeedback',
  USER_ENTERED_OTHER_CITY = 'userEnteredOtherCity',
  USER_CLICKED_ON_PLACE = 'userClickedOnPlace'
}

class Amplitude {
  private readonly apiKey: string;

  private readonly appVersion: string;

  private readonly eventsBatch: AmplitudeEvent[];

  private flushInProgress: boolean;

  constructor (apiKey: string, appVersion: string) {
    this.apiKey = apiKey;
    this.appVersion = appVersion;
    this.eventsBatch = [];
    this.flushInProgress = false;
  }

  async logEvent (
      userId: number,
      eventType: string,
      eventProperties?: { [name: string]: string | undefined },
      userProperties?: { [name: string]: string | undefined }
  ): Promise<void> {
    logger.info(`Logging event ${ eventType }`);

    const userState: UserStateInterface | null = await UserStateManager.getUserStateById(userId);
    const userProfile: UserProfileInterface | null = await UserProfileManager.getUserProfileById(userId);

    const fullUserProps = {
      currentState: userState?.currentState,
      currentCity: userProfile?.currentCity,
      ...userProperties
    };

    const country = 'Ukraine';
    const time = Date.now();

    const event: AmplitudeEvent = {
      user_id: userId.toString(),
      event_type: eventType,
      user_properties: fullUserProps,
      event_properties: eventProperties,
      app_version: this.appVersion,
      country,
      time
    };

    this.eventsBatch.push(event);
  }

  /**
   * This method should be called at the end of any handler chain, most conveniently
   * in "answer" functions. Need to keep an eye to call it only once.
   */
  async flush (): Promise<void> {
    if (this.eventsBatch.length === 0 || this.flushInProgress) return;

    this.flushInProgress = true;

    logger.info(`Flushing event batch of size ${ this.eventsBatch.length }`);

    const amplitudePayload = {
      api_key: this.apiKey,
      events: this.eventsBatch
    };

    try {
      const ampAns = await Axios.post(AMPLITUDE_API_URL, amplitudePayload);
      logger.info(
          `Successfully sent amplitude events. Payload size: ${ ampAns.data.payload_size_bytes }. Events ingested: ${ ampAns.data.events_ingested }`,
          { userId: this.eventsBatch[0].user_id }
      );
    } catch (e) {
      logger.error(`Error sending amplitude events: ${ e.message }`, { userId: this.eventsBatch[0].user_id });
    } finally {
      this.eventsBatch.length = 0;
      this.flushInProgress = false;
    }
  }
}

export default new Amplitude(LOS_AMPLITUDE_API_KEY, version);
