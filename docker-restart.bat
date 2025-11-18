@echo off
REM ==============================================
REM Elevas RRHH - Docker Restart Script (Windows)
REM ==============================================

echo.
echo 🔄 Reiniciando Elevas RRHH...
echo.

if "%1"=="" (
    echo Reiniciando todos los servicios
    docker-compose restart
    echo.
    echo ✅ Todos los servicios reiniciados
) else (
    echo Reiniciando servicio: %1
    docker-compose restart %1
    echo.
    echo ✅ Servicio %1 reiniciado
)

echo.
echo Estado de los servicios:
docker-compose ps

pause
