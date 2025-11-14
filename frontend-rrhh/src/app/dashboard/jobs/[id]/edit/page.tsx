'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, Eye, DollarSign, MapPin, Users, FileText, Tag, Plus, X, Clock, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { useJobs, Job } from '@/hooks/useJobs'
import { useNotification, notifyOperation } from '@/hooks/useNotification'
import { toInputDateFormat, fromInputDateFormat, getDatePlaceholder } from '@/lib/date-utils'
import { DateInput } from '@/components/ui/date-input'

export default function EditJobPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const { jobs, loading, updateJob } = useJobs()
  const notify = useNotification()

  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [currentSkill, setCurrentSkill] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    modality: '',
    contractType: '',
    deadline: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    skills: [] as string[],
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'EUR',
    isUrgent: false,
    isRemote: false,
  })

  const departments = [
    'Tecnología',
    'Producto',
    'Diseño',
    'Marketing',
    'Ventas',
    'Recursos Humanos',
    'Finanzas',
    'Operaciones'
  ]

  const modalities = [
    { label: 'Presencial', value: 'presencial' },
    { label: 'Remoto', value: 'remoto' },
    { label: 'Híbrido', value: 'hibrido' }
  ]

  const contractTypes = [
    { label: 'Tiempo completo', value: 'tiempo_completo' },
    { label: 'Tiempo parcial', value: 'tiempo_parcial' },
    { label: 'Contrato temporal', value: 'contrato_temporal' },
    { label: 'Freelance', value: 'freelance' },
    { label: 'Prácticas', value: 'practicas' }
  ]

  // Cargar datos del puesto
  useEffect(() => {
    if (jobs.length > 0 && jobId) {
      const foundJob = jobs.find(j => j.id === jobId)
      if (foundJob) {
        setJob(foundJob)
        setFormData({
          title: foundJob.title || '',
          department: foundJob.department || '',
          location: foundJob.location || '',
          modality: foundJob.modality || '',
          contractType: foundJob.contractType || '',
          deadline: foundJob.deadline ? toInputDateFormat(foundJob.deadline.toString()) : '',
          description: foundJob.description || '',
          responsibilities: foundJob.responsibilities || '',
          requirements: foundJob.requirements || '',
          benefits: foundJob.benefits || '',
          skills: foundJob.skills || [],
          salaryMin: foundJob.salaryMin?.toString() || '',
          salaryMax: foundJob.salaryMax?.toString() || '',
          salaryCurrency: foundJob.salaryCurrency || 'EUR',
          isUrgent: foundJob.isUrgent || false,
          isRemote: foundJob.isRemote || false,
        })
      }
    }
  }, [jobs, jobId])

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }))
      setCurrentSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!formData.title || !formData.department || !formData.location || !formData.modality || !formData.contractType || !formData.description) {
      notify.warning('Por favor completa todos los campos obligatorios (*)')
      return
    }

    setIsLoading(true)

    try {
      const updatedJobData = {
        ...formData,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
        deadline: formData.deadline ? new Date(fromInputDateFormat(formData.deadline)) : undefined,
      }

      const success = await updateJob(jobId, updatedJobData)

      if (success) {
        notifyOperation.jobUpdated()
        router.push('/dashboard/jobs')
      } else {
        notifyOperation.saveError()
      }
    } catch (error) {
      console.error('Error updating job:', error)
      notifyOperation.saveError()
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-gray-600">Cargando puesto...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">Puesto no encontrado</p>
          <Link href="/dashboard/jobs">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
              Volver a Puestos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 mb-1">
            Editar Puesto de Trabajo
          </h1>
          <p className="text-sm sm:text-base text-amber-700/80">
            Modifica la información del puesto &quot;{job.title}&quot;
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                Información Básica
              </CardTitle>
              <CardDescription className="text-gray-600">
                Detalles principales del puesto de trabajo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">Título del puesto *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="ej. Desarrollador Frontend Senior"
                    className="h-11 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700">Departamento *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger className="h-11 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200">
                      <SelectValue placeholder="Selecciona un departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">Ubicación *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="ej. Madrid, España"
                    className="h-11 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modality" className="text-sm font-medium text-gray-700">Modalidad *</Label>
                  <Select value={formData.modality} onValueChange={(value) => setFormData(prev => ({ ...prev, modality: value }))}>
                    <SelectTrigger className="h-11 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200">
                      <SelectValue placeholder="Selecciona modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {modalities.map(mod => (
                        <SelectItem key={mod.value} value={mod.value}>{mod.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractType" className="text-sm font-medium text-gray-700">Tipo de contrato *</Label>
                  <Select value={formData.contractType} onValueChange={(value) => setFormData(prev => ({ ...prev, contractType: value }))}>
                    <SelectTrigger className="h-11 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200">
                      <SelectValue placeholder="Selecciona tipo de contrato" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTypes.map(contract => (
                        <SelectItem key={contract.value} value={contract.value}>{contract.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">Fecha límite</Label>
                  <DateInput
                    id="deadline"
                    value={formData.deadline}
                    onChange={(value) => setFormData(prev => ({ ...prev, deadline: value }))}
                    className="h-11 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                    placeholder={getDatePlaceholder()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin" className="text-sm font-medium text-gray-700">Salario mínimo</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
                    placeholder="30000"
                    className="h-11 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryMax" className="text-sm font-medium text-gray-700">Salario máximo</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
                    placeholder="50000"
                    className="h-11 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryCurrency" className="text-sm font-medium text-gray-700">Moneda</Label>
                  <Select value={formData.salaryCurrency} onValueChange={(value) => setFormData(prev => ({ ...prev, salaryCurrency: value }))}>
                    <SelectTrigger className="h-11 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isUrgent"
                    checked={formData.isUrgent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isUrgent: checked as boolean }))}
                  />
                  <Label htmlFor="isUrgent" className="text-sm font-medium text-gray-700">
                    Puesto urgente
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRemote"
                    checked={formData.isRemote}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRemote: checked as boolean }))}
                  />
                  <Label htmlFor="isRemote" className="text-sm font-medium text-gray-700">
                    Trabajo remoto disponible
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descripción y Detalles */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                Descripción y Detalles
              </CardTitle>
              <CardDescription className="text-gray-600">
                Información detallada sobre el puesto y responsabilidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Descripción del puesto *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el puesto, qué hace la empresa, el equipo, etc."
                  className="min-h-[120px] bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities" className="text-sm font-medium text-gray-700">Responsabilidades</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                  placeholder="Lista las principales responsabilidades del puesto..."
                  className="min-h-[120px] bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">Requisitos</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Enumera los requisitos técnicos y de experiencia..."
                  className="min-h-[120px] bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits" className="text-sm font-medium text-gray-700">Beneficios</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                  placeholder="Describe los beneficios que ofrece la empresa..."
                  className="min-h-[120px] bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Habilidades */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg">
                  <Tag className="h-4 w-4 text-white" />
                </div>
                Habilidades Requeridas
              </CardTitle>
              <CardDescription className="text-gray-600">
                Añade las habilidades técnicas y competencias necesarias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="ej. React, TypeScript, Node.js..."
                  className="flex-1 h-11 bg-white/90 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200/50 shadow-sm flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:bg-amber-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-amber-200/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="flex-1 text-amber-700 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300"
            >
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Modal de Vista Previa */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-white/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl text-gray-800">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-amber-500 to-orange-500">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                Vista Previa del Puesto
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Así se verá tu oferta de trabajo para los candidatos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{formData.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {formData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {formData.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {contractTypes.find(c => c.value === formData.contractType)?.label}
                  </span>
                  {(formData.salaryMin || formData.salaryMax) && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formData.salaryMin && formData.salaryMax
                        ? `${formData.salaryMin} - ${formData.salaryMax} ${formData.salaryCurrency}`
                        : formData.salaryMin
                          ? `Desde ${formData.salaryMin} ${formData.salaryCurrency}`
                          : `Hasta ${formData.salaryMax} ${formData.salaryCurrency}`
                      }
                    </span>
                  )}
                </div>
              </div>

              {formData.description && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed">{formData.description}</p>
                </div>
              )}

              {formData.responsibilities && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Responsabilidades</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{formData.responsibilities}</p>
                </div>
              )}

              {formData.requirements && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Requisitos</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{formData.requirements}</p>
                </div>
              )}

              {formData.benefits && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Beneficios</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{formData.benefits}</p>
                </div>
              )}

              {formData.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Habilidades Requeridas</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200/50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}