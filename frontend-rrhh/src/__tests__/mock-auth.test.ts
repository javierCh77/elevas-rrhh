import {
  mockLogin,
  mockLogout,
  getCurrentUser,
  saveUserSession,
  type LoginCredentials,
  type User
} from '@/lib/mock-auth'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('Mock Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  describe('mockLogin', () => {
    it('logs in successfully with correct credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'admin@elevas.com',
        password: 'password123'
      }

      const result = await mockLogin(credentials)

      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe('admin@elevas.com')
      expect(result.user?.role).toBe('admin')
      expect(result.token).toBeDefined()
    })

    it('fails with incorrect password', async () => {
      const credentials: LoginCredentials = {
        email: 'admin@elevas.com',
        password: 'wrongpassword'
      }

      const result = await mockLogin(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Contraseña incorrecta')
      expect(result.user).toBeUndefined()
      expect(result.token).toBeUndefined()
    })

    it('fails with non-existent user', async () => {
      const credentials: LoginCredentials = {
        email: 'nonexistent@elevas.com',
        password: 'password123'
      }

      const result = await mockLogin(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Usuario no encontrado')
    })

    it('logs in all demo users successfully', async () => {
      const demoEmails = [
        'admin@elevas.com',
        'recruiter@elevas.com',
        'manager@elevas.com',
        'colaborador@elevas.com'
      ]

      for (const email of demoEmails) {
        const result = await mockLogin({ email, password: 'password123' })
        expect(result.success).toBe(true)
        expect(result.user?.email).toBe(email)
      }
    })

    it('has proper delay (simulated API call)', async () => {
      const start = Date.now()
      await mockLogin({ email: 'admin@elevas.com', password: 'password123' })
      const end = Date.now()

      expect(end - start).toBeGreaterThanOrEqual(950) // Allow for some timing variance
    })
  })

  describe('mockLogout', () => {
    it('clears localStorage', async () => {
      await mockLogout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('elevas_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('elevas_user')
    })
  })

  describe('saveUserSession', () => {
    it('saves user and token to localStorage', () => {
      const user: User = {
        id: '1',
        email: 'test@elevas.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        isActive: true
      }
      const token = 'test-token'

      saveUserSession(user, token)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'elevas_user',
        JSON.stringify(user)
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith('elevas_token', token)
    })
  })

  describe('getCurrentUser', () => {
    it('returns null when no user in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const user = getCurrentUser()

      expect(user).toBeNull()
    })

    it('returns user when valid session exists', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@elevas.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        isActive: true
      }

      const mockToken = btoa(JSON.stringify({
        userId: '1',
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
      }))

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'elevas_user') return JSON.stringify(mockUser)
        if (key === 'elevas_token') return mockToken
        return null
      })

      const user = getCurrentUser()

      expect(user).toEqual(mockUser)
    })

    it('returns null when token is expired', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@elevas.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        isActive: true
      }

      const expiredToken = btoa(JSON.stringify({
        userId: '1',
        exp: Date.now() - 1000 // Expired 1 second ago
      }))

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'elevas_user') return JSON.stringify(mockUser)
        if (key === 'elevas_token') return expiredToken
        return null
      })

      const user = getCurrentUser()

      expect(user).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('elevas_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('elevas_user')
    })

    it('returns null when localStorage data is corrupted', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'elevas_user') return 'invalid-json'
        if (key === 'elevas_token') return 'invalid-token'
        return null
      })

      const user = getCurrentUser()

      expect(user).toBeNull()
    })
  })
})