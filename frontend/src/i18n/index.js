import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import uz from './locales/uz.json'
import ru from './locales/ru.json'
import kk from './locales/kk.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, uz: { translation: uz }, ru: { translation: ru }, kk: { translation: kk } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'uz', 'ru', 'kk'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'discover_me_lang',
    },
    interpolation: { escapeValue: false },
  })

export default i18n
