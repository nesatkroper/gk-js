// app/i18n/settings.js
export const FALLBACK_LOCALE = 'en'; // Our default language if detected language isn't supported
export const DEFAULT_NAMESPACE = 'common'; // Default namespace for translations (e.g., common.json)
export const COOKIE_NAME = 'i18next'; // Name of the cookie to store language preference

// Define all supported languages
export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', countryCode: 'GB' },
  { code: 'kh', name: 'ខ្មែរ', countryCode: 'KH' },
  { code: 'zh', name: '中文', countryCode: 'CN' }, // Using 'zh' for standard Chinese
];

// Helper function to get i18next options
export function getI18nOptions(lng = FALLBACK_LOCALE, ns = DEFAULT_NAMESPACE) {
  return {
    supportedLngs: SUPPORTED_LOCALES.map(loc => loc.code), // Get just the codes
    fallbackLng: FALLBACK_LOCALE,
    lng,
    ns,
    defaultNS: DEFAULT_NAMESPACE,
    fallbackNS: DEFAULT_NAMESPACE,
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to your translation files
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  };
}


// export const languages = ['en', 'kh', 'cn']; 
// export const defaultLanguage = 'en';
// export const cookieName = 'i18next';

// export function getOptions(lng = defaultLanguage, ns = 'common') {
//     return {
//         supportedLngs: languages,
//         fallbackLng: defaultLanguage,
//         lng,
//         ns,
//         defaultNS: 'common',
//         fallbackNS: 'common',
//         backend: {
//             loadPath: '/locales/{{lng}}/{{ns}}.json',
//         },
//         interpolation: {
//             escapeValue: false,
//         },
//     };
// }

// export const i18n = {
//     defaultLocale: defaultLanguage,
//     locales: languages, 
//     localeDetection: true,
// };
