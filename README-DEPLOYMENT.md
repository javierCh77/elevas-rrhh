# Deployment Manual - Elevas RRHH

## 🚀 Quick Start

### 1. Verificar configuración
```bash
chmod +x *.sh
./check-config.sh
```

### 2. Desplegar todo
```bash
./deploy-all.sh
```

### 3. Verificar
```bash
docker ps | grep elevas
```

## 📋 Archivos Creados

### Configuración
- `backend-rrhh/.env.production` - Variables de entorno del Backend
- `frontend-rrhh/.env.production` - Variables de entorno del Frontend
- `elevas-landing/.env.production` - Variables de entorno del Landing

### Scripts de Deployment
- `deploy-backend.sh` - Despliega solo el backend
- `deploy-frontend.sh` - Despliega solo el frontend
- `deploy-landing.sh` - Despliega solo el landing
- `deploy-all.sh` - Despliega todo de una vez
- `check-config.sh` - Verifica la configuración

### Documentación
- `DEPLOYMENT.md` - Guía completa de deployment
- `ARQUITECTURA.md` - Diagrama de arquitectura y configuración

## 🌐 Dominios Configurados

| Servicio | Dominio | Puerto |
|----------|---------|--------|
| Backend | api.elevas-app.com | 3000 |
| Frontend | elevas-app.com | 3001 |
| Landing | elevasconsultin.com | 3002 |

## 📦 Arquitectura

3 Contenedores Docker independientes que se comunican entre sí:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Landing   │────▶│  Frontend   │────▶│   Backend   │
│   :3002     │     │   :3001     │     │   :3000     │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │ PostgreSQL  │
                                        │   :5432     │
                                        └─────────────┘
```

## 🔧 Comandos Útiles

### Ver logs
```bash
docker logs -f elevas-backend
docker logs -f elevas-frontend
docker logs -f elevas-landing
```

### Detener contenedores
```bash
docker stop elevas-backend elevas-frontend elevas-landing
```

### Reiniciar contenedor
```bash
docker restart elevas-backend
```

### Ver estado
```bash
docker ps | grep elevas
```

## ⚠️ IMPORTANTE

1. **Antes de deployment en producción**, cambia estas variables en los archivos `.env.production`:
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `DB_PASSWORD`

2. **NO hagas commit** de los archivos `.env.production` al repositorio

3. **Configura SSL** con Let's Encrypt después del deployment

4. **Configura Nginx** como reverse proxy (ver DEPLOYMENT.md)

## 📚 Documentación Completa

- Lee [DEPLOYMENT.md](DEPLOYMENT.md) para instrucciones detalladas
- Lee [ARQUITECTURA.md](ARQUITECTURA.md) para entender la arquitectura

## 🆘 Troubleshooting

### Error: Cannot connect to backend
```bash
# Verifica que todos estén en la misma red
docker network inspect elevas-network
```

### Error: Port already in use
```bash
# Para Windows
netstat -ano | findstr :3000

# Para Linux
sudo lsof -i :3000
```

### Error: Database connection failed
```bash
# Verifica que PostgreSQL esté corriendo
docker ps | grep postgres
```

## 📞 Soporte

Para más información, consulta:
- `DEPLOYMENT.md` - Guía completa
- `ARQUITECTURA.md` - Diagramas y configuración
- Logs: `docker logs -f <container-name>`
