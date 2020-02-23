export enum SUPPORTED_CITIES {
  UNKNOWN = 'unknown',
  ODESA = 'odesa',
  // KIEV
}

export enum USER_STATES {
  WAIT_FOR_LOCATION = 'WAIT_FOR_LOCATION',
  WAIT_FOR_FOOD_CATEGORY = 'WAIT_FOR_FOOD_CATEGORY',
  WAIT_FOR_CITY_CONFIRM = 'WAIT_FOR_CITY_CONFIRM',
}

export default interface UserStateInterface {
  userId: number | undefined,
  currentState: USER_STATES | undefined,
  currentCity: SUPPORTED_CITIES | undefined,
  lastUpdated: number | undefined,
} // eslint-disable-line semi
