export enum SUPPORTED_CITIES {
  UNKNOWN,
  ODESSA,
  // KIEV
}

export enum USER_STATES {
  WAIT_FOR_LOCATION,
  WAIT_FOR_CITY_CONFIRM,
}

export default interface UserState {
  currentState: USER_STATES,
  currentCity: SUPPORTED_CITIES,
  lastUpdated: number,
}
