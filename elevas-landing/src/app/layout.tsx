import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ScrollProgress from "@/components/scroll-progress"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"]
})

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"]
})

export const metadata: Metadata = {
  title: {
    template: "%s | Consultoría Elevas",
    default: "Consultoría Elevas - Soluciones de RRHH para el Futuro",
  },
  description:
    "Consultoría especializada en RRHH con enfoque en la automatización e IA para preparar tu empresa para el futuro. Atracción de talento, capacitación, nómina y outsourcing.",
  keywords: ["RRHH", "recursos humanos", "consultoría", "automatización", "IA", "reclutamiento", "talento", "nómina", "outsourcing", "capacitación", "onboarding", "feedback", "desempeño", "clima laboral"],
  authors: [{ name: "Consultoría Elevas" }],
  creator: "Consultoría Elevas",
  publisher: "Consultoría Elevas",
  metadataBase: new URL('https://elevas.com'),
  icons: {
    icon: '/logoelevas.ico',
    shortcut: '/logoelevas.ico',
    apple: '/logoelevas.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://elevas.com',
    siteName: 'Consultoría Elevas',
    title: 'Consultoría Elevas - Soluciones de RRHH para el Futuro',
    description: 'Consultoría especializada en RRHH con enfoque en la automatización e IA. Atracción de talento, capacitación, nómina y outsourcing.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Consultoría Elevas - RRHH del Futuro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consultoría Elevas - RRHH del Futuro',
    description: 'Preparamos tu empresa para los desafíos de la digitalización en RRHH',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Consultoría Elevas",
    "description": "Consultoría especializada en RRHH con enfoque en la automatización e IA para preparar tu empresa para el futuro",
    "url": "https://elevas.com",
    "logo": "https://elevas.com/logo.png",
    "sameAs": [
      "https://ar.linkedin.com/company/elevas-consulting",
      "https://www.instagram.com/elevasconsulting?igsh=amoydTk4cWJpbnM4"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Spanish"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Argentina"
    },
    "serviceType": [
      "Recursos Humanos",
      "Consultoría RRHH",
      "Atracción de Talento",
      "Capacitación",
      "Outsourcing RRHH"
    ]
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ScrollProgress />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}