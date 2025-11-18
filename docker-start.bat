@echo off
REM ==============================================
REM Elevas RRHH - Docker Start Script (Windows)
REM ==============================================

echo.
echo 🚀 Iniciando Elevas RRHH con Docker...
echo.

REM Verificar que existe .env
if not exist .env (
    echo ❌ Error: Archivo .env no encontrado
    echo.
    echo Por favor, crea el archivo .env desde .env.example:
    echo   copy .env.example .env
    echo.
    echo Luego edita .env con tus valores reales
    exit /b 1
)

REM Verificar que Docker está corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker no está corriendo
    echo.
    echo Por favor, inicia Docker Desktop
    exit /b 1
)

echo 📦 Construyendo imágenes Docker...
echo Esto puede tomar 20-30 minutos la primera vez
echo.

REM Build de imágenes
docker-compose build

echo.
echo 🔄 Iniciando contenedores...
echo.

REM Iniciar servicios
docker-compose up -d

echo.
echo ✅ Contenedores iniciados
echo.

REM Esperar a que los servicios estén listos
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 10 /nobreak >nul

REM Verificar estado
echo.
echo 📊 Estado de los servicios:
docker-compose ps

echo.
echo 🎉 ¡Deploy completado!
echo.
echo Los servicios están disponibles en:
echo   • Backend API:        http://localhost:3000
echo   • Frontend Dashboard: http://localhost:3001
echo   • Landing Page:       http://localhost:3002
echo   • PostgreSQL:         localhost:3034
echo.
echo Para ver logs en tiempo real:
echo   docker-compose logs -f
echo.
echo Para detener los servicios:
echo   docker-compose down
echo.

pause
