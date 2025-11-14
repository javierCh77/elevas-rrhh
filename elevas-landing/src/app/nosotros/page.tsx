import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description:
    "Conoce a Consultoría Elevas, expertos en RRHH con enfoque en la automatización e IA para preparar tu empresa para el futuro.",
};

export default function NosotrosPage() {
  const team = [
    {
      name: "Elisa Lo Gioco",
      position: "Directora Fundadora | Lic. en Relaciones del Trabajo | Coach Ontológica",
      bio: "Impulsora de la transformación digital en la gestión del talento humano, con más de 15 años de experiencia liderando equipos, procesos de cambio y formación en habilidades humanas.",
      image: "/team/elisa.jpeg",
    },
    {
      name: "Manuela Rodríguez",
      position: "Lic. en Relaciones del Trabajo | Coach Ontológica",
      bio: "Especialista en innovación en RRHH e integración de inteligencia artificial para potenciar la gestión de personas, con foco en el desarrollo humano y organizacional.",
      image: "/team/manuela.jpeg",
    },
    {
      name: "Maria Inés Arenas",
      position: "Psicologa",
      bio: "Experta en desarrollo organizacional, clima laboral y bienestar emocional en entornos laborales digitales.",
      image: "/team/maria.jpg",
    },
    {
      name: "Natalia Echazarreta",
      position: "Abogada",
      bio: "Asesora legal en derecho laboral, con foco en las nuevas formas de trabajo y los desafíos jurídicos de la era digital.",
      image: "/team/natalia.jpg",
    },
  ];

  return (
    <div className="px-4 py-24 md:px-6 bg-white min-h-screen">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h1 className="text-3xl md:text-4xl font-light text-[#6d381a] mb-3 elevas-slide-up">
            Sobre <span className="font-normal text-[#e4b53b] elevas-float">Nosotros</span>
          </h1>
          <div className="w-16 h-px bg-[#e4b53b] mx-auto mb-6 elevas-pulse-soft"></div>
          <p className="text-lg font-light text-[#6d381a]/70 max-w-2xl mx-auto leading-relaxed">
            Especialistas en recursos humanos que combinan inteligencia artificial 
            con experiencia humana para transformar tu organización
          </p>
        </div>

        <div className="grid gap-16 md:grid-cols-2 items-center mb-24">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-light text-[#6d381a] mb-4">
                Nuestra <span className="font-normal text-[#e4b53b]">Misión</span>
              </h2>
              <p className="text-[#6d381a]/80 leading-relaxed">
                En Elevas, transformamos la gestión de Recursos Humanos para acompañar a las organizaciones en los desafíos de la era digital.
              </p>
              <p className="text-[#6d381a]/80 leading-relaxed mt-4">
                Integramos inteligencia artificial y tecnologías emergentes para automatizar procesos y liberar el potencial humano, impulsando decisiones estratégicas, empatía y creatividad.
              </p>
              <p className="text-[#6d381a]/80 leading-relaxed mt-4">
                Creemos que la tecnología es una aliada del factor humano, no su reemplazo.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl md:text-3xl font-light text-[#6d381a] mb-4">
                Nuestra <span className="font-normal text-[#e4b53b]">Visión</span>
              </h2>
              <p className="text-[#6d381a]/80 leading-relaxed">
                Aspiramos a ser referentes en la transformación digital del área de RRHH, promoviendo organizaciones más humanas, eficientes y preparadas para el futuro.
              </p>
              <p className="text-[#6d381a]/80 leading-relaxed mt-4">
                Visualizamos un mundo laboral donde la tecnología amplifique las capacidades de las personas, fortalezca la cultura y genere entornos de trabajo motivadores y sostenibles.
              </p>
            </div>
          </div>
          <div className="relative w-full h-[500px] rounded-xl overflow-hidden">
            <Image
              src="/vision3.jpg"
              alt="Equipo de Consultoría Elevas"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-[#6d381a] mb-3">
              Nuestros <span className="font-normal text-[#e4b53b]">Valores</span>
            </h2>
            <div className="w-16 h-px bg-[#e4b53b] mx-auto"></div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-[#e4b53b]/10 p-8 rounded-xl hover:bg-[#e4b53b]/20 transition-colors duration-300 text-center">
              <h3 className="text-xl font-medium mb-4 text-[#6d381a]">
                Innovación
              </h3>
              <p className="text-[#6d381a]/80 leading-relaxed">
                Incorporamos herramientas tecnológicas para mejorar procesos y anticiparnos al cambio.
              </p>
            </div>
            <div className="bg-[#e4b53b]/10 p-8 rounded-xl hover:bg-[#e4b53b]/20 transition-colors duration-300 text-center">
              <h3 className="text-xl font-medium mb-4 text-[#6d381a]">
                Humanismo
              </h3>
              <p className="text-[#6d381a]/80 leading-relaxed">
                Ponemos a las personas en el centro de cada solución.
              </p>
            </div>
            <div className="bg-[#e4b53b]/10 p-8 rounded-xl hover:bg-[#e4b53b]/20 transition-colors duration-300 text-center">
              <h3 className="text-xl font-medium mb-4 text-[#6d381a]">
                Adaptabilidad
              </h3>
              <p className="text-[#6d381a]/80 leading-relaxed">
                Ajustamos nuestras estrategias a la cultura y etapa de cada organización.
              </p>
            </div>
            <div className="bg-[#e4b53b]/10 p-8 rounded-xl hover:bg-[#e4b53b]/20 transition-colors duration-300 text-center">
              <h3 className="text-xl font-medium mb-4 text-[#6d381a]">
                Excelencia
              </h3>
              <p className="text-[#6d381a]/80 leading-relaxed">
                Buscamos calidad, claridad y mejora continua en cada proceso que acompañamos.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-[#6d381a] mb-3">
              Nuestro <span className="font-normal text-[#e4b53b]">Equipo</span>
            </h2>
            <div className="w-16 h-px bg-[#e4b53b] mx-auto"></div>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white border border-[#6d381a]/10 hover:border-[#e4b53b]/50 p-8 rounded-xl text-center transition-all duration-300 hover:shadow-lg"
              >
                <Image
                  src={`${member.image}`}
                  width={120}
                  height={120}
                  alt={`Foto de ${member.name}`}
                  className="w-28 h-28 rounded-full object-cover mx-auto mb-6"
                />
                <h3 className="text-lg font-medium mb-2 text-[#6d381a]">
                  {member.name}
                </h3>
                <p className="text-[#e4b53b] font-medium mb-4 text-sm">
                  {member.position}
                </p>
                <p className="text-[#6d381a]/70 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#e4b53b]/10 p-12 md:p-16 rounded-xl text-center">
          <h2 className="text-3xl md:text-4xl font-light text-[#6d381a] mb-4">
            ¿Listo para transformar tu 
            <span className="font-normal text-[#e4b53b]"> departamento de RRHH</span>?
          </h2>
          <p className="text-[#6d381a]/80 mb-8 max-w-2xl mx-auto leading-relaxed text-lg">
            Contáctanos hoy mismo para descubrir cómo podemos ayudarte a preparar
            tu empresa para el futuro del trabajo.
          </p>
          <Button
            asChild
            className="bg-[#e4b53b] hover:bg-[#e4b53b]/90 text-white font-medium px-8 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Link href="/contacto">Agenda una consulta gratuita</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
