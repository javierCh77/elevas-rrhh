# 🐳 Docker - Elevas Landing

## Requisitos
- Docker instalado
- Docker Compose instalado
- Archivo `.env` configurado en la raíz del proyecto

## 📝 Configuración

1. **Crear archivo .env en la raíz del proyecto**
   ```bash
   cp .env.example .env
   ```

2. **Editar .env con tus valores reales**
   - Configura `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_DOMAIN`
   - Configura OpenAI: `OPENAI_API_KEY`
   - Configura Nodemailer: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`

   **IMPORTANTE**: El archivo `.env` será copiado dentro del contenedor Docker durante el build.

## 🚀 Comandos Docker

### Construcción y ejecución con Docker Compose (Recomendado)

```bash
# Construir y levantar el contenedor
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener el contenedor
docker-compose down

# Reconstruir después de cambios
docker-compose up -d --build
```

### Comandos Docker tradicionales

```bash
# Construir la imagen
docker build -t elevas-landing .

# Ejecutar el contenedor
docker run -d \
  --name elevas-landing \
  -p 3002:3002 \
  --env-file .env \
  elevas-landing

# Ver logs
docker logs -f elevas-landing

# Detener el contenedor
docker stop elevas-landing

# Eliminar el contenedor
docker rm elevas-landing
```

## 🔍 Verificación

Una vez que el contenedor esté corriendo, visita:
- http://localhost:3002

## 🛠️ Troubleshooting

### Ver logs en tiempo real
```bash
docker-compose logs -f elevas-landing
```

### Entrar al contenedor
```bash
docker exec -it elevas-landing sh
```

### Reconstruir desde cero
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Ver uso de recursos
```bash
docker stats elevas-landing
```

## 📦 Estructura del Dockerfile

El Dockerfile usa un build multi-stage:
1. **deps**: Instala las dependencias
2. **builder**: Construye la aplicación Next.js
3. **runner**: Imagen final optimizada (solo lo necesario para correr)

Esto resulta en una imagen final muy ligera y segura.

## 🌐 Variables de Entorno

El proyecto utiliza un archivo `.env` que debe estar en la raíz del proyecto antes de construir la imagen Docker.

### Variables requeridas en .env:
- `NEXT_PUBLIC_API_URL` - URL de tu API
- `NEXT_PUBLIC_DOMAIN` - URL de tu dominio
- `OPENAI_API_KEY` - API key de OpenAI
- `MAIL_HOST` - Host del servidor SMTP
- `MAIL_PORT` - Puerto SMTP (587 para TLS)
- `MAIL_USER` - Usuario del correo
- `MAIL_PASSWORD` - Contraseña del correo

**Nota**: El archivo `.env` se copia dentro de la imagen Docker durante el build, así que asegúrate de tenerlo configurado antes de ejecutar `docker-compose up`.

## 🔒 Seguridad

- El contenedor corre con un usuario no-root (nextjs:nodejs)
- Se usa Node.js Alpine para minimizar la superficie de ataque
- Las variables sensibles nunca se incluyen en la imagen
