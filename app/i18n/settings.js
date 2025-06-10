export const languages = ['en', 'kh'];
export const defaultLanguage = 'en';
export const cookieName = 'i18next';

export function getOptions(lng = defaultLanguage, ns = 'common') {
  return {
    supportedLngs: languages,
    fallbackLng: defaultLanguage,
    lng,
    ns,
    defaultNS: 'common',
    fallbackNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
  };
}

export const i18n = {
  defaultLocale: defaultLanguage,
  locales: languages,
  localeDetection: true,
};