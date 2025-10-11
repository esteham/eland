/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const LanguageCtx = createContext(null);
export const useLanguage = () => useContext(LanguageCtx);

export default function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'bn' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <LanguageCtx.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageCtx.Provider>
  );
}
