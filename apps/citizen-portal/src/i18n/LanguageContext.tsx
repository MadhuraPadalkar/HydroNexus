import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  LANG_STORAGE_KEY,
  translations,
  type AppStrings,
  type Lang,
} from "./translations"

interface LanguageValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: AppStrings
}

const LanguageContext = createContext<LanguageValue>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
})

function loadLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (saved === "en" || saved === "mr") return saved
  } catch {
    // storage unavailable (private mode etc.) — fall back to English
  }
  return "en"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l)
    } catch {
      // ignore persistence failures; app keeps working in-memory
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageValue {
  return useContext(LanguageContext)
}
