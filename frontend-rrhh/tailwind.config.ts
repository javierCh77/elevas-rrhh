import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'slideUp': 'slideUp 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(207, 175, 110, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(207, 175, 110, 0.6), 0 0 30px rgba(207, 175, 110, 0.4)' },
        },
      },
      colors: {
        // 🌟 Elevas Premium Color Palette
        elevas: {
          // Primary - Dorado Premium (Brand Identity)
          primary: {
            50: '#fefcf5',
            100: '#fdf7e6',
            200: '#faedc7',
            300: '#f4e4c1',  // Dorado Claro - fondos suaves
            400: '#e5c988',
            500: '#cfaf6e',  // Dorado Premium - brand principal
            600: '#a37d43',  // Dorado Oscuro - hover, bordes
            700: '#8b6a37',
            800: '#6d5329',
            900: '#4a3a1e',
            DEFAULT: '#cfaf6e'
          },
          // Neutrales Premium
          neutral: {
            50: '#f9f9f9',   // Gris Claro Fondo
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#666666',  // Gris Medio - subtítulos
            700: '#424242',
            800: '#2c2c2c',  // Gris Oscuro Texto - títulos
            900: '#1a1a1a',
            DEFAULT: '#666666'
          },
          // Coral Elegante - botones secundarios, alerts suaves
          coral: {
            50: '#fdf5f3',
            100: '#fbe8e4',
            200: '#f6d1c8',
            300: '#eeb5a4',
            400: '#e5967f',
            500: '#e07a5f',  // Coral Elegante principal
            600: '#d4634a',
            700: '#b4533e',
            800: '#924539',
            900: '#763b35',
            DEFAULT: '#e07a5f'
          },
          // Verde Suave - estados positivos, validaciones
          green: {
            50: '#f4f7f5',
            100: '#e6f0e8',
            200: '#c8e1ce',
            300: '#a3cfac',
            400: '#7bb586',
            500: '#6b9b78',  // Verde Suave principal
            600: '#598066',
            700: '#4a6856',
            800: '#3e5548',
            900: '#35473d',
            DEFAULT: '#6b9b78'
          },
          // Rojo Terracota - errores, alertas críticas
          red: {
            50: '#fdf4f4',
            100: '#fbe6e6',
            200: '#f5cfcf',
            300: '#ecadad',
            400: '#e08080',
            500: '#c94f4f',  // Rojo Terracota principal
            600: '#b44444',
            700: '#963939',
            800: '#7c3333',
            900: '#682f2f',
            DEFAULT: '#c94f4f'
          },
          // Bronce Profundo - módulos tecnológicos, AI copiloto
          bronze: {
            50: '#faf7f3',
            100: '#f4ede4',
            200: '#e8d8c4',
            300: '#d8bfa0',
            400: '#c49976',
            500: '#8b4513',  // Bronce Profundo principal
            600: '#7a3e11',
            700: '#68360f',
            800: '#562d0c',
            900: '#47260a',
            DEFAULT: '#8b4513'
          }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}

export default config