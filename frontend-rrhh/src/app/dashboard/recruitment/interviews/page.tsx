'use client'

import { useState, useMemo } from 'react'
import { useInterviews, type Interview } from '@/hooks/useInterviews'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarClock,
  Star,
  Briefcase
} from 'lucide-react'
import { formatDateAR, formatTimeAR } from '@/lib/date-utils'

// Calendar helpers
const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

// Interview type configuration
const interviewTypeConfig = {
  phone: { label: 'Telefónica', icon: Phone, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  video: { label: 'Video', icon: Video, color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  'in-person': { label: 'Presencial', icon: Users, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  technical: { label: 'Técnica', icon: Briefcase, color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' }
}

// Interview status configuration
const statusConfig = {
  scheduled: { label: 'Programada', icon: CalendarClock, color: 'bg-blue-500', textColor: 'text-blue-700' },
  completed: { label: 'Completada', icon: CheckCircle2, color: 'bg-green-500', textColor: 'text-green-700' },
  cancelled: { label: 'Cancelada', icon: XCircle, color: 'bg-red-500', textColor: 'text-red-700' },
  'no-show': { label: 'No asistió', icon: AlertCircle, color: 'bg-gray-500', textColor: 'text-gray-700' },
  rescheduled: { label: 'Reprogramada', icon: CalendarClock, color: 'bg-amber-500', textColor: 'text-amber-700' }
}

export default function InterviewsPage() {
  const { loading, getInterviewsByDate, getInterviewStats } = useInterviews()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const stats = getInterviewStats()

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const days: Array<{ date: number; isCurrentMonth: boolean; interviews: Interview[] }> = []

    // Previous month days
    const prevMonthDays = getDaysInMonth(year, month - 1)
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i)
      days.push({
        date: prevMonthDays - i,
        isCurrentMonth: false,
        interviews: getInterviewsByDate(date)
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      days.push({
        date: i,
        isCurrentMonth: true,
        interviews: getInterviewsByDate(date)
      })
    }

    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date: i,
        isCurrentMonth: false,
        interviews: getInterviewsByDate(date)
      })
    }

    return days
  }, [currentDate, getInterviewsByDate])

  // Get selected day interviews
  const selectedDayInterviews = useMemo(() => {
    if (!selectedDate) return []
    return getInterviewsByDate(selectedDate).sort((a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )
  }, [selectedDate, getInterviewsByDate])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleDateClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return

    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(newDate)
  }

  const isToday = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number, isCurrentMonth: boolean) => {
    if (!selectedDate || !isCurrentMonth) return false
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-96 mb-2" />
          <Skeleton className="h-4 w-128" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendario de Entrevistas</h1>
        <p className="text-gray-600">Organiza y gestiona todas tus entrevistas en un solo lugar</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entrevistas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Programadas</p>
                <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CalendarClock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-3xl font-bold text-purple-600">{stats.today}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Hoy
                </Button>
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarData.map((day, index) => {
                const isCurrentDay = isToday(day.date, day.isCurrentMonth)
                const isSelectedDay = isSelected(day.date, day.isCurrentMonth)
                const hasInterviews = day.interviews.length > 0

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
                    className={`
                      relative min-h-[80px] p-2 rounded-lg border-2 transition-all
                      ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 opacity-50'}
                      ${isCurrentDay ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}
                      ${isSelectedDay ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : ''}
                      ${day.isCurrentMonth ? 'hover:border-gray-300 hover:shadow-sm cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <span className={`
                      text-sm font-medium
                      ${isCurrentDay ? 'text-amber-700' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    `}>
                      {day.date}
                    </span>

                    {/* Interview indicators */}
                    {hasInterviews && day.isCurrentMonth && (
                      <div className="mt-1 space-y-1">
                        {day.interviews.slice(0, 2).map((interview, i) => {
                          const typeConfig = interviewTypeConfig[interview.type as keyof typeof interviewTypeConfig] || interviewTypeConfig.phone
                          return (
                            <div
                              key={i}
                              className={`text-xs px-1 py-0.5 rounded ${typeConfig.bgColor} ${typeConfig.textColor} truncate`}
                              title={`${interview.candidate.firstName} ${interview.candidate.lastName} - ${interview.job.title}`}
                            >
                              {formatTimeAR(interview.scheduledAt)}
                            </div>
                          )
                        })}
                        {day.interviews.length > 2 && (
                          <div className="text-xs text-gray-500 font-medium">
                            +{day.interviews.length - 2} más
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? formatDateAR(selectedDate) : 'Selecciona un día'}
            </CardTitle>
            <CardDescription>
              {selectedDayInterviews.length === 0
                ? 'No hay entrevistas programadas'
                : `${selectedDayInterviews.length} entrevista${selectedDayInterviews.length > 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {selectedDayInterviews.map(interview => {
              const typeConfig = interviewTypeConfig[interview.type as keyof typeof interviewTypeConfig] || interviewTypeConfig.phone
              const TypeIcon = typeConfig.icon
              const statusInfo = statusConfig[interview.status as keyof typeof statusConfig] || statusConfig.scheduled

              return (
                <div key={interview.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  {/* Time and Status */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        {formatTimeAR(interview.scheduledAt)}
                      </span>
                      <span className="text-xs text-gray-500">({interview.duration} min)</span>
                    </div>
                    <Badge variant="secondary" className={`${statusInfo.color} text-white text-xs`}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* Candidate */}
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {interview.candidate.firstName} {interview.candidate.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{interview.candidate.email}</p>
                  </div>

                  {/* Job */}
                  <div className="mb-2">
                    <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {interview.job.title}
                    </p>
                    <p className="text-xs text-gray-500">{interview.job.department}</p>
                  </div>

                  {/* Type and Location */}
                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <TypeIcon className="h-3 w-3" />
                      <span>{typeConfig.label}</span>
                    </div>
                    {interview.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{interview.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Interviewer */}
                  {interview.interviewerName && (
                    <p className="text-xs text-gray-600 mb-2">
                      Entrevistador: {interview.interviewerName}
                    </p>
                  )}

                  {/* Rating (if completed) */}
                  {interview.rating && interview.status === 'completed' && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < interview.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {interview.notes && (
                    <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100 italic">
                      {interview.notes}
                    </p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
