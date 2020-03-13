/**
 * This type uses snake_case to follow amplitude field notation
 */
export type AmplitudeEvent = {
  user_id: string; // eslint-disable-line camelcase
  event_type: string; // eslint-disable-line camelcase
  user_properties?: { [name: string]: string | undefined }; // eslint-disable-line camelcase
  event_properties?: { [name: string]: string | undefined }; // eslint-disable-line camelcase
  app_version: string; // eslint-disable-line camelcase
  country: string;
  time: number; // in ms
}
