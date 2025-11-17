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

# Exponer puerto
EXPOSE 3002

# Variables de entorno
ENV PORT=3002
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Iniciar
CMD ["npm", "start"]
