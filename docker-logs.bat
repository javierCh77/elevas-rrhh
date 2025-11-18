@echo off
REM ==============================================
REM Elevas RRHH - Docker Logs Script (Windows)
REM ==============================================

echo.
echo 📋 Logs de Elevas RRHH
echo.

if "%1"=="" (
    echo Mostrando logs de todos los servicios
    echo.
    echo Para ver logs de un servicio específico, usa:
    echo   docker-logs.bat backend
    echo   docker-logs.bat frontend
    echo   docker-logs.bat landing
    echo   docker-logs.bat database
    echo.
    docker-compose logs -f
) else (
    echo Mostrando logs de: %1
    echo.
    docker-compose logs -f %1
)
