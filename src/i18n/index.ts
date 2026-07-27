import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhTW from './locales/zh-TW.json'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'

const savedLang = (() => {
  try {
    return localStorage.getItem('fieldguard-lang') || 'zh-TW'
  } catch {
    return 'zh-TW'
  }
})()

i18n.use(initReactI18next).init({
  resources: {
    'zh-TW': { translation: zhTW },
    'zh-CN': { translation: zhCN },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'zh-TW',
  interpolation: { escapeValue: false },
})

export default i18n
