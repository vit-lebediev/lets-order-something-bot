import { FOOD_CATEGORIES, KITCHEN_CATEGORIES } from '../Constants';

// TODO Move to Constants
export enum SUPPORTED_CITIES {
  UNKNOWN = 'unknown',
  ODESA = 'odesa',
  // KYIV = 'kyiv'
}

// TODO Move to Constants
export enum USER_STATES {
  WAIT_FOR_LOCATION = 'WAIT_FOR_LOCATION',
  WAIT_FOR_SECTION = 'WAIT_FOR_SECTION',
  WAIT_FOR_KITCHEN = 'WAIT_FOR_KITCHEN',
  WAIT_FOR_FOOD_CATEGORY = 'WAIT_FOR_FOOD_CATEGORY',
  WAIT_FOR_REPEAT_OR_RESTART = 'WAIT_FOR_REPEAT_OR_RESTART',
  WAIT_FOR_CITY_CONFIRM = 'WAIT_FOR_CITY_CONFIRM',
}

// TODO Move to Constants
export enum SECTIONS {
  LUCKY = 'LUCKY',
  FOOD = 'FOOD',
  KITCHEN = 'KITCHEN'
}

export default interface UserStateInterface {
  userId: number,
  currentState: USER_STATES | undefined,
  currentCity: SUPPORTED_CITIES | undefined,
  lastSection: SECTIONS | undefined,
  lastCategory: KITCHEN_CATEGORIES | FOOD_CATEGORIES | undefined,
  lastUpdated: number | undefined,
} // eslint-disable-line semi
