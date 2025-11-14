'use client'

import { useState } from 'react'
import { Save, Eye, Calendar, MapPin, Users, FileText, Tag, Plus, X, Clock, ArrowLeft } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { fromInputDateFormat, getDatePlaceholder, formatDateAR } from '@/lib/date-utils'
import { DateInput } from '@/components/ui/date-input'

export default function CreateJobPage() {
  const router = useRouter()
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
  })

  const [currentSkill, setCurrentSkill] = useState('')
  const [showPreview, setShowPreview] = useState(false)

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
    if (!formData.title || !formData.department || !formData.location || !formData.modality || !formData.contractType || !formData.deadline || !formData.description) {
      alert('Por favor completa todos los campos obligatorios (*)');
      return;
    }

    try {
      // Preparar datos para enviar al backend
      const jobData = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        modality: formData.modality,
        contractType: formData.contractType,
        deadline: fromInputDateFormat(formData.deadline), // Convert to ISO format
        description: formData.description,
        responsibilities: formData.responsibilities || undefined,
        requirements: formData.requirements || undefined,
        benefits: formData.benefits || undefined,
        skills: formData.skills.length > 0 ? formData.skills : undefined,
        status: 'active', // El puesto se crea activo y disponible
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('Enviando datos al backend:', jobData);
      }

      // Enviar al backend usando la API
      const { api } = await import('@/lib/api');
      const createdJob = await api.post('/jobs', jobData);

      if (process.env.NODE_ENV === 'development') {
        console.log('Puesto creado exitosamente:', createdJob);
      }

      // Mostrar mensaje de éxito
      alert('¡Puesto creado exitosamente! Redirigiendo a la lista de puestos...');

      // Redireccionar a la lista de puestos
      router.push('/dashboard/jobs');

    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al crear el puesto:', error);
      }
      alert('Error al crear el puesto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      {/* Main Container with proper padding */}
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 mb-1">
              Crear Nuevo Puesto
            </h1>
            <p className="text-sm sm:text-base text-amber-700/80 leading-relaxed">
              Define los detalles de la nueva vacante para el proceso de reclutamiento
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/jobs')}
              className="flex items-center gap-2 h-11 px-6 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 h-11 px-6 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
            >
              <Eye className="h-4 w-4" />
              Vista Previa
            </Button>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Información Básica */}
          <Card className="transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm border-white/50 shadow-lg"
            style={{ borderRadius: '16px' }}>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: 'rgba(207, 175, 110, 0.1)',
                  border: '1px solid rgba(207, 175, 110, 0.2)'
                }}>
                  <FileText className="h-5 w-5" style={{color: '#cfaf6e'}} />
                </div>
                <span style={{color: '#1a1a1a'}}>Información Básica</span>
              </CardTitle>
              <CardDescription style={{color: '#666666', marginTop: '8px'}}>
                Completa los datos principales del puesto de trabajo
              </CardDescription>
          </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Título del Puesto *
                  </Label>
                  <Input
                    id="title"
                    placeholder="ej. Frontend Developer Senior"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="h-11 transition-all duration-200"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: 'rgba(207, 175, 110, 0.3)',
                      borderRadius: '12px'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#cfaf6e'
                      e.target.style.boxShadow = '0 0 0 3px rgba(207, 175, 110, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(207, 175, 110, 0.3)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                    Departamento *
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger className="h-11" style={{ borderRadius: '12px' }}>
                      <SelectValue placeholder="Selecciona departamento" />
                    </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{color: '#9e9e9e'}} />
                  <Input
                    id="location"
                    placeholder="Madrid, España"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Modalidad *</Label>
                <Select
                  value={formData.modality}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, modality: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalities.map((modality) => (
                      <SelectItem key={modality.value} value={modality.value}>{modality.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Contrato *</Label>
                <Select
                  value={formData.contractType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contractType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Fecha Límite *</Label>
                <DateInput
                  id="deadline"
                  value={formData.deadline}
                  onChange={(value) => setFormData(prev => ({ ...prev, deadline: value }))}
                  placeholder={getDatePlaceholder()}
                  required
                  className="h-11 transition-all duration-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Descripción y Requisitos */}
        <Card className="transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm border-white/50 shadow-lg"
          style={{ borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" style={{color: '#cfaf6e'}} />
              <span>Descripción del Puesto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción General *</Label>
              <Textarea
                id="description"
                placeholder="Describe el puesto, el equipo y el impacto que tendrá..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsabilidades Principales</Label>
              <Textarea
                id="responsibilities"
                placeholder="• Desarrollar nuevas funcionalidades&#10;• Colaborar con el equipo de diseño&#10;• Mantener código de calidad..."
                value={formData.responsibilities}
                onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requisitos y Experiencia</Label>
              <Textarea
                id="requirements"
                placeholder="• 3+ años de experiencia en React&#10;• Conocimiento de TypeScript&#10;• Experiencia con APIs REST..."
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Beneficios y Perks</Label>
              <Textarea
                id="benefits"
                placeholder="• Seguro médico privado&#10;• Horario flexible&#10;• Presupuesto para formación..."
                value={formData.benefits}
                onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills y Tecnologías */}
        <Card className="transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm border-white/50 shadow-lg"
          style={{ borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5" style={{color: '#cfaf6e'}} />
              <span>Skills y Tecnologías</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Agrega un skill (ej. React, Python, etc.)"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addSkill}
                variant="outline"
                className="transition-all duration-300 cursor-pointer"
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
                    className="flex items-center space-x-1"
                    style={{
                      backgroundColor: 'rgba(207, 175, 110, 0.1)',
                      color: '#a37d43'
                    }}
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

          {/* Actions - Mobile First */}
          <Card className="mt-8 transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm border-white/50 shadow-lg"
            style={{ borderRadius: '16px' }}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="w-full sm:w-auto h-11 px-8 bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Crear Puesto
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{
            background: 'linear-gradient(135deg, rgba(254, 252, 245, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1px solid rgba(207, 175, 110, 0.2)',
            borderRadius: '16px'
          }}>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-3" style={{color: '#1a1a1a'}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: 'rgba(207, 175, 110, 0.1)',
                  border: '1px solid rgba(207, 175, 110, 0.2)'
                }}>
                  <Eye className="h-5 w-5" style={{color: '#cfaf6e'}} />
                </div>
                Vista Previa del Puesto
              </DialogTitle>
              <DialogDescription style={{color: '#666666'}}>
                Así es como se verá tu oferta de trabajo publicada
              </DialogDescription>
            </DialogHeader>

            {/* Preview Content */}
            <div className="mt-6 space-y-6">
              {/* Job Header */}
              <div className="border-b pb-6" style={{borderColor: 'rgba(207, 175, 110, 0.2)'}}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2" style={{color: '#1a1a1a'}}>
                      {formData.title || 'Título del puesto'}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm" style={{color: '#666666'}}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{formData.location || 'Ubicación no especificada'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{formData.department || 'Departamento no especificado'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formData.contractType ? contractTypes.find(c => c.value === formData.contractType)?.label : 'Tipo de contrato no especificado'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge style={{
                      backgroundColor: 'rgba(207, 175, 110, 0.1)',
                      color: '#a37d43',
                      border: '1px solid rgba(207, 175, 110, 0.3)'
                    }}>
                      {formData.modality ? modalities.find(m => m.value === formData.modality)?.label : 'Modalidad no especificada'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  {formData.description && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3" style={{color: '#1a1a1a'}}>
                        Descripción del Puesto
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {formData.description}
                      </p>
                    </div>
                  )}

                  {/* Responsibilities */}
                  {formData.responsibilities && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3" style={{color: '#1a1a1a'}}>
                        Responsabilidades
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {formData.responsibilities}
                      </p>
                    </div>
                  )}

                  {/* Requirements */}
                  {formData.requirements && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3" style={{color: '#1a1a1a'}}>
                        Requisitos
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {formData.requirements}
                      </p>
                    </div>
                  )}

                  {/* Benefits */}
                  {formData.benefits && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3" style={{color: '#1a1a1a'}}>
                        Beneficios
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {formData.benefits}
                      </p>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Skills */}
                  {formData.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3" style={{color: '#1a1a1a'}}>
                        Habilidades Requeridas
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            style={{
                              backgroundColor: 'rgba(207, 175, 110, 0.1)',
                              color: '#a37d43',
                              border: '1px solid rgba(207, 175, 110, 0.3)'
                            }}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}


                  {/* Deadline */}
                  {formData.deadline && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3" style={{color: '#1a1a1a'}}>
                        Fecha Límite
                      </h3>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateAR(formData.deadline)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t pt-6 flex flex-col sm:flex-row gap-3 sm:justify-end" style={{borderColor: 'rgba(207, 175, 110, 0.2)'}}>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                  className="w-full sm:w-auto"
                  style={{
                    borderColor: 'rgba(207, 175, 110, 0.3)',
                    color: '#666666'
                  }}
                >
                  Cerrar Vista Previa
                </Button>
                <Button
                  onClick={() => {
                    setShowPreview(false)
                    // Trigger form submission
                    document.querySelector('form')?.requestSubmit()
                  }}
                  className="w-full sm:w-auto"
                  style={{
                    backgroundColor: '#cfaf6e',
                    color: 'white',
                    borderColor: '#cfaf6e'
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Crear Este Puesto
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}