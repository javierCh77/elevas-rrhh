import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { AutoLogoutProvider } from "@/components/auth/auto-logout-provider";
import { RouteGuard } from "@/components/auth/route-guard";
import { SonnerProvider } from "@/components/providers/sonner-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Elevas RRHH - Sistema de Gestión de Recursos Humanos",
    template: "%s | Elevas RRHH"
  },
  description: "Plataforma integral de gestión de recursos humanos y reclutamiento con IA. Gestiona candidatos, procesos de selección, entrevistas y análisis de CVs de manera eficiente.",
  keywords: ["RRHH", "recursos humanos", "reclutamiento", "gestión de talento", "ATS", "análisis CV", "IA recruiting"],
  authors: [{ name: "Elevas" }],
  creator: "Elevas",
  publisher: "Elevas",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://rrhh.elevas.com.ar",
    title: "Elevas RRHH - Sistema de Gestión de Recursos Humanos",
    description: "Plataforma integral de gestión de recursos humanos y reclutamiento con IA",
    siteName: "Elevas RRHH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevas RRHH - Sistema de Gestión de Recursos Humanos",
    description: "Plataforma integral de gestión de recursos humanos y reclutamiento con IA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <RouteGuard>
            <AutoLogoutProvider>
              {children}
            </AutoLogoutProvider>
          </RouteGuard>
        </AuthProvider>
        <SonnerProvider />
      </body>
    </html>
  );
}
