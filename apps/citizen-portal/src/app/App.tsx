import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./routes"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { LanguageProvider } from "@/i18n/LanguageContext"
import { initPushNotifications } from "@/services/push"
import { initHardwareBackButton } from "@/services/hardwareBack"

export default function App() {
  useEffect(() => {
    initPushNotifications()
    initHardwareBackButton(router)
  }, [])

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </ErrorBoundary>
  )
}
