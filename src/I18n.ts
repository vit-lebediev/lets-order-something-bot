import i18n from 'i18n';

import Logger from './Logger';

import ConfigurationOptions = i18n.ConfigurationOptions;
import Replacements = i18n.Replacements;


const ENV = process.env.LOS_BOT_ENV;

const logger = Logger.child({ module: 'i18n' });

const supportedLocales = [ 'uk', 'ru', 'en' ];

const i18nOptions: ConfigurationOptions = {
  locales: supportedLocales,

  directory: `${ __dirname }/../resources/locales`,
  autoReload: ENV === 'DEV', // watch for changes in json files to reload locale on updates
  updateFiles: false, // whether to write new locale information to disk
  objectNotation: true,

  logDebugFn: (msg) => logger.debug(msg),
  logWarnFn: (msg) => logger.warn(msg),
  logErrorFn: (msg) => logger.error(msg)
};

i18n.configure(i18nOptions);

class I18n {
  locale: string;

  constructor (locale: string) {
    if (supportedLocales.indexOf(locale) !== 1) {
      throw new Error(`Locale ${ locale } is not supported`);
    }

    this.locale = locale;
  }

  t (msgKey: string, replacements?: Replacements) {
    return replacements ? i18n.__({ // eslint-disable-line no-underscore-dangle
      phrase: msgKey,
      locale: this.locale
    }, replacements) : i18n.__({ // eslint-disable-line no-underscore-dangle
      phrase: msgKey,
      locale: this.locale
    });
  }
}

export default new I18n('ru');
