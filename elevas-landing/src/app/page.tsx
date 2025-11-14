"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Users,
  Brain,
  LineChart,
  Shield,
  UserCheck,
  FileText,
} from "lucide-react";
import ServiceCard from "@/components/service-card";

// Dynamic imports para componentes pesados (optimización de bundle)
const StreamingText = dynamic(() => import("@/components/StreamingText"), {
  ssr: true,
});
const AIChatDemo = dynamic(() => import("@/components/AIChatDemo"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
      <div className="animate-pulse text-muted-foreground">Cargando chat...</div>
    </div>
  ),
});


export default function Home() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const subtitles = [
    "Soluciones inteligentes que combinan tecnología avanzada con sensibilidad humana",
    "Automatizamos procesos complejos mientras potenciamos el factor humano",
    "Transformamos la gestión de talento con inteligencia artificial y expertise"
  ];

 const services = [
  {
    id: "atraccion-seleccion",
    title: "Atracción y Selección de Talento",
    description: "Buscamos y seleccionamos a los candidatos ideales para cada puesto clave.",
    icon: <Users className="h-10 w-10" />, // ✅ Correcto
  },
  {
    id: "talento-capacitacion",
    title: "Gestión del Talento y Capacitación",
    description: "Acompañamos al talento desde su integración hasta su desarrollo continuo.",
    icon: <UserCheck className="h-10 w-10" />, // ✅ Correcto
  },
  {
    id: "compensaciones-legal",
    title: "Compensaciones y Marco Legal",
    description: "Diseñamos esquemas salariales justos y alineados al marco normativo.",
    icon: <FileText className="h-10 w-10" />, // ⬅️ Mejor que Brain aquí
  },
  {
    id: "clima-cultura",
    title: "Clima y Cultura Organizacional",
    description: "Mejoramos el ambiente laboral y alineamos valores organizacionales.",
    icon: <Shield className="h-10 w-10" />, // ✅ Adecuado
  },
  {
    id: "onboarding-transacciones",
    title: "Onboarding y Transiciones Laborales",
    description: "Optimizamos la incorporación y salida del personal con procesos fluidos.",
    icon: <ArrowRight className="h-10 w-10" />, // ⬅️ Representa transición
  },
  {
    id: "feedback-desempeno",
    title: "Feedback y Desarrollo del Desempeño",
    description: "Impulsamos el desarrollo profesional mediante evaluaciones efectivas.",
    icon: <LineChart className="h-10 w-10" />, // ⬅️ Mide rendimiento
  },
  {
    id: "outsourcing",
    title: "Outsourcing de Recursos Humanos",
    description: "Delegá la gestión operativa de RRHH para enfocarte en el crecimiento.",
    icon: <Users className="h-10 w-10" />, // 👥 Alternativa: <UserCheck />
  },
  {
    id: "psicotecnica-competencias",
    title: "Evaluaciones Psicotécnicas y por Competencias",
    description: "Evaluamos habilidades cognitivas y conductuales con precisión.",
    icon: <Brain className="h-10 w-10" />, // ✅ Ideal aquí
  },
];


  return (
    <div className="flex flex-col ">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-start text-left py-16 md:py-32 lg:py-40 xl:py-48 px-6 md:px-16 lg:px-20 overflow-hidden min-h-screen">
        {/* Video de Fondo Optimizado con Blur Sutil */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute top-0 left-0 w-full h-full object-cover z-[-3] opacity-85"
          style={{ filter: 'blur(1px)' }}
          aria-hidden="true"
          role="presentation"
        >
          <source src="/hero.mp4" type="video/mp4" />
          <source src="/hero.webm" type="video/webm" />
          Tu navegador no soporta videos.
        </video>
        
        {/* Overlay negro translúcido suave */}
        <div 
          className="absolute top-0 left-0 w-full h-full bg-black/30 z-[-2]"
          aria-hidden="true"
        />
        
        {/* Minimalist AI Background Fallback */}
        <div 
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-elevas-primary-50 via-white to-elevas-accent-50 z-[-4]"
          aria-hidden="true"
        />

        {/* Contenedor de Texto */}
        <motion.div
          className="relative max-w-4xl space-y-12 z-10 elevas-fade-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight elevas-heading elevas-text-balance">
            <span className="block">El futuro del <span className="text-[#e4b53b] elevas-gradient-text">talento</span></span>
            <span className="block">está aquí</span>
          </h1>
          <div className="text-xl md:text-2xl text-white/90 leading-relaxed font-light max-w-3xl min-h-[100px] flex items-center">
            <StreamingText 
              phrases={subtitles}
              className="block text-white/90"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-start">
            <Button
              asChild
              className="bg-[#e4b53b] hover:bg-[#d4a332] text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 md:px-10 text-base sm:text-lg rounded-xl elevas-lift elevas-press elevas-shadow-colored"
            >
              <Link href="/servicios">
                Explorar servicios <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 elevas-glass font-semibold px-6 py-3 sm:px-8 sm:py-4 md:px-10 text-base sm:text-lg rounded-xl elevas-lift elevas-press"
            >
              <Link href="/contacto">Hablar con un experto</Link>
            </Button>
          </div>
        </motion.div>
      </section>
      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-[#6d381a] mb-3 elevas-slide-up elevas-heading elevas-text-balance">
              Servicios <span className="font-normal text-[#e4b53b] elevas-float">inteligentes</span>
            </h2>
            <div className="w-16 h-px bg-[#e4b53b] mx-auto mb-6 elevas-scale-breath"></div>
            <p className="text-lg font-light text-[#6d381a]/70 max-w-2xl mx-auto leading-relaxed elevas-body elevas-text-balance">
              Soluciones de RRHH diseñadas para la era de la inteligencia artificial,
              donde la tecnología amplifica la sensibilidad humana
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 "
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                description={service.description}
                icon={service.icon}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Chat Demo Section */}
      <section className="py-16 bg-white">
        <div className="px-4 md:px-6 max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-[#6d381a] mb-3 elevas-heading elevas-text-balance">
              Chatea con <span className="font-normal text-[#e4b53b]">EVA</span>, nuestro agente IA
            </h2>
            <div className="w-16 h-px bg-[#e4b53b] mx-auto mb-6 elevas-bounce-subtle"></div>
            <p className="text-lg font-light text-[#6d381a]/70 max-w-2xl mx-auto leading-relaxed elevas-body elevas-text-balance">
              Pregúntale sobre nuestros servicios, metodologías y cómo podemos ayudarte.
              Está disponible 24/7 para resolver tus dudas.
            </p>
          </motion.div>
          <AIChatDemo embedded={true} />
        </div>
      </section>

      {/* Careers CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#6d381a] to-[#8b5a2b] relative overflow-hidden">
        <div className="px-4 md:px-6 relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-white leading-tight elevas-heading">
              ¿Te gustaría <span className="text-[#e4b53b] font-normal">formar parte</span> del equipo?
            </h2>
            <p className="text-lg font-light text-white/80 max-w-2xl mx-auto leading-relaxed elevas-body">
              Únete a nosotros y sé parte de la transformación en recursos humanos con IA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                asChild
                className="bg-[#e4b53b] hover:bg-[#d4a332] text-white font-semibold px-8 py-3 rounded-xl elevas-lift elevas-press elevas-shadow-colored"
              >
                <Link href="/careers">
                  Ver oportunidades <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#f1df96]/30 relative overflow-hidden">
        {/* Subtle AI Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" 
               style={{
                 backgroundImage: `radial-gradient(circle at 2px 2px, rgba(109, 56, 26, 0.08) 1px, transparent 0)`,
                 backgroundSize: '40px 40px'
               }}>
          </div>
        </div>
        
        <div className="px-4 md:px-6 relative z-10 max-w-4xl mx-auto">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-[#6d381a] leading-tight elevas-heading elevas-text-balance">
              ¿Listo para transformar tu
              <span className="text-[#e4b53b] font-normal"> gestión de talento</span>?
            </h2>
            <div className="w-16 h-px bg-[#e4b53b] mx-auto elevas-shimmer" style={{background: 'linear-gradient(90deg, transparent, #e4b53b, transparent)', backgroundSize: '200% 100%'}}></div>
            <p className="text-lg font-light text-[#6d381a]/70 max-w-2xl mx-auto leading-relaxed elevas-body elevas-text-balance">
              Conversemos sobre cómo la inteligencia artificial puede potenciar
              tus procesos de RRHH manteniendo la esencia humana
            </p>
            <Button
              asChild
              className="bg-[#e4b53b] hover:bg-[#e4b53b]/90 text-white font-medium px-8 py-3 rounded-xl elevas-lift elevas-press elevas-shadow-md"
            >
              <Link href="/contacto">
                Iniciar conversación
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
