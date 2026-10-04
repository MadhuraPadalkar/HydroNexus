import { Capacitor } from "@capacitor/core"
import { PushNotifications } from "@capacitor/push-notifications"
import { explainDenial, explainWhy } from "./permissions"

let initialized = false

/**
 * Register for push notifications and log the FCM token.
 * - Only runs when VITE_ENABLE_PUSH=true. Otherwise does nothing
 *   (register() is never called).
 * - No-ops on web (logs and returns) so the app keeps working everywhere.
 * - Shows a short rationale before the system permission prompt.
 * - If the user denies, shows a friendly message and the app keeps working.
 * - Assumes google-services.json is added manually into android/app/.
 */
export async function initPushNotifications(): Promise<void> {
  if (initialized) return
  initialized = true

  if (import.meta.env.VITE_ENABLE_PUSH !== "true") {
    console.info("[push] push notifications disabled (VITE_ENABLE_PUSH!=true)")
    return
  }

  try {
    if (!Capacitor.isNativePlatform()) {
      console.info("[push] push notifications skipped (not a native platform)")
      return
    }

    if (!explainWhy("notifications")) {
      explainDenial("notifications")
      return
    }

    let status = await PushNotifications.checkPermissions()
    if (status.receive !== "granted") {
      status = await PushNotifications.requestPermissions()
    }
    if (status.receive !== "granted") {
      explainDenial("notifications")
      return
    }

    try {
      await PushNotifications.register()
    } catch (err) {
      console.warn("[push] register() failed:", err)
      return
    }

    await PushNotifications.addListener("registration", (token) => {
      console.info("[push] registration token:", token.value)
    })
    await PushNotifications.addListener("registrationError", (err) => {
      console.warn("[push] registration error:", err.error)
    })
    await PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        console.info("[push] notification received:", notification)
      },
    )
    await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action) => {
        console.info("[push] notification action:", action)
      },
    )
  } catch (err) {
    console.warn("[push] push notifications unavailable:", err)
  }
}
