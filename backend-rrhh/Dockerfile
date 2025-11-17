# Dockerfile para Backend RRHH (NestJS)
# Multi-stage build para producción optimizada

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar package files
COPY package.json package-lock.json ./

# Instalar dependencias (incluye devDependencies para build)
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build de producción
RUN npm run build

# Stage 3: Runner (imagen final)
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar solo dependencias de producción
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar build del stage anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copiar archivo .env.production
COPY .env.production .env

# Crear directorio para uploads
RUN mkdir -p /app/uploads

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Cambiar ownership
RUN chown -R nestjs:nodejs /app

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Comando de inicio para producción
CMD ["node", "dist/main"]
