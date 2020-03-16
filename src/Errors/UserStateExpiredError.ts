export const USER_STATE_EXPIRED_ERROR_CODE = 'UserStateExpiredError';

export default class UserStateExpiredError extends Error {
  code: string = USER_STATE_EXPIRED_ERROR_CODE;
}
