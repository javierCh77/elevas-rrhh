FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el proyecto
COPY . .

# Copiar archivo .env
COPY .env ./

# Build
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV PORT=3001
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Iniciar
CMD ["npm", "start"]
