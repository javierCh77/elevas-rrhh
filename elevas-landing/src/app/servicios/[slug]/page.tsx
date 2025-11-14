import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  FileText,
  LineChart,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const service = services.find((s) => s.id === resolvedParams.slug);

  if (!service) {
    return {
      title: "Servicio no encontrado",
    };
  }

  return {
    title: service.title,
    description: service.description,
  };
}

export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.id,
  }));
}

const services = [
  {
    id: "atraccion-seleccion",
    title: "Atracción y Selección de Talento",
    description:
      "aaIdentificamos, atraemos y contratamos a los candidatos ideales para tu empresa.",
    icon: <Users className="h-12 w-12 text-[#e4b53b]" />,
    image: "/service/atraccion.jpg",
    longDescription: `
      <p>Conectamos tu empresa con el talento adecuado a través de un proceso ágil, tecnológico y profesional. Combinamos métodos tradicionales con inteligencia artificial para identificar, evaluar y atraer a los mejores perfiles, asegurando calidad y efectividad.</p>
      <br/>
      <h3 class="font-bold text-xl mb-1 text-[#6d381a]">Nuestro proceso incluye:</h3>


      
      <ul>
        <li>•	Análisis del puesto y la cultura organizacional</li>
        <li>•	Búsqueda activa en múltiples canales</li>
        <li>•	Evaluación de competencias técnicas y blandas</li>
        <li>•	Verificación exhaustiva de antecedentes</li>
        <li>•	Acompañamiento durante el proceso de incorporación</li>
        <li>•	Uso de herramientas de IA para predecir desempeño y reducir rotación</li>
      </ul>
      
    `,
    benefits: [
      "	Hasta 40% menos tiempo de contratación",
      "	Menor rotación temprana",
      "	Mejor adaptación cultural",
      "	Acceso a talento pasivo de calidad",
      "	Selección libre de sesgos",
    ],
  },
  {
    id: "talento-capacitacion",
    title: "Gestión del Talento y Capacitación",
    description:
      "Facilitamos una integración exitosa y fluida de nuevos empleados a tu organización.",
    icon: <UserCheck className="h-12 w-12 text-[#e4b53b]" />,
    image: "/service/gestion.jpg",
    longDescription: `
      <p>Desarrollamos soluciones integrales para atraer, evaluar y potenciar el talento interno, combinando inteligencia artificial, metodologías ágiles y una mirada estratégica adaptada a la cultura de cada organización.</p>
      <br/>
      <h3 class="font-bold text-xl mb-1 text-[#6d381a]">Nuestro proceso incluye:</h3>


      
      <ul>
        <li>•	Búsqueda activa de perfiles</li>
        <li>•	Evaluación por competencias y ajuste cultural</li>
        <li>•	Acompañamiento en el proceso de integración</li>
        <li>•	Detección de necesidades formativas</li>
        <li>•	Programas personalizados</li>
        <li>•	Optimización del aprendizaje con herramientas digitales</li>
      </ul>
      
    `,
    benefits: [
      "	Productividad y desempeño mejorados",
      "	Desarrollo de habilidades clave",
      "	Cultura de aprendizaje constante",
    ],
  },
  {
    id: "compensaciones-legal",
    title: "Compensaciones y Marco Legal",
    description:
      "Desarrollamos y optimizamos el potencial humano dentro de tu empresa.",
    icon: <FileText className="h-12 w-12 text-[#e4b53b]" />,
    image: "/service/marco.jpg",
    longDescription: `
      <p>Administramos de forma eficiente sueldos, beneficios, licencias y vacaciones, garantizando cumplimiento legal, trazabilidad y excelencia operativa en cada proceso.</p>
      <br/>
      <h3 class="font-bold text-xl mb-1 text-[#6d381a]">Nuestro proceso incluye:</h3>


      
      <ul>
        <li>•	Liquidación de sueldos y cargas sociales</li>
        <li>•	Administración de beneficios e incentivos</li>
        <li>•	Asesoramiento normativo laboral y fiscal</li>
        <li>•	Planificación de licencias y ausencias</li>
        <li>•	Informes de rotación, ausentismo y costos</li>
        <li>•	Soporte en plataformas de payroll</li>
      </ul>
      
    `,
    benefits: [
      "	Cumplimiento normativo sin riesgos",
      "	Reducción de errores y tiempos",
      "	Gestión profesional y transparente",
    ],
  },
  {
    id: "clima-cultura",
    title: "Clima y Cultura Organizacional",
    description:
      "Gestionamos de manera eficiente los pagos y beneficios de tus empleados, asegurando el cumplimiento normativo.",
    icon: <Shield className="h-12 w-12 text-[#e4b53b]" />,
    image: "/service/clima.jpg",
    longDescription: `
      <p>Medimos y fortalecemos el clima y la cultura de tu empresa para crear entornos laborales humanos, alineados y sostenibles. Acompañamos procesos de transformación con foco en la experiencia del colaborador.</p>
      <br/>
      <h3 class="font-bold text-xl mb-1 text-[#6d381a]">Nuestro proceso incluye:</h3>


      
      <ul>
        <li>•	Encuestas de clima laboral</li>
        <li>•	Análisis de resultados y propuestas de mejora</li>
        <li>•	Iniciativas para el bienestar y la motivación</li>
        <li>•	Mapeo y evolución de la cultura organizacional</li>
        <li>•	Diseño de experiencias a lo largo del ciclo del colaborador</li>
      </ul>
      
    `,
    benefits: [
      "	Mayor motivación y satisfacción",
      "	Reducción de conflictos",
      "	Aumento del compromiso y la productividad",
      "	Cultura organizacional alineada",
    ],
  },
  {
    id: "onboarding-transacciones",
    title: "Onboarding y Transiciones Laborales",
    description:
      "Monitoreamos y mejoramos el ambiente de trabajo, promoviendo el bienestar y la productividad.",
    icon: <ArrowRight className="h-12 w-12 text-[#e4b53b]" />,
    image: "/service/onboarding.jpg",
    longDescription: `
      <p>Diseñamos procesos de incorporación y salida respetuosos, estructurados y centrados en las personas. Acompañamos a los colaboradores en cada transición para garantizar una experiencia positiva, sin impacto negativo.</p>
      <br/>
      <h3 class="font-bold text-xl mb-1 text-[#6d381a]">Nuestro proceso incluye:</h3>


      
      <ul>
        <li>•	Plan de bienvenida e inducción</li>
        <li>•	Seguimiento de la adaptación</li>
        <li>•	Entrevistas de mejora y planes de acción</li>
        <li>•	Soporte en desvinculaciones, jubilaciones o cambios de rol</li>
      </ul>
      
    `,
    benefits: [
      "	Adaptación más rápida y efectiva",
      "	Mayor compromiso desde el ingreso",
      "	Retención de talento",
      "	Procesos de salida más humanos y ordenados",
    ],
  },
  {
    id: "feedback-desempeno",
    title: "Feedback y Desarrollo del Desempeño",
    description:
      "Medimos el rendimiento de los empleados y proporcionamos retroalimentación para su mejora continua.",
    icon: <LineChart className="h-12 w-12 text-[#e4b53b]" />,
    image: "/service/feedback.jpg",
    longDescription: `
      <p>Fomentamos una cultura de mejora continua con prácticas de feedback ágil y objetivos claros. Nuestro enfoque promueve el crecimiento individual y colectivo con mirada empática y foco en resultados.</p>
      <br/>
      <h3 class="font-bold text-xl mb-1 text-[#6d381a]">Nuestro proceso incluye:</h3>


      
      <ul>
        <li>•	Definición de objetivos alineados al negocio</li>
        <li>•	Feedback regular y evaluaciones 360°</li>
        <li>•	Planes de desarrollo personalizados</li>
        <li>•	Seguimiento de avances y desempeño</li>
      </ul>
      
    `,
    benefits: [
      "	Mejora sostenida del rendimiento",
      "	Desarrollo de habilidades clave",
      "	Alineación con los objetivos organizacionales",
    ],
  },
  {
    id: "outsourcing",
    title: "Outsourcing de Recursos Humanos",
    description:
      "Evaluamos las razones por las que los empleados dejan la empresa para reducir la rotación.",
    icon: <Users className="h-12 w-12 text-[#e4b53b]" />,
    image: "/service/outsourcing.jpg",
    longDescription: `
      <p>Externalizamos procesos de RRHH con profesionalismo, agilidad y flexibilidad. Nos adaptamos a las necesidades y cultura de tu empresa para brindar soluciones eficientes y confiables.</p>
      <br/>
      <h3 class="font-bold text-xl mb-1 text-[#6d381a]">Nuestro proceso incluye:</h3>


      
      <ul>
        <li>•	Administración de personal y documentación</li>
        <li>•	Gestión de nómina, licencias y legajos</li>
        <li>•	Coordinación de selección y onboarding</li>
        <li>•	Asistencia legal y cumplimiento normativo</li>
        <li>•	Reportes, indicadores y mejora continua</li>
      </ul>
      
    `,
    benefits: [
      " Ahorro de tiempo y recursos internos",
      "	Gestión especializada y eficiente",
      " Cumplimiento legal y trazabilidad asegurados",
    ],
  },
  {
    id: "psicotecnica-competencias",
    title: "Evaluaciones Psicotécnicas y por Competencias",
    description:
      "Evaluamos habilidades, rasgos conductuales y el encaje cultural para potenciar decisiones estratégicas de RRHH.",
    icon: <Brain className="h-12 w-12 text-[#e4b53b]" />,
    image: "/service/competencias.jpg",
    longDescription: `
      <p>Aplicamos herramientas profesionales para evaluar habilidades, personalidad y competencias clave, con un enfoque integral que combina precisión técnica y mirada contextualizada.</p>
      <br/>
      <h3 class="font-bold text-xl mb-1 text-[#6d381a]">Nuestro proceso incluye:</h3>


      
      <ul>
        <li>•	Tests psicométricos y proyectivos</li>
        <li>•	Evaluaciones de competencias blandas y técnicas</li>
        <li>•	Informes claros y personalizados</li>
        <li>•	Adaptación de herramientas al perfil requerido</li>
        <li>•	Asesoramiento en decisiones de selección o desarrollo</li>
      </ul>
      
    `,
    benefits: [
      " Mejor calidad en contrataciones y promociones",
      "	Toma de decisiones más objetivas",
      " Reducción de riesgos en procesos de RRHH",
    ],
  },
];

export default async function ServicePage({ params }: Props) {
  const resolvedParams = await params; // Asegúrate de que params está resuelto
  const service = services.find((s) => s.id === resolvedParams.slug);

  if (!service) {
    notFound();
  }

  // JSON-LD structured data para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': service.title,
    'description': service.description,
    'provider': {
      '@type': 'Organization',
      'name': 'Elevas',
      'url': 'https://elevas.com.ar'
    },
    'areaServed': {
      '@type': 'Country',
      'name': 'Argentina'
    },
    'offers': {
      '@type': 'Offer',
      'availability': 'https://schema.org/InStock'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="px-4 py-16 md:py-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        <Link
          href="/servicios"
          className="inline-flex items-center text-[#6d381a] hover:text-[#e4b53b] mb-8 transition-colors duration-300 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
          Volver a servicios
        </Link>

        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-[#f1df96]/50 rounded-xl border border-[#e4b53b]/20 shadow-sm">
              {service.icon}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-[#6d381a] mb-3 elevas-slide-up">
            {service.title.split(' ').slice(0, 2).join(' ')}{' '}
            <span className="font-normal text-[#e4b53b] elevas-float">
              {service.title.split(' ').slice(2).join(' ')}
            </span>
          </h1>
          <div className="w-16 h-px bg-[#e4b53b] mx-auto mb-6 elevas-pulse-soft"></div>
          <p className="text-lg font-light text-[#6d381a]/70 max-w-2xl mx-auto leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Service Image - Mobile Only */}
            <div className="lg:hidden relative w-full h-[300px] rounded-xl overflow-hidden shadow-lg">
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Description */}
            <div
              className="prose prose-lg max-w-none text-[#6d381a]/80 prose-headings:text-[#6d381a] prose-strong:text-[#6d381a] prose-li:text-[#6d381a]/80"
              dangerouslySetInnerHTML={{ __html: service.longDescription }}
            />

            {/* Benefits */}
            <div className="bg-[#f1df96]/20 rounded-xl p-6 border border-[#e4b53b]/10">
              <h3 className="text-xl font-medium mb-6 text-[#6d381a]">
                Beneficios principales
              </h3>
              <ul className="space-y-3">
                {service.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 rounded-full bg-[#e4b53b] flex items-center justify-center text-white text-xs font-medium">
                      ✓
                    </div>
                    <span className="text-[#6d381a]/80 leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button - Mobile Only */}
            <div className="lg:hidden">
              <Button
                asChild
                className="w-full bg-[#e4b53b] hover:bg-[#e4b53b]/90 text-white font-medium py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Link href="/contacto">Solicitar información</Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Service Image - Desktop */}
              <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Contact Card */}
              <div className="p-6 bg-gradient-to-br from-[#f1df96]/30 to-[#e4b53b]/10 rounded-xl border border-[#e4b53b]/20 shadow-sm">
                <h3 className="text-xl font-medium mb-4 text-[#6d381a]">
                  ¿Te interesa este servicio?
                </h3>
                <p className="text-[#6d381a]/70 mb-6 leading-relaxed">
                  Contáctanos para una consulta personalizada y descubre cómo podemos
                  ayudarte a optimizar tus procesos de RRHH.
                </p>
                <Button
                  asChild
                  className="w-full bg-[#e4b53b] hover:bg-[#e4b53b]/90 text-white font-medium py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Link href="/contacto">Contactar ahora</Link>
                </Button>
              </div>

              {/* Additional Info Card */}
              <div className="p-6 bg-white rounded-xl border border-[#6d381a]/10 shadow-sm">
                <h4 className="font-medium text-[#6d381a] mb-3">¿Necesitas más información?</h4>
                <p className="text-sm text-[#6d381a]/60 mb-4">
                  Explora todos nuestros servicios de RRHH y encuentra la solución perfecta para tu empresa.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#6d381a]/20 text-[#6d381a] hover:bg-[#e4b53b]/10 hover:border-[#e4b53b]"
                >
                  <Link href="/servicios">Ver todos los servicios</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
