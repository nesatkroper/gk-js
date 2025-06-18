// app/i18n/client.js
'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from './index'; // Import the client-side i18n instance

export default function I18nProvider({ children }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}


// 'use client';

// import { I18nextProvider } from 'react-i18next';
// import i18n from './index';

// export default function I18nProvider({ children }) {
//   return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
// }