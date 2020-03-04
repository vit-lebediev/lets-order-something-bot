import {
  FOOD_CATEGORIES,
  KITCHEN_CATEGORIES,
  SECTIONS,
  SUPPORTED_CITIES,
  USER_STATES
} from '../Constants';

export default interface UserStateInterface {
  userId: number,
  currentState: USER_STATES | undefined,
  currentCity: SUPPORTED_CITIES | undefined,
  lastSection: SECTIONS | undefined,
  lastCategory: KITCHEN_CATEGORIES | FOOD_CATEGORIES | undefined,
  lastUpdated: number | undefined,
} // eslint-disable-line semi
