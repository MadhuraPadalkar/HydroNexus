// Pre-permission explanations + friendly denial handling (Task 2, item 4).
//
// Every native permission is preceded by a short message telling the user
// why the app needs it. If the user declines, we show a friendly note and
// the app keeps working (no blocking, no crash).
// Messages follow the app language (English / Marathi).

import { LANG_STORAGE_KEY, type Lang } from "@/i18n/translations"

export type PermissionKind = "camera" | "location" | "notifications"

function currentLang(): Lang {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) === "mr" ? "mr" : "en"
  } catch {
    return "en"
  }
}

const CONTINUE: Record<Lang, string> = {
  en: "Continue?",
  mr: "पुढे जायचे?",
}

export const PERMISSION_REASONS: Record<PermissionKind, Record<Lang, string>> =
  {
    camera: {
      en: "We need camera / photo access so you can attach a photo of the issue (e.g. a leaking pipe) to your complaint.",
      mr: "तुमच्या तक्रारीला समस्येचा फोटो (उदा. गळणारा पाइप) जोडण्यासाठी आम्हाला कॅमेरा / फोटो परवानगी हवी आहे.",
    },
    location: {
      en: "We need your location so we can tag exactly where the leak or issue is.",
      mr: "गळती किंवा समस्या नेमकी कुठे आहे हे नोंदवण्यासाठी आम्हाला तुमचे ठिकाण हवे आहे.",
    },
    notifications: {
      en: "We need notification permission so we can send you complaint-status and water-supply alerts.",
      mr: "तक्रारीची स्थिती आणि पाणीपुरवठा सूचना पाठवण्यासाठी आम्हाला सूचना परवानगी हवी आहे.",
    },
  }

const DENIED_MESSAGES: Record<PermissionKind, Record<Lang, string>> = {
  camera: {
    en: "No problem — you can still file your complaint without a photo. You can try again any time.",
    mr: "हरकत नाही — फोटोविना तुम्ही तक्रार पाठवू शकता. कधीही पुन्हा प्रयत्न करा.",
  },
  location: {
    en: "No problem — you can still file your complaint without tagging your location. You can try again any time.",
    mr: "हरकत नाही — ठिकाणाविना तुम्ही तक्रार पाठवू शकता. कधीही पुन्हा प्रयत्न करा.",
  },
  notifications: {
    en: "No problem — you can still use the app normally; you just won't get complaint and supply alerts. You can enable notifications later in system settings.",
    mr: "हरकत नाही — अ‍ॅप नेहमीप्रमाणे वापरता येईल; फक्त तक्रार व पुरवठा सूचना मिळणार नाहीत. नंतर सेटिंग्जमध्ये सूचना चालू करता येतील.",
  },
}

/** Show the "why we need it" message. Returns true when the user agrees to continue. */
export function explainWhy(kind: PermissionKind): boolean {
  const lang = currentLang()
  return window.confirm(
    `${PERMISSION_REASONS[kind][lang]}\n\n${CONTINUE[lang]}`,
  )
}

/** Show a friendly message when the user denies a permission. App keeps working. */
export function explainDenial(kind: PermissionKind): void {
  window.alert(DENIED_MESSAGES[kind][currentLang()])
}
