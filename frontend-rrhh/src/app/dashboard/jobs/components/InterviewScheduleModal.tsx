'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calendar, ChevronDown, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Interview {
  id: string
  scheduledDate: string
  scheduledTime: string
  type: string
  status: string
  location?: string
  notes?: string
}

interface Application {
  id: string
  candidate?: {
    firstName: string
    lastName: string
  }
}

interface InterviewScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: Application | null
  previousInterviews: Interview[]
  loadingPreviousInterviews: boolean
  interviewDate: string
  interviewTime: string
  interviewType: string
  interviewLocation: string
  interviewDuration: number
  interviewNotes: string
  savingInterview: boolean
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  onTypeChange: (value: string) => void
  onLocationChange: (value: string) => void
  onDurationChange: (value: number) => void
  onNotesChange: (value: string) => void
  onSaveInterview: () => void
}

export function InterviewScheduleModal({
  open,
  onOpenChange,
  application,
  previousInterviews,
  loadingPreviousInterviews,
  interviewDate,
  interviewTime,
  interviewType,
  interviewLocation,
  interviewDuration,
  interviewNotes,
  savingInterview,
  onDateChange,
  onTimeChange,
  onTypeChange,
  onLocationChange,
  onDurationChange,
  onNotesChange,
  onSaveInterview
}: InterviewScheduleModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-amber-50/95 via-orange-50/90 to-yellow-50/95 backdrop-blur-xl border-amber-200/40 shadow-[0_20px_60px_rgba(207,175,110,0.25)] font-[Inter,Poppins,sans-serif]">
        <DialogHeader className="bg-gradient-to-r from-[#FFF6E9] to-[#FFF9F4] -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold bg-gradient-to-r from-amber-800 via-orange-700 to-amber-800 bg-clip-text text-transparent">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 ring-2 ring-amber-200/50 ring-offset-2">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            Programar Entrevista
          </DialogTitle>
          <DialogDescription className="text-[#555] font-normal">
            {application && `${application.candidate?.firstName} ${application.candidate?.lastName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-3 px-1 scrollbar-thin scrollbar-thumb-amber-300/50 scrollbar-track-transparent scroll-smooth">
          {/* PRIMERO: Formulario para nueva entrevista - Glass Effect Premium Compacto */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/70 to-cyan-50/80 backdrop-blur-md border border-emerald-200/60 rounded-xl p-3.5 space-y-2.5 shadow-[0_8px_30px_rgba(16,185,129,0.12)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.18)] transition-all duration-300">
            <h3 className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                <Calendar className="h-3.5 w-3.5 text-white" />
              </div>
              Nueva Entrevista
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Fecha */}
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold text-emerald-800 mb-1 uppercase tracking-wide">
                  Fecha *
                </label>
                <Input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="h-8 text-xs bg-white/80 backdrop-blur-sm border-emerald-300/50 hover:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all duration-200"
                />
              </div>

              {/* Hora */}
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold text-emerald-800 mb-1 uppercase tracking-wide">
                  Hora *
                </label>
                <Input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => onTimeChange(e.target.value)}
                  className="h-8 text-xs bg-white/80 backdrop-blur-sm border-emerald-300/50 hover:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all duration-200"
                />
              </div>

              {/* Duración */}
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold text-emerald-800 mb-1 uppercase tracking-wide">
                  Duración
                </label>
                <Select value={interviewDuration.toString()} onValueChange={(val) => onDurationChange(parseInt(val))}>
                  <SelectTrigger className="h-8 text-xs bg-white/80 backdrop-blur-sm border-emerald-300/50 hover:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30min</SelectItem>
                    <SelectItem value="45">45min</SelectItem>
                    <SelectItem value="60">1h</SelectItem>
                    <SelectItem value="90">1.5h</SelectItem>
                    <SelectItem value="120">2h</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Tipo */}
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold text-emerald-800 mb-1 uppercase tracking-wide">
                  Tipo *
                </label>
                <Select value={interviewType} onValueChange={onTypeChange}>
                  <SelectTrigger className="h-8 text-xs bg-white/80 backdrop-blur-sm border-emerald-300/50 hover:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">💻 Virtual</SelectItem>
                    <SelectItem value="presencial">🏢 Presencial</SelectItem>
                    <SelectItem value="telefonica">📞 Telefónica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ubicación/Enlace */}
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold text-emerald-800 mb-1 uppercase tracking-wide">
                  {interviewType === 'virtual' ? '🔗 Enlace' : interviewType === 'presencial' ? '📍 Ubicación' : '📞 Teléfono'}
                </label>
                <Input
                  type="text"
                  value={interviewLocation}
                  onChange={(e) => onLocationChange(e.target.value)}
                  placeholder={
                    interviewType === 'virtual' ? 'meet.google.com/...' :
                    interviewType === 'presencial' ? 'Dirección' :
                    'Número'
                  }
                  className="h-8 text-xs bg-white/80 backdrop-blur-sm border-emerald-300/50 hover:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all duration-200"
                />
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800/80 px-1">
                Notas adicionales
              </label>
              <textarea
                value={interviewNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Temas a tratar, preparación necesaria, etc."
                className="w-full h-16 px-2.5 py-1.5 text-xs border-2 border-emerald-300/50 rounded-lg focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 resize-none bg-white/80 backdrop-blur-sm placeholder:text-emerald-600/40 transition-all duration-200 hover:border-emerald-400/60 leading-relaxed"
                style={{ lineHeight: '1.5' }}
              />
            </div>

            {/* Botones dentro del formulario */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-8 text-xs border-emerald-300/60 text-emerald-800 hover:bg-emerald-100/80 transition-all duration-200"
                disabled={savingInterview}
              >
                Cancelar
              </Button>
              <Button
                onClick={onSaveInterview}
                disabled={savingInterview || !interviewDate || !interviewTime}
                className="h-8 text-xs bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                {savingInterview ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                    Programar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* SEGUNDO: Historial de entrevistas previas - ABAJO */}
          {previousInterviews.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/70 backdrop-blur-md border border-amber-200/60 rounded-xl shadow-md overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  const content = document.getElementById('interview-history-content')
                  const icon = document.getElementById('interview-history-icon')
                  if (content && icon) {
                    const isHidden = content.classList.contains('hidden')
                    if (isHidden) {
                      content.classList.remove('hidden')
                      icon.style.transform = 'rotate(180deg)'
                    } else {
                      content.classList.add('hidden')
                      icon.style.transform = 'rotate(0deg)'
                    }
                  }
                }}
                className="w-full p-3 flex items-center justify-between hover:bg-amber-100/50 transition-colors duration-200"
              >
                <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Historial de Entrevistas ({previousInterviews.length})
                </h3>
                <ChevronDown
                  id="interview-history-icon"
                  className="h-5 w-5 text-amber-700 transition-transform duration-200"
                />
              </button>
              <div id="interview-history-content" className="hidden px-4 pb-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-amber-200/30">
                  <div className="relative space-y-[12px] max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-300/50 scrollbar-track-transparent">
                    {/* Línea vertical del timeline - Gradiente dorado Elevas */}
                    <div className="absolute left-7 top-0 bottom-0 w-1 bg-[linear-gradient(180deg,#FAD7A0_0%,#F4C07B_100%)] rounded-full shadow-sm" />

                    {previousInterviews.map((interview: Interview, index: number) => {
                      const interviewDate = new Date(interview.scheduledDate)
                      const statusColors = {
                        programada: 'bg-purple-100 text-purple-800 border-purple-200',
                        completada: 'bg-green-100 text-green-800 border-green-200',
                        cancelada: 'bg-red-100 text-red-800 border-red-200',
                        reprogramada: 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }
                      const typeIcons = {
                        virtual: '💻',
                        presencial: '🏢',
                        telefonica: '📞'
                      }
                      const typeDotColors = {
                        virtual: 'border-blue-400 bg-gradient-to-br from-blue-100 to-white',
                        presencial: 'border-emerald-400 bg-gradient-to-br from-emerald-100 to-white',
                        telefonica: 'border-purple-400 bg-gradient-to-br from-purple-100 to-white'
                      }

                      return (
                        <div
                          key={interview.id}
                          className="relative pl-14 group animate-in fade-in slide-in-from-top-4 duration-500"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Punto del timeline - Con sombra interna blanca */}
                          <div className={cn(
                            "absolute left-4 top-2.5 w-5 h-5 rounded-full border-2 shadow-md flex items-center justify-center text-xs z-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 cursor-pointer [box-shadow:inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.1)]",
                            typeDotColors[interview.type as keyof typeof typeDotColors] || typeDotColors.virtual
                          )}>
                            {typeIcons[interview.type as keyof typeof typeIcons]}
                          </div>

                          {/* Tarjeta de entrevista - Liquid glass effect mejorado */}
                          <div className="bg-gradient-to-br border rounded-xl p-3 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer [backdrop-filter:blur(6px)] [background:rgba(255,255,255,0.75)] [box-shadow:0_1px_3px_rgba(0,0,0,0.05)] hover:[box-shadow:0_4px_12px_rgba(0,0,0,0.08)] border-amber-200/40">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold text-[#333]">
                                    {interviewDate.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                  <span className="text-xs text-[#555]">{interview.scheduledTime}</span>
                                </div>
                                <p className="text-xs text-[#555] capitalize">
                                  <span className="font-semibold">Tipo:</span> {interview.type}
                                </p>
                                {interview.location && (
                                  <p className="text-xs text-[#555] mt-1 truncate">
                                    <span className="font-semibold">📍</span> {interview.location}
                                  </p>
                                )}
                                {interview.notes && (
                                  <p className="text-xs text-[#333] mt-1 italic" style={{ lineHeight: '1.5' }}>
                                    {interview.notes}
                                  </p>
                                )}
                              </div>
                              <Badge className={`text-xs ${statusColors[interview.status as keyof typeof statusColors]}`}>
                                {interview.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {loadingPreviousInterviews && (
            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/40 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-600 mr-2" />
              <span className="text-sm text-amber-700">Cargando historial...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
