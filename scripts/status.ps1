#!/usr/bin/env pwsh
# =============================================================================
# SCRIPT: scripts/status.ps1
# =============================================================================
# Muestra el estado del frontend
# =============================================================================

$ErrorActionPreference = "Stop"

# Cambiar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Estado del Frontend                    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[Contenedor]" -ForegroundColor Blue
docker-compose ps

Write-Host ""
Write-Host "[Health Checks]" -ForegroundColor Blue

# Check frontend
Write-Host "  Frontend (NGINX)..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4200" -Method Get -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " OK" -ForegroundColor Green
    }
    else {
        Write-Host " WARN (Status: $($response.StatusCode))" -ForegroundColor Yellow
    }
}
catch {
    Write-Host " NO RESPONDE" -ForegroundColor Red
}

# Check backend
Write-Host "  Backend API..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/actuator/health" -Method Get -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " OK" -ForegroundColor Green
    }
    else {
        Write-Host " WARN (Status: $($response.StatusCode))" -ForegroundColor Yellow
    }
}
catch {
    Write-Host " NO RESPONDE" -ForegroundColor Red
}

Write-Host ""
Write-Host "[Endpoints]" -ForegroundColor Blue
Write-Host "  Frontend:     http://localhost:4200" -ForegroundColor White
Write-Host "  Backend API:  http://localhost:8080/api" -ForegroundColor White
Write-Host ""
