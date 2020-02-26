export default class Util {
  /**
   * Shuffles the given array
   *
   * @see https://stackoverflow.com/a/12646864/852399
   * @param array
   */
  static shuffle<T> (array: T[]) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [ array[i], array[j] ] = [ array[j], array[i] ]; // eslint-disable-line no-param-reassign
    }

    return array;
  }
}
