"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  FileText,
  X,
  Check,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  Clock,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import { useJobs } from "@/hooks/useJobs"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dni: string
  location: string
  jobId: string
  coverLetter: string
  cv: File | null
}

export default function CVUploadForm() {
  const { jobs, loading: jobsLoading } = useJobs()

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dni: "",
    location: "",
    jobId: "",
    coverLetter: "",
    cv: null
  })

  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setDuplicateInfo(null)
    setError("")
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, jobId: value }))
    setDuplicateInfo(null)
    setError("")
  }

  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo no puede exceder 5MB")
      return
    }

    if (!file.type.includes("pdf")) {
      setError("Solo se aceptan archivos PDF")
      return
    }

    setFormData(prev => ({ ...prev, cv: file }))
    setError("")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeFile = () => {
    setFormData(prev => ({ ...prev, cv: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const submitFormData = new FormData()
      submitFormData.append('firstName', formData.firstName)
      submitFormData.append('lastName', formData.lastName)
      submitFormData.append('email', formData.email)
      submitFormData.append('phone', formData.phone)
      submitFormData.append('dni', formData.dni)
      submitFormData.append('location', formData.location)
      submitFormData.append('jobId', formData.jobId)
      submitFormData.append('coverLetter', formData.coverLetter)

      if (formData.cv) {
        submitFormData.append('cv', formData.cv)
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
      const response = await fetch(`${backendUrl}/api/applications/public`, {
        method: 'POST',
        body: submitFormData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // Check if it's a duplicate application error
        if (response.status === 400 && errorData.details?.alreadyApplied) {
          setDuplicateInfo(errorData.details)
          setError("")
          return
        }

        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      setIsSubmitted(true)
      // Reset form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dni: "",
        location: "",
        jobId: "",
        coverLetter: "",
        cv: null
      })
      setDuplicateInfo(null)
      setError("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err: any) {
      setError(err.message || "Hubo un error al enviar tu postulación. Por favor, inténtalo nuevamente.")
      setDuplicateInfo(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    return formData.firstName &&
           formData.lastName &&
           formData.email &&
           formData.phone &&
           formData.dni &&
           formData.location &&
           formData.jobId &&
           formData.cv
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-semibold text-[#6d381a] mb-3 elevas-heading">
          ¡Postulación enviada!
        </h3>
        <p className="text-[#6d381a]/70 mb-6 elevas-body">
          Hemos recibido tu CV y datos. Nos pondremos en contacto contigo si tu perfil coincide con nuestras búsquedas.
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          variant="outline"
          className="border-[#6d381a]/30 text-[#6d381a] hover:bg-[#6d381a]/10"
        >
          Enviar otra postulación
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-white border border-[#6d381a]/10 rounded-2xl overflow-hidden elevas-shadow-md">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#6d381a] font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-[#e4b53b]" />
                  Nombre *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#6d381a] font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-[#e4b53b]" />
                  Apellido *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20"
                  placeholder="Tu apellido"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#6d381a] font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#e4b53b]" />
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#6d381a] font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#e4b53b]" />
                  Teléfono *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20"
                  placeholder="+54 9 ..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dni" className="text-[#6d381a] font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#e4b53b]" />
                  DNI *
                </Label>
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  required
                  className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20"
                  placeholder="12345678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-[#6d381a] font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#e4b53b]" />
                  Ubicación *
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20"
                  placeholder="Ciudad, País"
                />
              </div>
            </div>

            {/* Posición de Interés */}
            <div className="space-y-2">
              <Label htmlFor="jobId" className="text-[#6d381a] font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#e4b53b]" />
                Posición de interés *
              </Label>
              <Select value={formData.jobId} onValueChange={handleSelectChange} required>
                <SelectTrigger className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20">
                  <SelectValue placeholder={jobsLoading ? "Cargando posiciones..." : "Selecciona una posición"} />
                </SelectTrigger>
                <SelectContent className="bg-white z-50 shadow-lg border border-[#6d381a]/20">
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {job.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CV Upload */}
            <div className="space-y-2">
              <Label className="text-[#6d381a] font-medium flex items-center gap-2">
                <Upload className="h-4 w-4 text-[#e4b53b]" />
                Curriculum Vitae (PDF) *
              </Label>

              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragging
                    ? "border-[#e4b53b] bg-[#f1df96]/20"
                    : "border-[#6d381a]/20 hover:border-[#e4b53b]/50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <AnimatePresence mode="wait">
                  {formData.cv ? (
                    <motion.div
                      key="file-selected"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center justify-center gap-3"
                    >
                      <FileText className="h-8 w-8 text-[#e4b53b]" />
                      <div className="flex-1 text-left">
                        <p className="text-[#6d381a] font-medium">{formData.cv.name}</p>
                        <p className="text-sm text-[#6d381a]/60">
                          {(formData.cv.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload-prompt"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Upload className="h-12 w-12 text-[#e4b53b] mx-auto mb-4" />
                      <p className="text-[#6d381a] font-medium mb-2">
                        Arrastrá tu CV aquí o hacé clic para seleccionar
                      </p>
                      <p className="text-sm text-[#6d381a]/60">
                        Solo archivos PDF - Máximo 5MB
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mensaje */}
            <div className="space-y-2">
              <Label htmlFor="coverLetter" className="text-[#6d381a] font-medium">
                Mensaje adicional
              </Label>
              <Textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={4}
                className="border-[#6d381a]/20 focus:border-[#e4b53b] focus:ring-[#e4b53b]/20"
                placeholder="Contanos sobre tu experiencia, motivaciones o cualquier información adicional que consideres relevante..."
              />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Duplicate Application Alert */}
            <AnimatePresence>
              {duplicateInfo && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-amber-800 font-medium text-sm mb-2">
                        Ya has aplicado a esta posición
                      </h4>
                      <div className="text-amber-700 text-sm space-y-2">
                        <p>
                          Detectamos que ya enviaste una postulación para <strong>{duplicateInfo.jobTitle}</strong>
                        </p>
                        <div className="flex items-center gap-4 text-xs text-amber-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Enviada el {new Date(duplicateInfo.applicationDate).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span>Estado: {duplicateInfo.currentStatus}</span>
                          </div>
                        </div>
                        <div className="mt-3 text-xs">
                          <p className="mb-2">
                            <strong>Opciones disponibles:</strong>
                          </p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Puedes aplicar a una <strong>posición diferente</strong> con el mismo email</li>
                            <li>Si quieres actualizar tu CV para esta posición, contactanos directamente a talento@elevasconsulting.com</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDuplicateInfo(null)}
                          className="text-amber-700 border-amber-300 hover:bg-amber-100 text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Aplicar a otra posición
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid() || duplicateInfo}
              className="w-full bg-[#e4b53b] hover:bg-[#d4a332] text-white font-semibold py-3 rounded-xl elevas-lift elevas-press elevas-shadow-colored disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Enviando postulación...</span>
                </div>
              ) : (
                "Enviar postulación"
              )}
            </Button>

            <p className="text-xs text-[#6d381a]/60 text-center">
              Al enviar tu postulación, aceptás que procesemos tus datos personales para evaluar tu candidatura.
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}