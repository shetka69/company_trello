@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or is not available in PATH.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm.cmd is not available in PATH.
  pause
  exit /b 1
)

if not exist ".env" (
  echo Creating .env from .env.example
  copy ".env.example" ".env" >nul
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 goto fail
)

where docker >nul 2>nul
if not errorlevel 1 (
  echo Starting PostgreSQL with Docker Compose...
  docker compose up -d
  if errorlevel 1 goto fail
) else (
  echo Docker was not found.
  call :check_db
  if errorlevel 1 goto missing_db
  call :ensure_local_db
)

echo Generating Prisma client...
call npx.cmd prisma generate
if errorlevel 1 goto fail

echo Applying database schema...
call npx.cmd prisma db push
if errorlevel 1 goto fail

if /i "%~1"=="--seed" (
  echo Seeding demo data...
  call npm.cmd run db:seed
  if errorlevel 1 goto fail
  echo seeded> ".quickstart-seeded"
) else if not exist ".quickstart-seeded" (
  echo Seeding demo data for the first quick start...
  call npm.cmd run db:seed
  if errorlevel 1 goto fail
  echo seeded> ".quickstart-seeded"
)

echo.
echo Project is starting at http://localhost:3000
echo Demo login: leader@demo.local / demo12345
echo.
call npm.cmd run dev
exit /b %errorlevel%

:fail
echo.
echo Quick start failed. Check the error above.
pause
exit /b 1

:missing_db
echo.
echo PostgreSQL is not available at localhost:5432.
echo.
echo Install Docker Desktop and run this file again:
echo   https://www.docker.com/products/docker-desktop/
echo.
echo Or install/start PostgreSQL locally, then make sure DATABASE_URL in .env points to it:
echo   postgresql://postgres:postgres@localhost:5432/company_workspace?schema=public
echo.
pause
exit /b 1

:check_db
powershell -NoProfile -ExecutionPolicy Bypass -Command "$client = New-Object Net.Sockets.TcpClient; try { $client.Connect('localhost', 5432); exit 0 } catch { exit 1 } finally { $client.Close() }"
exit /b %errorlevel%

:ensure_local_db
set "CREATEDB_EXE="
where createdb.exe >nul 2>nul
if not errorlevel 1 (
  for /f "delims=" %%i in ('where createdb.exe') do (
    if not defined CREATEDB_EXE set "CREATEDB_EXE=%%i"
  )
)

if not defined CREATEDB_EXE if exist "C:\Program Files\PostgreSQL\16\bin\createdb.exe" set "CREATEDB_EXE=C:\Program Files\PostgreSQL\16\bin\createdb.exe"
if not defined CREATEDB_EXE if exist "C:\Program Files\PostgreSQL\15\bin\createdb.exe" set "CREATEDB_EXE=C:\Program Files\PostgreSQL\15\bin\createdb.exe"

if not defined CREATEDB_EXE (
  echo createdb.exe was not found. If Prisma fails, create the company_workspace database manually.
  exit /b 0
)

echo Ensuring local PostgreSQL database exists...
set "PGPASSWORD=postgres"
"%CREATEDB_EXE%" -h localhost -p 5432 -U postgres company_workspace >nul 2>nul
exit /b 0
