// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Queue item for handling failed requests during token refresh
interface QueueItem {
  resolve: (value: null) => void
  reject: (error: unknown) => void
}

// AI Analysis interfaces
interface CandidateAnalysisResult {
  summary: string
  scores: {
    experience: number
    technicalSkills: number
    professionalProfile: number
    culturalFit: number
  }
  strengths: string[]
  redFlags: string[]
  recommendation: string
}

interface AiSummaryData {
  summary: string
  analysis?: string
  scores?: Record<string, number>
  [key: string]: unknown
}

// API Client
class ApiClient {
  private baseURL: string
  private isRefreshing = false
  private failedQueue: QueueItem[] = []

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = this.getStoredToken()
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      const response = await fetch(url, config)

      if (response.status === 401 && !isRetry && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
        // Token might be expired, try to refresh
        return this.handleTokenRefresh<T>(endpoint, options)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T
      }

      // Check if response has
      //  content before parsing JSON
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }

      return {} as T
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('API request failed:', error)
      }
      throw error
    }
  }

  private async handleTokenRefresh<T>(endpoint: string, originalOptions: RequestInit): Promise<T> {
    if (this.isRefreshing) {
      // If already refreshing, queue the request
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject })
      }).then(() => {
        return this.request<T>(endpoint, originalOptions, true)
      })
    }

    this.isRefreshing = true

    try {
      const refreshToken = this.getStoredRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      // Try to refresh the token
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const tokenData = await response.json()

      // Store new tokens
      this.storeTokens(tokenData)

      // Process queued requests
      this.failedQueue.forEach(({ resolve }) => resolve(null))
      this.failedQueue = []

      // Retry original request with new token
      return this.request<T>(endpoint, originalOptions, true)

    } catch (error) {
      // Refresh failed, clear tokens and redirect to login
      this.failedQueue.forEach(({ reject }) => reject(error))
      this.failedQueue = []

      this.clearStorage()

      // Trigger a page reload to let RouteGuard handle the redirect
      if (typeof window !== 'undefined') {
        window.location.reload()
      }

      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // Upload file with FormData
  async postFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const token = this.getStoredToken()
    const headers: HeadersInit = {}

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // Don't set Content-Type header for FormData - browser will set it automatically with boundary

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      })

      if (response.status === 401) {
        return this.handleTokenRefresh<T>(endpoint, { method: 'POST', body: formData })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('File upload failed:', error)
      }
      throw error
    }
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_refresh_token')
  }

  private storeTokens(tokens: { accessToken: string; refreshToken: string }): void {
    if (typeof window === 'undefined') return

    localStorage.setItem('auth_token', tokens.accessToken)
    localStorage.setItem('auth_refresh_token', tokens.refreshToken)
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_user')
  }

  // EVA AI Analysis
  async analyzeCandidateSummary(
    candidateEmail: string,
    jobTitle: string,
    jobDescription: string,
    resumeUrl: string
  ): Promise<CandidateAnalysisResult> {
    return this.request('/eva/analyze-candidate-summary', {
      method: 'POST',
      body: JSON.stringify({
        candidateEmail,
        jobTitle,
        jobDescription,
        resumeUrl
      })
    })
  }

  // AI Summary Management
  async saveAiSummary(applicationId: string, summaryData: AiSummaryData, analyzedById?: string): Promise<{ success: boolean; id: string }> {
    return this.request(`/applications/${applicationId}/ai-summary`, {
      method: 'POST',
      body: JSON.stringify({ summaryData, analyzedById })
    })
  }

  async getAiSummary(applicationId: string): Promise<AiSummaryData | null> {
    return this.request(`/applications/${applicationId}/ai-summary`, {
      method: 'GET'
    })
  }
}

export const api = new ApiClient(API_BASE_URL)