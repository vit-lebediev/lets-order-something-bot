import { SUPPORTED_CITIES } from '../Constants';

export default interface UserProfileInterface {
  tgUserId: number,
  tgUserChatId: number,
  tgIsBot: boolean,
  tgFirstName: string,
  tgLastName?: string,
  tgUsername?: string,
  tgLanguageCode?: string,

  currentCity: SUPPORTED_CITIES,
  lastUpdated?: number
} // eslint-disable-line semi
