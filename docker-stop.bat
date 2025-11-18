@echo off
REM ==============================================
REM Elevas RRHH - Docker Stop Script (Windows)
REM ==============================================

echo.
echo 🛑 Deteniendo Elevas RRHH...
echo.

docker-compose down

echo.
echo ✅ Contenedores detenidos
echo.
echo Los datos persisten en los volúmenes Docker
echo.
echo Para eliminar también los datos (⚠️ PELIGROSO):
echo   docker-compose down -v
echo.

pause
