import type { ApiError, ApiResponse } from "@water/types"

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

export class HttpClient {
  private baseUrl: string
  private tokenKey: string

  constructor(baseUrl = "", tokenKey = "hydronexus_token") {
    this.baseUrl = baseUrl
    this.tokenKey = tokenKey
  }

  setToken(token: string) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(this.tokenKey, token)
    }
  }

  getToken(): string | null {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(this.tokenKey)
    }
    return null
  }

  clearToken() {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(this.tokenKey)
    }
  }

  async request<T,>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const { params, headers, ...customConfig } = options

    let url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint}`

    if (params) {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
      const qs = queryParams.toString()
      if (qs) {
        url += (url.includes("?") ? "&" : "?") + qs
      }
    }

    const token = this.getToken()
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...customConfig,
        headers: {
          ...defaultHeaders,
          ...headers,
        },
      })

      if (!response.ok) {
        let errorData: ApiError
        try {
          const json = await response.json()
          errorData = {
            message: json.message || response.statusText || "An error occurred",
            code: json.code,
            status: response.status,
            details: json.details,
          }
        } catch {
          errorData = {
            message: response.statusText || "Network response was not ok",
            status: response.status,
          }
        }
        throw errorData
      }

      const json = await response.json()
      return json
    } catch (err: unknown) {
      if ((err as ApiError).message) {
        throw err
      }
      const networkError: ApiError = {
        message: err instanceof Error ? err.message : "Unknown network error",
        status: 0,
      }
      throw networkError
    }
  }

  get<T,>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  post<T,>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  put<T,>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  patch<T,>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T,>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

export const http = new HttpClient()
