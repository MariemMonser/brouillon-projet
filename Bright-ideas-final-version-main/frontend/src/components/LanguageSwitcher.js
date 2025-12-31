import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/languageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    // Update document direction for RTL languages
    if (langCode === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = langCode;
    }
  };

  return (
    <div className="language-switcher">
      <div className="language-switcher-dropdown">
        <button className="language-switcher-button">
          <span className="current-flag">
            {languages.find(lang => lang.code === i18n.language)?.flag || '🌐'}
          </span>
          <span className="current-language">
            {languages.find(lang => lang.code === i18n.language)?.name || 'English'}
          </span>
          <span className="dropdown-arrow">▼</span>
        </button>
        <div className="language-switcher-menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span className="flag">{lang.flag}</span>
              <span className="name">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;



