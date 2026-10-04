import { Capacitor } from "@capacitor/core"
import { App } from "@capacitor/app"
import type { createBrowserRouter } from "react-router-dom"

type Router = ReturnType<typeof createBrowserRouter>

let started = false

/**
 * Hardware back button (Task 5):
 * - On the home screen ("/") or splash ("/welcome") the app exits.
 * - Everywhere else it navigates back inside the app.
 * - No-ops on web so desktop/mobile browsers keep default behaviour.
 */
export function initHardwareBackButton(router: Router): void {
  if (started) return
  started = true

  if (!Capacitor.isNativePlatform()) return

  App.addListener("backButton", () => {
    const pathname = router.state.location.pathname
    if (pathname === "/" || pathname === "/welcome") {
      App.exitApp()
    } else if (window.history.length > 1) {
      router.navigate(-1)
    } else {
      router.navigate("/")
    }
  })
}
