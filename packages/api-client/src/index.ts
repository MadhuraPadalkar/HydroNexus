export * from "@water/types"
export * from "./http"
export * from "./services"
export * from "./mocks/data"

export function isMockMode(): boolean {
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // @ts-ignore
    return import.meta.env.VITE_USE_MOCKS !== "false"
  }
  return true
}
