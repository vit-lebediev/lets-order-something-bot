import {
  FOOD_CATEGORIES,
  KITCHEN_CATEGORIES,
  SECTIONS,
  USER_STATES
} from '../Constants';

export default interface UserStateInterface {
  userId: number,
  currentState: USER_STATES,
  lastSection: SECTIONS | undefined,
  lastCategory: KITCHEN_CATEGORIES | FOOD_CATEGORIES | undefined,
  lastUpdated: number | undefined,
  lastSelectedPlaces: string | undefined,
} // eslint-disable-line semi
