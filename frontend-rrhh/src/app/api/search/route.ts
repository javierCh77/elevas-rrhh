import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

interface CandidateRaw {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

interface JobRaw {
  id: string
  title: string
  department?: string
  status?: string
}

interface SearchResult {
  id: string
  type: 'candidate' | 'job'
  title: string
  subtitle: string
  href: string
}

interface CandidatesResponse {
  candidates?: CandidateRaw[]
}

interface JobsResponse {
  data?: JobRaw[]
  jobs?: JobRaw[]
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.toLowerCase() || ''

  if (query.length < 2) {
    return NextResponse.json({
      candidates: [],
      jobs: []
    })
  }

  try {
    // Obtener token de autenticación
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('access_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Buscar candidatos y jobs en paralelo
    const [candidatesResponse, jobsResponse] = await Promise.all([
      fetch(`${BACKEND_URL}/candidates?search=${encodeURIComponent(query)}&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${BACKEND_URL}/jobs?search=${encodeURIComponent(query)}&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    ])

    const candidatesData: CandidatesResponse | CandidateRaw[] = candidatesResponse.ok
      ? await candidatesResponse.json()
      : { candidates: [] }

    const jobsData: JobsResponse | JobRaw[] = jobsResponse.ok
      ? await jobsResponse.json()
      : []

    // Formatear candidatos - el backend devuelve { candidates: [], total: number }
    const candidatesList = Array.isArray(candidatesData)
      ? candidatesData
      : (candidatesData.candidates || [])

    const candidates: SearchResult[] = candidatesList
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        type: 'candidate' as const,
        title: `${c.firstName} ${c.lastName}`,
        subtitle: c.email || c.phone || 'Sin información',
        href: `/dashboard/candidates/${c.id}`
      }))

    // Formatear jobs - el backend devuelve array directamente o { data: [] }
    const jobsList = Array.isArray(jobsData)
      ? jobsData
      : (jobsData.data || jobsData.jobs || [])

    const jobs: SearchResult[] = jobsList
      .slice(0, 5)
      .map((j) => ({
        id: j.id,
        type: 'job' as const,
        title: j.title,
        subtitle: `${j.department || 'Sin departamento'} - ${j.status || 'Sin estado'}`,
        href: `/dashboard/jobs/${j.id}`
      }))

    return NextResponse.json({
      candidates,
      jobs
    })

  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error searching:', error)
    }
    return NextResponse.json({
      candidates: [],
      jobs: []
    })
  }
}
