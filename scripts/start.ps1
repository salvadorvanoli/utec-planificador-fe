#!/usr/bin/env pwsh
# =============================================================================
# SCRIPT: scripts/start.ps1
# =============================================================================
# Inicia el frontend del Planificador Docente UTEC
# Angular + NGINX
# =============================================================================

$ErrorActionPreference = "Stop"

# Cambiar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Iniciando Frontend - Planificador UTEC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
try {
    docker --version | Out-Null
    Write-Host "[OK] Docker disponible" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Docker no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Instala Docker desde: https://docs.docker.com/get-docker/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[IMPORTANTE] El frontend requiere que el backend esté ejecutándose" -ForegroundColor Yellow
Write-Host "Backend esperado en: http://localhost:8080/api" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "¿El backend está corriendo? (s/n)"

if ($confirmation -ne 's' -and $confirmation -ne 'S') {
    Write-Host ""
    Write-Host "[INFO] Inicia primero el backend:" -ForegroundColor Cyan
    Write-Host "  cd ../utec-planificador-be" -ForegroundColor White
    Write-Host "  .\scripts\start.ps1" -ForegroundColor White
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "[PASO 1/2] Iniciando contenedor del frontend..." -ForegroundColor Blue

docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Falló el inicio del contenedor" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Contenedor iniciado" -ForegroundColor Green
Write-Host ""

Write-Host "[PASO 2/2] Esperando que el frontend esté listo..." -ForegroundColor Blue

$maxAttempts = 30
$attempt = 0
$frontendReady = $false

while ($attempt -lt $maxAttempts) {
    $attempt++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4200" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            break
        }
    }
    catch {
        # Ignorar errores de conexión
    }
    
    if ($attempt -eq 1 -or $attempt % 5 -eq 0) {
        Write-Host "  Intento $attempt/$maxAttempts..." -ForegroundColor Gray
    }
    Start-Sleep -Seconds 1
}

Write-Host ""

if ($frontendReady) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " FRONTEND INICIADO CORRECTAMENTE       " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Aplicación disponible:" -ForegroundColor Cyan
    Write-Host "  Frontend:     http://localhost:4200" -ForegroundColor White
    Write-Host ""
    Write-Host "Conectándose a:" -ForegroundColor Cyan
    Write-Host "  Backend API:  http://localhost:8080/api" -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos útiles:" -ForegroundColor Cyan
    Write-Host "  Ver logs:     .\scripts\logs.ps1" -ForegroundColor White
    Write-Host "  Ver estado:   .\scripts\status.ps1" -ForegroundColor White
    Write-Host "  Detener:      .\scripts\stop.ps1" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host " FRONTEND INICIADO CON ADVERTENCIAS    " -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "El frontend está tardando en responder." -ForegroundColor Yellow
    Write-Host "Verifica el estado con: .\scripts\logs.ps1" -ForegroundColor Cyan
    Write-Host ""
}
