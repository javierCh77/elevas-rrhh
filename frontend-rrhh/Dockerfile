# Dockerfile para Frontend RRHH (Next.js)
# Multi-stage build para producción optimizada

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar package files
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments para variables de entorno de build time
ARG NEXT_PUBLIC_API_URL
ARG OPENAI_API_KEY
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

# Deshabilitar telemetry de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Build de producción
RUN npm run build

# Stage 3: Runner (imagen final)
FROM node:20-alpine AS runner
WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar archivo .env.production
COPY --chown=nextjs:nodejs .env.production .env.production

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Comando de inicio
CMD ["node", "server.js"]
