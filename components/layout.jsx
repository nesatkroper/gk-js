import Head from 'next/head';
import { useTranslation } from 'react-i18next';

export default function Layout({ children, pageTitle }) {
  const { t } = useTranslation('common');
  const siteName = 'FertilizerMS';
  const fullTitle = pageTitle ? `${t(pageTitle)} - ${siteName}` : siteName;

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={t('app_description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {children}
    </>
  );
}