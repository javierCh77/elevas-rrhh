@echo off
REM ======================================================
REM Script para ejecutar migraciones de TypeORM (Windows)
REM Ubicación: elevas-rhh/run-migrations.bat
REM ======================================================

setlocal enabledelayedexpansion

echo ==================================================
echo   ELEVAS RRHH - Ejecutar Migraciones
echo ==================================================
echo.

REM Verificar que Docker esté corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo X Error: Docker no esta corriendo
    echo Por favor inicia Docker Desktop y vuelve a intentar
    pause
    exit /b 1
)

REM Verificar que el contenedor backend esté corriendo
docker ps | findstr /C:"elevas-backend" >nul
if errorlevel 1 (
    echo El contenedor backend no esta corriendo
    echo Iniciando contenedores...
    docker-compose up -d
    echo.
    echo Esperando que el backend este listo...
    timeout /t 10 /nobreak >nul
)

echo Estado actual de la base de datos:
echo ---------------------------------------------------
docker-compose exec backend npm run migration:show
echo.

echo ---------------------------------------------------
echo Opciones de migracion:
echo ---------------------------------------------------
echo 1. Ejecutar migraciones pendientes (migration:run)
echo 2. Generar nueva migracion (migration:generate)
echo 3. Crear migracion vacia (migration:create)
echo 4. Revertir ultima migracion (migration:revert)
echo 5. Mostrar migraciones (migration:show)
echo 6. Salir
echo.

set /p option="Selecciona una opcion [1-6]: "

if "%option%"=="1" goto run_migrations
if "%option%"=="2" goto generate_migration
if "%option%"=="3" goto create_migration
if "%option%"=="4" goto revert_migration
if "%option%"=="5" goto show_migrations
if "%option%"=="6" goto exit_script

echo X Opcion invalida
pause
exit /b 1

:run_migrations
echo.
echo Ejecutando migraciones pendientes...
docker-compose exec backend npm run migration:run
echo.
echo Migraciones ejecutadas exitosamente
goto end_script

:generate_migration
echo.
set /p migration_name="Nombre de la migracion (ej: AddUserTable): "
if "%migration_name%"=="" (
    echo X Error: Debes proporcionar un nombre para la migracion
    pause
    exit /b 1
)
echo.
echo Generando migracion: %migration_name%
docker-compose exec backend npm run migration:generate -- src/migrations/%migration_name%
echo.
echo Migracion generada en: backend-rrhh/src/migrations/
goto end_script

:create_migration
echo.
set /p migration_name="Nombre de la migracion (ej: AddUserTable): "
if "%migration_name%"=="" (
    echo X Error: Debes proporcionar un nombre para la migracion
    pause
    exit /b 1
)
echo.
echo Creando migracion vacia: %migration_name%
docker-compose exec backend npm run migration:create -- src/migrations/%migration_name%
echo.
echo Migracion creada en: backend-rrhh/src/migrations/
goto end_script

:revert_migration
echo.
set /p confirm="Estas seguro de revertir la ultima migracion? (s/n): "
if /i "%confirm%"=="s" (
    echo.
    echo Revirtiendo ultima migracion...
    docker-compose exec backend npm run migration:revert
    echo.
    echo Migracion revertida exitosamente
) else (
    echo Operacion cancelada
)
goto end_script

:show_migrations
echo.
echo Migraciones actuales:
docker-compose exec backend npm run migration:show
goto end_script

:exit_script
echo Saliendo...
exit /b 0

:end_script
echo.
echo ==================================================
echo  Proceso completado
echo ==================================================
pause
