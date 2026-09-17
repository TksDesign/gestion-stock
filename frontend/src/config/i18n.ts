import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationFR from '../locales/fr/translation.json';
import translationEN from '../locales/en/translation.json';

const resources = {
  fr: {
    translation: translationFR
  },
  en: {
    translation: translationEN
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Langue par défaut
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React échappe déjà les valeurs par défaut
    }
  });

export default i18n;
