'use client'

import { useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, ChevronDown, Loader2, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Note {
  id: string
  type: string
  content: string
  createdAt: string
  createdBy?: {
    firstName: string
    lastName: string
    role?: string
  }
}

interface Candidate {
  firstName: string
  lastName: string
  email: string
}

interface NotesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate | null
  notes: Note[]
  loadingNotes: boolean
  noteType: string
  noteContent: string
  onNoteTypeChange: (value: string) => void
  onNoteContentChange: (value: string) => void
  onSaveNote: () => void
  formatDateTimeAR: (date: string) => string
}

export function NotesModal({
  open,
  onOpenChange,
  candidate,
  notes,
  loadingNotes,
  noteType,
  noteContent,
  onNoteTypeChange,
  onNoteContentChange,
  onSaveNote,
  formatDateTimeAR
}: NotesModalProps) {
  const timelineContainerRef = useRef<HTMLDivElement>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-amber-50/95 via-orange-50/90 to-yellow-50/95 backdrop-blur-xl border-amber-200/40 shadow-[0_20px_60px_rgba(207,175,110,0.25)] font-[Inter,Poppins,sans-serif]">
        <DialogHeader className="bg-gradient-to-r from-[#FFF6E9] to-[#FFF9F4] -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold bg-gradient-to-r from-amber-800 via-orange-700 to-amber-800 bg-clip-text text-transparent">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 ring-2 ring-amber-200/50 ring-offset-2">
              <StickyNote className="h-5 w-5 text-white" />
            </div>
            Notas del Candidato
          </DialogTitle>
          <DialogDescription className="text-[#555] font-normal">
            {candidate && `${candidate.firstName} ${candidate.lastName} - ${candidate.email}`}
          </DialogDescription>
        </DialogHeader>

        <div ref={timelineContainerRef} className="flex-1 overflow-y-auto space-y-4 py-3 px-1 scrollbar-thin scrollbar-thumb-amber-300/50 scrollbar-track-transparent scroll-smooth">
          {/* Formulario para nueva nota - Glass Effect Premium Compacto */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/70 to-cyan-50/80 backdrop-blur-md border border-emerald-200/60 rounded-xl p-3.5 space-y-2.5 shadow-[0_8px_30px_rgba(16,185,129,0.12)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.18)] transition-all duration-300">
            <h3 className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                <StickyNote className="h-3.5 w-3.5 text-white" />
              </div>
              Nueva Nota
            </h3>

            <div className="grid grid-cols-[120px_1fr_auto] gap-3 items-center">
              <div>
                <label className="block text-[10px] font-semibold text-emerald-800 mb-1 uppercase tracking-wide">
                  Tipo
                </label>
                <Select value={noteType} onValueChange={onNoteTypeChange}>
                  <SelectTrigger className="h-9 text-xs bg-white/80 backdrop-blur-sm border-emerald-300/50 hover:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">📝 General</SelectItem>
                    <SelectItem value="interview">💬 Entrevista</SelectItem>
                    <SelectItem value="technical">⚙️ Técnica</SelectItem>
                    <SelectItem value="reference">👤 Referencia</SelectItem>
                    <SelectItem value="feedback">💭 Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-emerald-800 mb-1 uppercase tracking-wide">
                  Contenido
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => onNoteContentChange(e.target.value)}
                  placeholder="Escribe tus observaciones..."
                  className="w-full h-[52px] px-2.5 py-2 text-xs border-2 border-emerald-300/50 rounded-lg focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 resize-none bg-white/80 backdrop-blur-sm placeholder:text-emerald-600/40 transition-all duration-200 hover:border-emerald-400/60 leading-relaxed"
                />
              </div>

              <div className="self-end pb-[1px]">
                <Button
                  onClick={onSaveNote}
                  size="sm"
                  className="h-9 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold text-xs shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 px-4 rounded-lg"
                >
                  <StickyNote className="h-3 w-3 mr-1.5 transition-transform duration-200 group-hover:rotate-6" />
                  Agregar
                </Button>
              </div>
            </div>
          </div>

          {/* Timeline de notas existentes - Premium Design Compacto con Dropdown */}
          {notes.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/70 backdrop-blur-md border border-amber-200/60 rounded-xl shadow-md overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  const content = document.getElementById('notes-history-content')
                  const icon = document.getElementById('notes-history-icon')
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
                  <Calendar className="h-4 w-4" />
                  Historial de Notas ({notes.length})
                </h3>
                <ChevronDown
                  id="notes-history-icon"
                  className="h-5 w-5 text-amber-700 transition-transform duration-200"
                />
              </button>
              <div id="notes-history-content" className="hidden px-4 pb-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-amber-200/30">
                  {loadingNotes ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-amber-500 mx-auto mb-2" />
                        <p className="text-xs text-amber-700 font-medium">Cargando notas...</p>
                      </div>
                    </div>
                  ) : notes.length > 0 ? (
                    <div className="relative space-y-[12px]">
                      {/* Línea vertical del timeline - Gradiente dorado Elevas */}
                      <div className="absolute left-7 top-0 bottom-0 w-1 bg-[linear-gradient(180deg,#FAD7A0_0%,#F4C07B_100%)] rounded-full shadow-sm" />

                      {notes.map((note: Note, index: number) => {
                        const noteTypeIcons: Record<string, string> = {
                          general: '📝',
                          interview: '💬',
                          technical: '⚙️',
                          reference: '👤',
                          feedback: '💭'
                        }

                        const noteTypeColors: Record<string, string> = {
                          general: 'from-slate-100/90 via-gray-50/80 to-slate-50/90 border-slate-300/60',
                          interview: 'from-purple-100/90 via-violet-50/80 to-purple-50/90 border-purple-300/60',
                          technical: 'from-blue-100/90 via-cyan-50/80 to-blue-50/90 border-blue-300/60',
                          reference: 'from-emerald-100/90 via-teal-50/80 to-emerald-50/90 border-emerald-300/60',
                          feedback: 'from-amber-100/90 via-yellow-50/80 to-amber-50/90 border-amber-300/60'
                        }

                        const noteTypeBorderColors: Record<string, string> = {
                          general: 'border-l-slate-400',
                          interview: 'border-l-purple-400',
                          technical: 'border-l-blue-400',
                          reference: 'border-l-emerald-400',
                          feedback: 'border-l-amber-400'
                        }

                        const noteTypeDotColors: Record<string, string> = {
                          general: 'border-slate-400 bg-gradient-to-br from-slate-100 to-white',
                          interview: 'border-purple-400 bg-gradient-to-br from-purple-100 to-white',
                          technical: 'border-blue-400 bg-gradient-to-br from-blue-100 to-white',
                          reference: 'border-emerald-400 bg-gradient-to-br from-emerald-100 to-white',
                          feedback: 'border-amber-400 bg-gradient-to-br from-amber-100 to-white'
                        }

                        return (
                          <div
                            key={note.id}
                            className="relative pl-14 group animate-in fade-in slide-in-from-top-4 duration-500"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            {/* Punto del timeline - Con sombra interna blanca */}
                            <div className={cn(
                              "absolute left-4 top-2.5 w-5 h-5 rounded-full border-2 shadow-md flex items-center justify-center text-xs z-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 cursor-pointer [box-shadow:inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.1)]",
                              noteTypeDotColors[note.type] || noteTypeDotColors.general
                            )}>
                              {noteTypeIcons[note.type] || '📝'}
                            </div>

                            {/* Tarjeta de nota - Liquid glass effect mejorado */}
                            <div className={cn(
                              "bg-gradient-to-br border border-l-3 rounded-xl p-3 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer",
                              "[backdrop-filter:blur(6px)] [background:rgba(255,255,255,0.75)] [box-shadow:0_1px_3px_rgba(0,0,0,0.05)] hover:[box-shadow:0_4px_12px_rgba(0,0,0,0.08)]",
                              noteTypeColors[note.type] || noteTypeColors.general,
                              noteTypeBorderColors[note.type] || noteTypeBorderColors.general
                            )}>
                              <div className="flex items-start justify-between mb-2">
                                <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 shadow-sm">
                                  {note.type === 'general' && '📝 General'}
                                  {note.type === 'interview' && '💬 Entrevista'}
                                  {note.type === 'technical' && '⚙️ Técnica'}
                                  {note.type === 'reference' && '👤 Referencia'}
                                  {note.type === 'feedback' && '💭 Feedback'}
                                </Badge>
                                <span className="text-[10px] text-gray-600 flex items-center gap-1 font-medium bg-white/60 px-1.5 py-0.5 rounded shadow-sm">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {formatDateTimeAR(note.createdAt)}
                                </span>
                              </div>

                              <p className="text-xs text-[#333] whitespace-pre-wrap font-normal mb-2" style={{ lineHeight: '1.5' }}>
                                {note.content}
                              </p>

                              {note.createdBy && (
                                <div className="pt-2 border-t border-gray-300/40 flex items-center gap-1.5">
                                  <div className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center shadow-sm ring-1 ring-white/50",
                                    note.type === 'general' && 'bg-gradient-to-br from-slate-500 to-gray-500',
                                    note.type === 'interview' && 'bg-gradient-to-br from-purple-500 to-violet-500',
                                    note.type === 'technical' && 'bg-gradient-to-br from-blue-500 to-cyan-500',
                                    note.type === 'reference' && 'bg-gradient-to-br from-emerald-500 to-teal-500',
                                    note.type === 'feedback' && 'bg-gradient-to-br from-amber-500 to-orange-500'
                                  )}>
                                    <span className="text-white text-[9px] font-bold">
                                      {note.createdBy.firstName?.charAt(0)}{note.createdBy.lastName?.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-700 leading-tight">
                                      {note.createdBy.firstName} {note.createdBy.lastName}
                                    </p>
                                    <p className="text-[9px] text-gray-500 leading-tight">{note.createdBy.role || 'Reclutador'}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-3 shadow-md">
                        <StickyNote className="h-6 w-6 text-amber-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 mb-0.5">No hay notas registradas</p>
                      <p className="text-[10px] text-gray-500">Agrega la primera nota arriba</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-amber-200/50 pt-4 flex justify-end bg-gradient-to-r from-amber-50/50 to-orange-50/50 backdrop-blur-sm">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#F2C57C] text-amber-800 bg-white/40 hover:bg-amber-50/60 hover:border-[#F2C57C] hover:shadow-md font-semibold shadow-sm transition-all duration-300 ease-in-out px-6"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
