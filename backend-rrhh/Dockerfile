FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el proyecto
COPY . .

# Build
RUN npm run build

# Crear directorio para uploads
RUN mkdir -p /app/uploads

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV PORT=3000
ENV NODE_ENV=production

# Iniciar
CMD ["node", "dist/main"]
