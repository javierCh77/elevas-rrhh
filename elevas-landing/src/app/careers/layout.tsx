import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Careers - Únete a nuestro equipo",
  description: "Formá parte del equipo que está transformando los recursos humanos con inteligencia artificial. Descubrí oportunidades de carrera en Elevas Consulting.",
  keywords: ["careers", "empleos", "trabajo", "RRHH", "recursos humanos", "oportunidades", "postulaciones", "cv", "elevas"],
  openGraph: {
    title: "Careers - Únete a nuestro equipo | Elevas Consulting",
    description: "Formá parte del equipo que está transformando los recursos humanos con inteligencia artificial.",
    type: "website",
  },
}

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}