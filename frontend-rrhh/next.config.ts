import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar modo estricto de React
  reactStrictMode: true,

  // Output standalone para Docker
  output: 'standalone',

  // Ignorar errores de TypeScript durante el build (temporal)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignorar errores de ESLint durante el build (temporal)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimización de imágenes
  images: {
    domains: ['api.dicebear.com', 'localhost', 'api.elevas-app.com'], // Agregar dominios permitidos
    formats: ['image/avif', 'image/webp'],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // Compresión
  compress: true,

  // Remover header "Powered by Next.js" por seguridad
  poweredByHeader: false,

  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },
};

export default nextConfig;
