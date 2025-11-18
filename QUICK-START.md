# 🚀 Quick Start - Elevas RRHH con Docker

## ⚡ Inicio Rápido (5 minutos)

### 1. Configurar Variables de Entorno

```bash
# Copiar el template
cp .env.example .env

# Editar con tus valores
nano .env  # o usa tu editor favorito
```

**Variables MÍNIMAS que debes cambiar:**

```bash
# En .env, busca y modifica:
JWT_SECRET=tu_secret_aqui_minimo_32_caracteres_long
DB_PASSWORD=tu_password_seguro_de_postgresql
OPENAI_API_KEY=sk-tu-api-key-de-openai
MAIL_PASSWORD=tu-gmail-app-password
```

### 2. Iniciar Docker

**En Windows:**
```bash
docker-start.bat
```

**En Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

**O manualmente:**
```bash
docker-compose up -d --build
```

### 3. Acceder a los Servicios

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:3001
- **Landing**: http://localhost:3002

---

## 🛠️ Comandos Útiles

### Windows
- Iniciar: `docker-start.bat`
- Detener: `docker-stop.bat`
- Ver logs: `docker-logs.bat`
- Reiniciar: `docker-restart.bat`

### Linux/Mac
- Iniciar: `./docker-start.sh`
- Detener: `./docker-stop.sh`
- Ver logs: `./docker-logs.sh`
- Reiniciar: `./docker-restart.sh`

### Comandos Docker Directos
```bash
# Ver estado
docker-compose ps

# Ver logs en vivo
docker-compose logs -f

# Reiniciar un servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Detener y borrar datos (⚠️ CUIDADO)
docker-compose down -v
```

---

## 📝 Estructura de Contenedores

```
database (PostgreSQL) → Puerto 3034
    ↓
backend (NestJS) → Puerto 3000
    ↓
  ┌─────┴─────┐
frontend      landing
Puerto 3001   Puerto 3002
```

---

## ❓ Problemas Comunes

### Error: Puerto ya en uso
```bash
# Ver qué usa el puerto
netstat -ano | findstr :3000

# Cambiar puerto en docker-compose.yml
ports:
  - "3100:3000"  # Usa 3100 en vez de 3000
```

### Backend no conecta a DB
```bash
# Verificar que database esté corriendo
docker-compose ps database

# Ver logs de database
docker-compose logs database
```

### Variables de entorno no cargan
```bash
# Verificar que .env existe
ls -la .env

# Reconstruir servicios
docker-compose up -d --build
```

---

## 📚 Documentación Completa

Para más detalles, ver [DOCKER-DEPLOY.md](DOCKER-DEPLOY.md)

---

## 🔒 Checklist de Seguridad

Antes de producción, verifica:

- [ ] Cambiar `JWT_SECRET` y `JWT_REFRESH_SECRET`
- [ ] Usar contraseña fuerte en `DB_PASSWORD`
- [ ] Configurar `OPENAI_API_KEY` real
- [ ] Configurar `MAIL_PASSWORD` de Gmail
- [ ] Actualizar `CORS_ORIGIN` con tus dominios
- [ ] NUNCA commitear `.env` a git
- [ ] Configurar SSL/HTTPS en producción

---

## 💡 Tips

1. **Primera vez**: El build tarda 20-30 min
2. **Rebuilds**: Solo toman 2-3 min gracias al caché
3. **Desarrollo**: Usa los puertos 3000/3001/3002
4. **Producción**: Configura Nginx como reverse proxy
5. **Backups**: Programa backups de los volúmenes Docker

---

¡Listo! 🎉 Tu aplicación debería estar corriendo.
