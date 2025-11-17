# 🚀 Guía de Despliegue - Elevas Landing

## Prerequisitos en el VPS

1. **Docker y Docker Compose instalados**
2. **Nginx instalado**
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

3. **Git instalado**
   ```bash
   sudo apt install git -y
   ```

## Pasos de Despliegue

### 1. Clonar el Repositorio

```bash
cd ~
git clone <tu-repo-url> elevas-rhh
cd elevas-rhh/elevas-landing
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
nano .env  # Editar con tus valores reales
```

### 3. Levantar el Contenedor Docker

```bash
docker-compose up -d --build
```

Verificar que el contenedor está corriendo:
```bash
docker-compose ps
docker-compose logs -f  # Ver logs
```

### 4. Configurar Nginx

```bash
chmod +x setup-nginx.sh
./setup-nginx.sh
```

Esto:
- Copia la configuración de Nginx
- Habilita el sitio
- Recarga Nginx

### 5. Configurar SSL (HTTPS) - Opcional pero Recomendado

**Antes de ejecutar, asegúrate de que:**
- Tu dominio `elevasconsulting.com` apunte a la IP del VPS
- Los puertos 80 y 443 estén abiertos en el firewall

```bash
chmod +x setup-ssl.sh
./setup-ssl.sh
```

## Verificación

1. **Verificar que Docker está corriendo:**
   ```bash
   curl http://localhost:3002
   ```

2. **Verificar que Nginx está funcionando:**
   ```bash
   curl http://elevasconsulting.com
   ```

3. **Verificar SSL (si lo configuraste):**
   ```bash
   curl https://elevasconsulting.com
   ```

## Actualizar el Sitio

Cuando hagas cambios en el código:

```bash
cd ~/elevas-rhh/elevas-landing
git pull
docker-compose down
docker-compose up -d --build
```

## Comandos Útiles

### Ver logs del contenedor
```bash
docker-compose logs -f elevas-landing
```

### Reiniciar el contenedor
```bash
docker-compose restart
```

### Detener el contenedor
```bash
docker-compose down
```

### Ver estado de Nginx
```bash
sudo systemctl status nginx
```

### Recargar Nginx (después de cambios)
```bash
sudo nginx -t  # Probar configuración
sudo systemctl reload nginx
```

### Ver logs de Nginx
```bash
sudo tail -f /var/log/nginx/elevas-landing-access.log
sudo tail -f /var/log/nginx/elevas-landing-error.log
```

## Troubleshooting

### El sitio no carga

1. Verificar que el contenedor está corriendo:
   ```bash
   docker-compose ps
   ```

2. Ver logs del contenedor:
   ```bash
   docker-compose logs
   ```

3. Verificar Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### Error de puerto 3002 en uso

```bash
# Ver qué está usando el puerto
sudo lsof -i :3002
# O
sudo netstat -tulpn | grep 3002

# Detener el proceso si es necesario
docker-compose down
```

### SSL no funciona

1. Verificar que el dominio apunta al servidor:
   ```bash
   nslookup elevasconsulting.com
   ```

2. Verificar puertos abiertos:
   ```bash
   sudo ufw status
   sudo ufw allow 80
   sudo ufw allow 443
   ```

3. Renovar certificado manualmente:
   ```bash
   sudo certbot renew --dry-run
   ```

## Arquitectura del Despliegue

```
Internet
    ↓
Nginx (Puerto 80/443)
    ↓
Docker Container (Puerto 3002)
    ↓
Next.js App
```

## Seguridad

- ✅ El contenedor corre como usuario no-root
- ✅ Las variables de entorno sensibles no se suben a Git
- ✅ SSL/HTTPS configurado (si ejecutaste setup-ssl.sh)
- ✅ Headers de seguridad configurados en Nginx
