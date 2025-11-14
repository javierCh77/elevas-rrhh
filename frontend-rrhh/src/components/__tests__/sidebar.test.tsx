import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '@/components/dashboard/sidebar'
import { getCurrentUser } from '@/lib/mock-auth'

// Mock the auth function
jest.mock('@/lib/mock-auth', () => ({
  getCurrentUser: jest.fn(),
}))

const mockUser = {
  id: '1',
  email: 'admin@elevas.com',
  firstName: 'Ana',
  lastName: 'Rodriguez',
  role: 'admin' as const,
  isActive: true
}

describe('Sidebar', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getCurrentUser as jest.Mock).mockReturnValue(mockUser)
  })

  it('renders sidebar correctly when open', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('Elevas')).toBeInTheDocument()
    expect(screen.getByText('HR Platform')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Reclutamiento')).toBeInTheDocument()
    expect(screen.getByText('Empleados')).toBeInTheDocument()
  })

  it('shows user info at bottom', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('Ana Rodriguez')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('expands and collapses menu sections', async () => {
    const user = userEvent.setup()
    render(<Sidebar {...defaultProps} />)

    const reclutamientoButton = screen.getByRole('button', { name: /Reclutamiento/ })

    // Initially expanded (default state)
    expect(screen.getByText('Candidatos')).toBeInTheDocument()
    expect(screen.getByText('Procesos de Selección')).toBeInTheDocument()

    // Collapse
    await user.click(reclutamientoButton)
    expect(screen.queryByText('Candidatos')).not.toBeInTheDocument()

    // Expand again
    await user.click(reclutamientoButton)
    expect(screen.getByText('Candidatos')).toBeInTheDocument()
  })

  it('shows badges for menu items', () => {
    render(<Sidebar {...defaultProps} />)

    // Expand Reclutamiento to see badges
    const candidatesBadge = screen.getByText('12')
    const entrevistasBadge = screen.getByText('3')

    expect(candidatesBadge).toBeInTheDocument()
    expect(entrevistasBadge).toBeInTheDocument()
  })

  it('filters menu items based on user role', () => {
    // Test for colaborador role
    ;(getCurrentUser as jest.Mock).mockReturnValue({
      ...mockUser,
      role: 'colaborador'
    })

    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Empleados')).toBeInTheDocument()
    expect(screen.getByText('Documentos')).toBeInTheDocument()
    expect(screen.queryByText('Reclutamiento')).not.toBeInTheDocument()
    expect(screen.queryByText('EVA - IA Copiloto')).not.toBeInTheDocument()
  })

  it('shows configuration for admin users', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('Configuración')).toBeInTheDocument()
  })

  it('hides configuration for non-admin users', () => {
    ;(getCurrentUser as jest.Mock).mockReturnValue({
      ...mockUser,
      role: 'reclutador'
    })

    render(<Sidebar {...defaultProps} />)

    expect(screen.queryByText('Configuración')).not.toBeInTheDocument()
  })

  it('applies correct CSS classes when closed', () => {
    render(<Sidebar {...defaultProps} isOpen={false} />)

    const sidebar = screen.getByRole('complementary', { hidden: true })
    expect(sidebar).toHaveClass('-translate-x-full')
  })

  it('applies correct CSS classes when open', () => {
    render(<Sidebar {...defaultProps} isOpen={true} />)

    const sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveClass('translate-x-0')
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    render(<Sidebar {...defaultProps} onClose={onClose} />)

    // Find and click the overlay (mobile only)
    const overlay = screen.getByTestId('sidebar-overlay')
    await user.click(overlay)

    expect(onClose).toHaveBeenCalled()
  })
})