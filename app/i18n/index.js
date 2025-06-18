// app/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getI18nOptions } from './settings'; // Import our settings

// Initialize i18next with our options
i18n
  .use(initReactI18next)
  .init(getI18nOptions()); // Use the helper function here

export default i18n;


// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';

// i18n
//   .use(initReactI18next)
//   .init({
//     fallbackLng: 'en',
//     interpolation: {
//       escapeValue: false,
//     },
//     backend: {
//       loadPath: '/locales/{{lng}}/{{ns}}.json',
//     },
//   });

// export default i18n;