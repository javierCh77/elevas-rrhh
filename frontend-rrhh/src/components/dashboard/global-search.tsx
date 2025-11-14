'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, User, Briefcase, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  type: 'candidate' | 'job'
  title: string
  subtitle: string
  href: string
}

interface SearchResults {
  candidates: SearchResult[]
  jobs: SearchResult[]
}

interface GlobalSearchProps {
  className?: string
  isMobile?: boolean
}

export default function GlobalSearch({ className, isMobile = false }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({
    candidates: [],
    jobs: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar con debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults({ candidates: [], jobs: [] })
      setIsOpen(false)
      return
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true)
      try {
        // Obtener token de localStorage
        const token = localStorage.getItem('auth_token')

        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setResults(data)
          setIsOpen(true)
        } else {
          console.error('Search failed:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error searching:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleResultClick = (href: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(href)
  }

  const totalResults = results.candidates.length + results.jobs.length

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'candidate':
        return <User className="h-4 w-4" />
      case 'job':
        return <Briefcase className="h-4 w-4" />
    }
  }

  const getCategoryTitle = (type: SearchResult['type']) => {
    switch (type) {
      case 'candidate':
        return 'Candidatos'
      case 'job':
        return 'Posiciones'
    }
  }

  const renderResultGroup = (type: SearchResult['type'], items: SearchResult[]) => {
    if (items.length === 0) return null

    return (
      <div className="py-2">
        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {getCategoryTitle(type)} ({items.length})
        </div>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleResultClick(item.href)}
            className={cn(
              "w-full px-3 py-2.5 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer text-left",
              "focus:bg-muted/50 focus:outline-none"
            )}
          >
            <div className="mt-0.5 text-muted-foreground">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {item.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{color: '#9e9e9e'}} />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isMobile ? "Buscar..." : "Buscar candidatos, empleados..."}
          className={cn(
            "pl-10 transition-all duration-300",
            isMobile ? "rounded-2xl" : "rounded-2xl w-80"
          )}
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            borderColor: 'rgba(207, 175, 110, 0.2)',
            backdropFilter: 'blur(10px) saturate(180%)',
            WebkitBackdropFilter: 'blur(10px) saturate(180%)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#cfaf6e'
            e.target.style.boxShadow = '0 4px 16px rgba(207, 175, 110, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            e.target.style.background = 'rgba(255, 255, 255, 0.7)'
            if (query.length >= 2 && totalResults > 0) {
              setIsOpen(true)
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(207, 175, 110, 0.2)'
            e.target.style.boxShadow = 'none'
            e.target.style.background = 'rgba(255, 255, 255, 0.5)'
          }}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && query.length >= 2 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-lg overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 8px 32px rgba(207, 175, 110, 0.15), 0 16px 64px rgba(163, 125, 67, 0.08)',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 9999
          }}
        >
          {totalResults === 0 ? (
            <div className="px-4 py-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No se encontraron resultados para &quot;{query}&quot;
              </p>
            </div>
          ) : (
            <>
              {renderResultGroup('candidate', results.candidates)}
              {renderResultGroup('job', results.jobs)}
            </>
          )}
        </div>
      )}
    </div>
  )
}
