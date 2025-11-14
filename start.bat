@echo off
REM Script para iniciar el stack completo de Elevas RRHH en Windows

echo 🚀 Iniciando Elevas RRHH Full Stack...

REM Verificar que existe .env
if not exist .env (
    echo ❌ Error: Archivo .env no encontrado
    echo Copia .env.example a .env y configura tus variables
    exit /b 1
)

REM Construir y levantar servicios
echo 📦 Construyendo servicios...
docker-compose up -d --build

REM Esperar a que los servicios estén listos
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 10 /nobreak > nul

REM Verificar estado
echo.
echo 📊 Estado de los servicios:
docker-compose ps

echo.
echo ✅ Stack iniciado correctamente
echo.
echo 🌐 Servicios disponibles:
echo    Landing:  http://localhost:3002
echo    Frontend: http://localhost:3001
echo    Backend:  http://localhost:3000
echo    Nginx:    http://localhost
echo.
echo 📋 Ver logs: docker-compose logs -f
echo 🛑 Detener:  docker-compose down
pause
