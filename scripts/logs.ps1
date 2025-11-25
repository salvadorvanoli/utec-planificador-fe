#!/usr/bin/env pwsh
# =============================================================================
# SCRIPT: scripts/logs.ps1
# =============================================================================
# Muestra los logs del frontend
# =============================================================================

param(
    [Parameter()]
    [switch]$Follow,
    
    [Parameter()]
    [int]$Tail = 100
)

$ErrorActionPreference = "Stop"

# Cambiar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Logs del Frontend                      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$args = @('logs')
if ($Follow) { 
    Write-Host "Siguiendo logs en tiempo real (Ctrl+C para salir)..." -ForegroundColor Yellow
    $args += '--follow' 
}
else {
    Write-Host "Mostrando últimos $Tail logs..." -ForegroundColor Yellow
}
$args += '--tail', $Tail

Write-Host ""

& docker-compose @args

Write-Host ""
Write-Host "Uso:" -ForegroundColor Cyan
Write-Host "  .\scripts\logs.ps1 [-Follow] [-Tail <número>]" -ForegroundColor White
Write-Host ""
Write-Host "Ejemplos:" -ForegroundColor Cyan
Write-Host "  .\scripts\logs.ps1              # Últimos 100 logs" -ForegroundColor Gray
Write-Host "  .\scripts\logs.ps1 -Follow      # Seguir logs en tiempo real" -ForegroundColor Gray
Write-Host "  .\scripts\logs.ps1 -Tail 50     # Últimos 50 logs" -ForegroundColor Gray
Write-Host ""
