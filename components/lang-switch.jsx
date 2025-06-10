'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: 'en', name: 'English', countryCode: 'GB' },
    { code: 'kh', name: 'ខ្មែរ', countryCode: 'KH' },
    { code: 'cn', name: '中文', countryCode: 'CN' },

  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    router.push(pathname.replace(`/${i18n.language}`, `/${lng}`));
  };

  return (
    <div className={i18n.language === 'kh' ? 'font-khmer' : ''}>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center rounded-md p-2 hover:bg-gray-100 focus:outline-none">
          <Languages className="h-4 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="flex items-center gap-2"
            >
              <ReactCountryFlag
                countryCode={lang.countryCode}
                svg
                style={{ width: '1.5em', height: '1.5em' }}
                title={lang.name}
              />
              <span>{lang.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
