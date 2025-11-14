import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/components/auth/login-form'
import { mockLogin } from '@/lib/mock-auth'

// Mock the auth functions
jest.mock('@/lib/mock-auth', () => ({
  mockLogin: jest.fn(),
  saveUserSession: jest.fn(),
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
  })

  it('renders login form correctly', () => {
    render(<LoginForm />)

    expect(screen.getByText('Elevas')).toBeInTheDocument()
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument()
  })

  it('shows demo credential buttons', () => {
    render(<LoginForm />)

    expect(screen.getByText('Credenciales de demostración:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Admin' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reclutador' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Manager' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Colaborador' })).toBeInTheDocument()
  })

  it('fills credentials when demo button is clicked', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const adminButton = screen.getByRole('button', { name: 'Admin' })
    await user.click(adminButton)

    const emailInput = screen.getByLabelText('Correo electrónico') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement

    expect(emailInput.value).toBe('admin@elevas.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement
    const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button

    expect(passwordInput.type).toBe('password')

    await user.click(toggleButton)
    expect(passwordInput.type).toBe('text')

    await user.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    const mockUser = {
      id: '1',
      email: 'admin@elevas.com',
      firstName: 'Ana',
      lastName: 'Rodriguez',
      role: 'admin' as const,
      isActive: true
    }

    ;(mockLogin as jest.Mock).mockResolvedValue({
      success: true,
      user: mockUser,
      token: 'mock-token'
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Correo electrónico')
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

    await user.type(emailInput, 'admin@elevas.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@elevas.com',
        password: 'password123'
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error message on login failure', async () => {
    const user = userEvent.setup()

    ;(mockLogin as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Usuario no encontrado'
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Correo electrónico')
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

    await user.type(emailInput, 'invalid@email.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Usuario no encontrado')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()

    // Mock a delayed response
    ;(mockLogin as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ success: false }), 100))
    )

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Correo electrónico')
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

    await user.type(emailInput, 'test@email.com')
    await user.type(passwordInput, 'password')
    await user.click(submitButton)

    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })
    await user.click(submitButton)

    // HTML5 validation should prevent submission
    expect(mockLogin).not.toHaveBeenCalled()
  })
})