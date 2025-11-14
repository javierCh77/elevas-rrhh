// Backend-aligned User types
export type UserRole = 'admin' | 'hr' | 'manager' | 'employee'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  // Core Identity
  id: string
  email: string
  firstName: string
  lastName: string

  // Role & Status
  role: UserRole
  status: UserStatus

  // Profile Information
  department?: string
  position?: string
  phone?: string
  avatarUrl?: string

  // Security & Tracking
  lastLoginAt?: string
  passwordChangedAt?: string
  loginAttempts: number
  lockedUntil?: string

  // Password Reset
  resetPasswordToken?: string
  resetPasswordExpires?: string

  // Timestamps
  createdAt: string
  updatedAt: string
}

// DTOs for API requests
export interface CreateUserDTO {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: UserRole
  department?: string
  position?: string
  phone?: string
}

export interface UpdateUserDTO {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  role?: UserRole
  department?: string
  position?: string
  phone?: string
}

export interface UserFilters {
  search?: string
  role?: UserRole | 'all'
  status?: UserStatus | 'all'
  department?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// API Response types
export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface LoginCredentials {
  email: string
  password: string
}

export type RegisterData = CreateUserDTO

// Form data types for UI
export interface UserFormData {
  firstName: string
  lastName: string
  email: string
  role: UserRole | ''
  department: string
  position: string
  phone: string
  status: UserStatus
  changePassword: boolean
  newPassword: string
  confirmPassword: string
}

export interface UserSearchFilters {
  searchTerm: string
  roleFilter: UserRole | 'all'
  statusFilter: UserStatus | 'all'
  currentPage: number
  itemsPerPage: number
}

// Department options
export const DEPARTMENTS = [
  'IT',
  'Recursos Humanos',
  'Ventas',
  'Marketing',
  'Contabilidad',
  'Operaciones',
  'Legal',
  'Administración'
] as const

export type Department = typeof DEPARTMENTS[number]

// Role display names
export const ROLE_NAMES: Record<UserRole, string> = {
  admin: 'Administrador',
  hr: 'Recursos Humanos',
  manager: 'Gerente',
  employee: 'Empleado'
}

// Status display names
export const STATUS_NAMES: Record<UserStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido'
}

// Dashboard Types
export interface DashboardStats {
  candidatesCount: number
  candidatesChange: string
  candidatesTrend: 'up' | 'down'

  openPositions: number
  openPositionsChange: string
  openPositionsTrend: 'up' | 'down'

  todayInterviews: number
  todayInterviewsChange: string
  todayInterviewsTrend: 'up' | 'down'

  avgTimeToHire: number
  avgTimeToHireChange: string
  avgTimeToHireTrend: 'up' | 'down'
}

export interface DashboardActivity {
  id: string
  type: 'application' | 'interview' | 'offer' | 'evaluation'
  title: string
  description: string
  time: string
  avatar?: string
  candidateName?: string
}

export interface DashboardInterview {
  id: string
  candidateName: string
  candidateId: string
  position: string
  time: string
  date: string
  interviewer: string
  type: 'Técnica' | 'Cultural' | 'HR'
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface Job {
  id: string
  title: string
  department: string
  status: 'draft' | 'published' | 'paused' | 'closed'
  isPublic: boolean
  description?: string
  requirements?: string
  benefits?: string
  location?: string
  salaryRange?: string
  applicationCount?: number
  createdAt: string
  updatedAt: string
}

export interface Application {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dni: string
  location: string
  cvUrl?: string
  coverLetter?: string
  status: 'applied' | 'under_review' | 'interview_scheduled' | 'interviewed' | 'offer_made' | 'hired' | 'rejected'
  jobId: string
  job?: Job
  createdAt: string
  updatedAt: string
}

// Candidate types
export type CandidateStatus = 'active' | 'inactive' | 'blacklisted'

export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dni?: string
  location?: string
  experience?: string
  skills?: string[]
  status: CandidateStatus
  source?: string
  linkedinUrl?: string
  resumeUrl?: string
  addedAt: string
  lastUpdate: string
  applications?: Application[]
}

// AI Analysis types
export interface AIScores {
  experience: number
  technicalSkills: number
  professionalProfile: number
  culturalFit: number
}

export interface AIAnalysis {
  id?: string
  candidateId: string
  candidateName?: string
  summary: string
  scores: AIScores
  analysis: string
  strengths: string[]
  redFlags: string[]
  recommendation: 'Altamente Recomendado' | 'Recomendado' | 'Neutral' | 'No Recomendado'
  analyzedAt?: string
}

export interface ExperienceAnalysis {
  relevant?: Array<{
    role: string
    company?: string
    duration?: string
    description?: string
  }>
  total?: string
  highlights?: string[]
}

export interface AIAnalysisData {
  summary: string
  experienceAnalysis: ExperienceAnalysis
  strengths: string[]
  concerns: string[]
  recommendation: string
  fitScore?: number
}

// Message types
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  candidateId?: string
  applicationId?: string
}

export interface WhatsAppMessage {
  id: string
  from: string
  to: string
  message: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  direction: 'inbound' | 'outbound'
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ErrorWithMessage {
  message: string
}

// Type guard for error handling
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    return new Error(String(maybeError))
  }
}

export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message
}