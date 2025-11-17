# Dockerfile para Elevas Landing (Next.js)
# Build optimizado para producción

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Actualizar npm y deshabilitar avisos
RUN npm install -g npm@latest && \
    npm config set fund false && \
    npm config set audit false

# Copiar package files
COPY package.json package-lock.json ./

# Instalar dependencias (incluye devDependencies para el build)
RUN npm ci --silenpt

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Deshabilitar avisos de npm
RUN npm config set fund false && \
    npm config set audit false

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments para variables de entorno de build time
ARG NEXT_PUBLIC_BACKEND_URL
ARG OPENAI_API_KEY
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

# Deshabilitar telemetry de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Build de producción
RUN npm run build --silent

# Stage 3: Runner (imagen final)
FROM node:20-alpine AS runner
WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copiar archivo .env.production como .env
COPY .env.production .env

# Cambiar ownership
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3002

ENV PORT=3002
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Comando de inicio
CMD ["node", "server.js"]
