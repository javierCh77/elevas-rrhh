import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Únete a Nuestro Equipo",
  description: "Descubre oportunidades de carrera en Elevas. Trabajá con las últimas tecnologías en IA y automatización de RRHH. Formá parte de un equipo que transforma organizaciones y vidas.",
  keywords: ["trabajar en elevas", "empleos RRHH", "carreras tecnología", "trabajo IA", "empleos Buenos Aires", "tech jobs Argentina"],
  openGraph: {
    title: "Únete a Nuestro Equipo | Elevas Careers",
    description: "Descubre oportunidades de carrera en Elevas. Trabajá con IA y automatización en RRHH.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Únete a Nuestro Equipo | Elevas Careers",
    description: "Descubre oportunidades de carrera en Elevas. Trabajá con IA y automatización en RRHH.",
  },
};

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  Users,
  Lightbulb,
  Rocket,
  Heart,
  ArrowRight,
  MapPin,
  Clock,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import CVUploadForm from "@/components/cv-upload-form"
import { useJobs } from "@/hooks/useJobs"

export default function CareersPage() {
  const { jobs, loading, error } = useJobs()
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 5

  const benefits = [
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Innovación Constante",
      description: "Trabajá con las últimas tecnologías en IA y automatización de RRHH"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Equipo Colaborativo",
      description: "Formá parte de un equipo diverso y talentoso que valora cada perspectiva"
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Crecimiento Acompañado",
      description: "Te acompañamos en tu desarrollo profesional en una consultora en expansión"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Impacto Humano",
      description: "Transformá organizaciones mejorando la experiencia laboral de miles de personas"
    }
  ]

  // Ordenar jobs por fecha de creación (más recientes primero)
  const sortedJobs = jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Cálculos de paginación
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage)
  const startIndex = (currentPage - 1) * jobsPerPage
  const endIndex = startIndex + jobsPerPage
  const currentJobs = sortedJobs.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    // Scroll suave a la sección de posiciones
    document.getElementById('positions')?.scrollIntoView({ behavior: 'smooth' })
  }

  // JSON-LD structured data para JobPosting (SEO para Google Jobs)
  const jobPostingsJsonLd = jobs.map(job => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.title,
    'description': job.description,
    'datePosted': job.createdAt,
    'employmentType': job.type === 'full-time' ? 'FULL_TIME' : job.type === 'part-time' ? 'PART_TIME' : 'CONTRACTOR',
    'hiringOrganization': {
      '@type': 'Organization',
      'name': 'Elevas',
      'sameAs': 'https://elevas.com.ar',
      'logo': 'https://elevas.com.ar/logo.png'
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': job.location || 'Buenos Aires',
        'addressCountry': 'AR'
      }
    }
  }));

  return (
    <>
      {jobs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingsJsonLd) }}
        />
      )}
      <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center text-center py-20 md:py-32 px-6 md:px-16 overflow-hidden bg-gradient-to-br from-[#f1df96]/20 via-white to-[#e4b53b]/10">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0"
               style={{
                 backgroundImage: `radial-gradient(circle at 2px 2px, rgba(109, 56, 26, 0.15) 1px, transparent 0)`,
                 backgroundSize: '50px 50px'
               }}>
          </div>
        </div>

        <motion.div
          className="relative max-w-4xl space-y-8 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#e4b53b]/10 text-[#6d381a] rounded-full text-sm font-medium elevas-glass"
          >
            <Star className="h-4 w-4 text-[#e4b53b]" />
            <span>Únete al futuro de los RRHH</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#6d381a] leading-tight elevas-heading">
            <span className="block">Te acompañamos a</span>
            <span className="block text-[#e4b53b] elevas-gradient-text">construir</span>
            <span className="block">tu carrera</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#6d381a]/70 leading-relaxed font-light max-w-3xl mx-auto elevas-body">
            Desarrollá tu potencial junto a un equipo que transforma los recursos humanos
            combinando inteligencia artificial con sensibilidad humana
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              asChild
              className="bg-[#e4b53b] hover:bg-[#d4a332] text-white font-semibold px-8 py-4 text-lg rounded-xl elevas-lift elevas-press elevas-shadow-colored"
            >
              <a href="#postulate">
                Postulate ahora <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#6d381a]/30 text-[#6d381a] hover:bg-[#6d381a]/10 font-semibold px-8 py-4 text-lg rounded-xl elevas-lift elevas-press"
            >
              <a href="#positions">Ver posiciones abiertas</a>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-[#6d381a] mb-3 elevas-heading">
              ¿Por qué <span className="font-normal text-[#e4b53b]">Elevas</span>?
            </h2>
            <div className="w-16 h-px bg-[#e4b53b] mx-auto mb-6 elevas-scale-breath"></div>
            <p className="text-lg font-light text-[#6d381a]/70 max-w-2xl mx-auto leading-relaxed elevas-body">
              Trabajar en Elevas significa ser parte de la revolución en recursos humanos
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full text-center bg-white border border-[#6d381a]/10 hover:border-[#e4b53b]/30 rounded-2xl overflow-hidden elevas-lift elevas-press elevas-shadow-sm hover:elevas-shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="mx-auto p-3 bg-[#f1df96]/40 rounded-2xl text-[#e4b53b] mb-4 w-fit elevas-scale-breath">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-lg font-medium text-[#6d381a] elevas-heading">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#6d381a]/70 text-sm leading-relaxed elevas-body">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="positions" className="py-16 md:py-24 bg-[#f1df96]/20">
        <div className="px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-[#6d381a] mb-3 elevas-heading">
              Posiciones <span className="font-normal text-[#e4b53b]">abiertas</span>
            </h2>
            <div className="w-16 h-px bg-[#e4b53b] mx-auto mb-6 elevas-bounce-subtle"></div>
            <p className="text-lg font-light text-[#6d381a]/70 max-w-2xl mx-auto leading-relaxed elevas-body">
              Oportunidades únicas para profesionales que quieren marcar la diferencia
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#e4b53b]" />
              <span className="ml-2 text-[#6d381a]/70">Cargando posiciones...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-[#6d381a]/70 mb-4">{error}</p>
            </div>
          ) : currentJobs.length === 0 && sortedJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6d381a]/70 text-lg">
                No hay posiciones abiertas en este momento. ¡Pero siempre estamos buscando talento!
              </p>
              <p className="text-[#6d381a]/60 text-sm mt-2">
                Envianos tu CV y te contactaremos cuando tengamos una oportunidad que coincida con tu perfil.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {currentJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-white border border-[#6d381a]/10 hover:border-[#e4b53b]/30 rounded-2xl overflow-hidden elevas-lift elevas-press elevas-shadow-sm hover:elevas-shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-[#6d381a] elevas-heading">
                              {job.title}
                            </h3>
                            {job.isUrgent && (
                              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                                Urgente
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#6d381a]/70 mb-3">
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                            )}
                            {job.contractType && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{job.contractType.replace('_', ' ')}</span>
                              </div>
                            )}
                            {job.department && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{job.department}</span>
                              </div>
                            )}
                            {job.isRemote && (
                              <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                                Remoto
                              </span>
                            )}
                          </div>

                          <p className="text-[#6d381a]/70 leading-relaxed elevas-body mb-3">
                            {job.description}
                          </p>

                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {job.skills.slice(0, 3).map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className="bg-[#f1df96]/30 text-[#6d381a] text-xs px-2 py-1 rounded-md"
                                >
                                  {skill}
                                </span>
                              ))}
                              {job.skills.length > 3 && (
                                <span className="text-[#6d381a]/60 text-xs px-2 py-1">
                                  +{job.skills.length - 3} más
                                </span>
                              )}
                            </div>
                          )}

                          <div className="text-xs text-[#6d381a]/50">
                            Publicado: {new Date(job.createdAt).toLocaleDateString('es-ES')}
                          </div>
                        </div>

                        <Button
                          asChild
                          className="bg-[#e4b53b] hover:bg-[#d4a332] text-white font-medium px-6 py-2.5 rounded-xl elevas-lift elevas-press whitespace-nowrap"
                        >
                          <a href="#postulate">
                            Postularme <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                ))}
              </div>

              {/* Controles de Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-[#6d381a]/30 text-[#6d381a] hover:bg-[#6d381a]/10 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={
                          currentPage === page
                            ? "bg-[#e4b53b] hover:bg-[#d4a332] text-white elevas-press"
                            : "text-[#6d381a] hover:bg-[#6d381a]/10"
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-[#6d381a]/30 text-[#6d381a] hover:bg-[#6d381a]/10 disabled:opacity-50"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Información de paginación */}
              {sortedJobs.length > jobsPerPage && (
                <div className="text-center mt-6">
                  <p className="text-sm text-[#6d381a]/60">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, sortedJobs.length)} de {sortedJobs.length} posiciones
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CV Upload Section */}
      <section id="postulate" className="py-16 md:py-24 bg-white">
        <div className="px-4 md:px-6 max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-[#6d381a] mb-3 elevas-heading">
              <span className="font-normal text-[#e4b53b]">Postulate</span> ahora
            </h2>
            <div className="w-16 h-px bg-[#e4b53b] mx-auto mb-6 elevas-shimmer" style={{background: 'linear-gradient(90deg, transparent, #e4b53b, transparent)', backgroundSize: '200% 100%'}}></div>
            <p className="text-lg font-light text-[#6d381a]/70 max-w-2xl mx-auto leading-relaxed elevas-body">
              Dejanos tu CV y datos de contacto. Nos comunicaremos contigo si tu perfil coincide con nuestras búsquedas actuales o futuras.
            </p>
          </motion.div>

          <CVUploadForm />
        </div>
      </section>
    </div>
    </>
  )
}