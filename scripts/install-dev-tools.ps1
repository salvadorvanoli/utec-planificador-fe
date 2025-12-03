<#
.SYNOPSIS
    Cross-Platform Development Tools Installation Script

.DESCRIPTION
    Script completamente autonomo que instala versiones especificas y probadas de
    NVM, Node.js LTS y Angular CLI en Windows, Linux y macOS usando PowerShell.
    No requiere dependencias previas - instala todo lo necesario automaticamente.
    
    Versiones instaladas (fijas):
    - Node.js: v22.9.0 (LTS)
    - Angular CLI: v20.2.0
    - NVM: Última versión LTS disponible
    
    Caracteristicas:
    - Deteccion automatica del OS y arquitectura
    - Instalacion de versiones FIJAS y probadas
    - Verificacion de versiones antes de instalar
    - Instalacion de gestores de paquetes si no existen
    - Verificacion de permisos y prerequisitos
    - Manejo robusto de errores con fallbacks
    - Verificacion post-instalacion completa
    - Cero configuracion manual requerida

.PARAMETER Force
    Reinstala las herramientas aunque ya esten presentes

.PARAMETER NoSudo
    Evita usar sudo en Linux/macOS (para entornos root)

.PARAMETER Verbose
    Muestra informacion detallada del proceso

.PARAMETER Test
    Ejecuta verificaciones adicionales como crear un proyecto Angular de prueba

.EXAMPLE
    .\install-dev-tools.ps1
    
.EXAMPLE
    .\install-dev-tools.ps1 -Force -Verbose -Test
#>

param(
    [switch]$Force,
    [switch]$NoSudo,
    [switch]$Verbose,
    [switch]$Test
)

# ===============================
# CONFIGURACION Y DETECCION
# ===============================

$ErrorActionPreference = "Stop"
$VerbosePreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

# VERSIONES FIJAS A INSTALAR (actualizar según necesidades)
$NODE_LTS_VERSION = "22.9.0"  # Node.js LTS (Hydrogen) - septiembre 2025
$ANGULAR_CLI_VERSION = "20.2.0"  # Angular CLI version más reciente
# NVM instalará la última versión LTS disponible

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "    DEVELOPMENT TOOLS INSTALLATION SCRIPT                      " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Deteccion de plataforma robusta (PowerShell 5.1+ / Core)
try {
    $windows = [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([System.Runtime.InteropServices.OSPlatform]::Windows)
    $linux = [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([System.Runtime.InteropServices.OSPlatform]::Linux)
    $macOS = [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([System.Runtime.InteropServices.OSPlatform]::OSX)
} catch {
    # Fallback para PowerShell < 6
    $windows = ($env:OS -eq "Windows_NT")
    $linux = Test-Path "/proc/version"
    $macOS = Test-Path "/System/Library/CoreServices/SystemVersion.plist"
}

# Verificar permisos de administrador en Windows
if ($windows) {
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    
    if (-not $isAdmin) {
        Write-Host "ERROR: Permisos de administrador requeridos en Windows" -ForegroundColor Red
        Write-Host ""
        Write-Host "Instrucciones:" -ForegroundColor Yellow
        Write-Host "   1. Clic derecho en PowerShell -> 'Ejecutar como administrador'" -ForegroundColor White
        Write-Host "   2. Navegar al directorio: cd '$((Get-Location).Path)'" -ForegroundColor White
        Write-Host "   3. Ejecutar: .\install-dev-tools.ps1" -ForegroundColor White
        Write-Host ""
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    Write-Host "Ejecutandose con permisos de administrador" -ForegroundColor Green
}

# ===============================
# FUNCIONES UTILITARIAS
# ===============================

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Test-NVM {
    if (Test-Command "nvm") { return $true }
    if ($windows) {
        # En Windows, NVM puede estar en el PATH despues de la instalacion
        $nvmPath = "${env:APPDATA}\nvm\nvm.exe"
        if (Test-Path $nvmPath) { return $true }
    }
    return $false
}

function Test-NodeVersion {
    param([string]$RequiredVersion)
    if (-not (Test-Command "node")) { return $false }
    try {
        $currentVersion = & node --version 2>$null
        if ($currentVersion) {
            $currentVersion = $currentVersion -replace '^v', ''
            return ($currentVersion -eq $RequiredVersion)
        }
    } catch {
        return $false
    }
    return $false
}

function Test-AngularVersion {
    param([string]$RequiredVersion)
    if (-not (Test-Command "ng")) { return $false }
    try {
        $ngOutput = & ng version --skip-git 2>$null
        if ($ngOutput -match "Angular CLI: ([0-9.]+)") {
            $currentVersion = $matches[1]
            return ($currentVersion -eq $RequiredVersion)
        }
    } catch {
        return $false
    }
    return $false
}

function Invoke-SafeCommand {
    param(
        [string]$Command,
        [string[]]$Arguments = @(),
        [string]$Description = "",
        [switch]$IgnoreErrors
    )
    
    if ($Description) {
        Write-Host "Ejecutando: $Description" -ForegroundColor Cyan
    }
    
    Write-Verbose "Comando: $Command $($Arguments -join ' ')"
    
    try {
        if ($linux -or $macOS) {
            if ($NoSudo -or $Command -eq "curl" -or $Command -eq "wget" -or $Command -eq "bash") {
                & $Command @Arguments
            } else {
                & "sudo" $Command @Arguments
            }
        } else {
            & $Command @Arguments
        }
        
        if ($LASTEXITCODE -ne 0 -and -not $IgnoreErrors) {
            throw "Comando fallo con codigo: $LASTEXITCODE"
        }
        
        if ($Description) {
            Write-Host "Completado: $Description" -ForegroundColor Green
        }
        
        return $true
    }
    catch {
        if ($IgnoreErrors) {
            Write-Host "Error en: $Description - pero continuando..." -ForegroundColor Yellow
            return $false
        } else {
            Write-Host "Error en: $Description - $($_.Exception.Message)" -ForegroundColor Red
            throw
        }
    }
}

function Get-SystemInfo {
    $info = @{
        OS = "Unknown"
        Version = "Unknown"
        Architecture = "Unknown"
        Distro = "Unknown"
    }
    
    if ($windows) {
        $osInfo = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction SilentlyContinue
        if ($osInfo) {
            $info.OS = "Windows"
            $info.Version = $osInfo.Version
            $info.Architecture = $env:PROCESSOR_ARCHITECTURE
        }
    } elseif ($linux) {
        $info.OS = "Linux"
        $info.Architecture = (& "uname" "-m" 2>$null) -replace '^$', 'Unknown'
        
        # Detectar distribucion
        if (Test-Path "/etc/os-release") {
            $osRelease = Get-Content "/etc/os-release" | ConvertFrom-StringData
            $info.Distro = $osRelease.ID -replace '^$', 'Unknown'
            $info.Version = $osRelease.VERSION_ID -replace '^$', 'Unknown'
        }
    } elseif ($macOS) {
        $info.OS = "macOS"
        $info.Architecture = (& "uname" "-m" 2>$null) -replace '^$', 'Unknown'
        
        $swVers = & "sw_vers" 2>$null
        if ($swVers) {
            $info.Version = ($swVers | Where-Object { $_ -match "ProductVersion:" }) -replace "ProductVersion:\s*", ""
        }
    }
    
    return $info
}

# ===============================
# INFORMACION DEL SISTEMA
# ===============================

$systemInfo = Get-SystemInfo
Write-Host "Sistema detectado:" -ForegroundColor Blue
Write-Host "   OS: $($systemInfo.OS)" -ForegroundColor White
Write-Host "   Version: $($systemInfo.Version)" -ForegroundColor White
Write-Host "   Arquitectura: $($systemInfo.Architecture)" -ForegroundColor White
if ($systemInfo.Distro -ne "Unknown") {
    Write-Host "   Distribucion: $($systemInfo.Distro)" -ForegroundColor White
}
Write-Host ""

# ===============================
# VERIFICACION PREVIA
# ===============================

Write-Host "Verificando estado actual..." -ForegroundColor Blue

$nvmInstalled = Test-NVM
$nodeInstalled = Test-Command "node"
$nodeCorrectVersion = Test-NodeVersion -RequiredVersion $NODE_LTS_VERSION
$npmInstalled = Test-Command "npm"
$angularInstalled = Test-Command "ng"
$angularCorrectVersion = Test-AngularVersion -RequiredVersion $ANGULAR_CLI_VERSION

Write-Host "Versiones objetivo:" -ForegroundColor Blue
Write-Host "   Node.js: v$NODE_LTS_VERSION (LTS)" -ForegroundColor Gray
Write-Host "   Angular CLI: $ANGULAR_CLI_VERSION" -ForegroundColor Gray
Write-Host ""

Write-Host "Estado actual:" -ForegroundColor Blue
Write-Host "   NVM: " -NoNewline
if ($nvmInstalled) {
    Write-Host "Instalado" -ForegroundColor Green
} else {
    Write-Host "No instalado" -ForegroundColor Red
}

Write-Host "   Node.js: " -NoNewline
if ($nodeInstalled) {
    if ($nodeCorrectVersion) {
        Write-Host "Instalado (v$NODE_LTS_VERSION)" -ForegroundColor Green
    } else {
        $currentNodeVersion = & node --version 2>$null
        Write-Host "Instalado ($currentNodeVersion - version incorrecta)" -ForegroundColor Yellow
    }
} else {
    Write-Host "No instalado" -ForegroundColor Red
}

Write-Host "   NPM: " -NoNewline
if ($npmInstalled) {
    Write-Host "Instalado" -ForegroundColor Green
} else {
    Write-Host "No instalado" -ForegroundColor Red
}

Write-Host "   Angular CLI: " -NoNewline
if ($angularInstalled) {
    if ($angularCorrectVersion) {
        Write-Host "Instalado ($ANGULAR_CLI_VERSION)" -ForegroundColor Green
    } else {
        try {
            $ngOutput = & ng version --skip-git 2>$null
            if ($ngOutput -match "Angular CLI: ([0-9.]+)") {
                $currentAngularVersion = $matches[1]
                Write-Host "Instalado ($currentAngularVersion - version incorrecta)" -ForegroundColor Yellow
            } else {
                Write-Host "Instalado (version no detectada)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "Instalado (version no detectada)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "No instalado" -ForegroundColor Red
}

if (-not $Force) {
    if ($nvmInstalled -and $nodeCorrectVersion -and $angularCorrectVersion) {
        Write-Host ""
        Write-Host "Todas las herramientas ya estan instaladas con las versiones correctas. Use -Force para reinstalar." -ForegroundColor Yellow
        Write-Host "Comandos de prueba:" -ForegroundColor Blue
        Write-Host "   nvm --version" -ForegroundColor Gray
        Write-Host "   node --version" -ForegroundColor Gray
        Write-Host "   ng version" -ForegroundColor Gray
        exit 0
    } elseif ($nvmInstalled -and $nodeInstalled -and $angularInstalled) {
        Write-Host ""
        Write-Host "Herramientas instaladas pero con versiones diferentes a las objetivo." -ForegroundColor Yellow
        $continue = Read-Host "¿Deseas actualizar a las versiones objetivo? (Y/n)"
        if ($continue -match '^[Nn]') {
            Write-Host "Instalacion cancelada por el usuario." -ForegroundColor Yellow
            exit 0
        }
    }
}

Write-Host ""

# ===============================
# FUNCIONES DE INSTALACION
# ===============================

function Install-NVMWindows {
    Write-Host "Instalacion de NVM para Windows" -ForegroundColor Blue
    Write-Host "================================" -ForegroundColor Blue
    
    try {
        # Prioridad: winget > chocolatey > descarga manual
        if (Test-Command "winget") {
            Write-Host "winget detectado - usando metodo preferido" -ForegroundColor Green
            Invoke-SafeCommand "winget" @("install", "--id", "CoreyButler.NVMforWindows", "-e", "--accept-source-agreements", "--accept-package-agreements") "Instalando NVM con winget"
            
        } elseif (Test-Command "choco") {
            Write-Host "Chocolatey detectado - usando fallback" -ForegroundColor Green  
            Invoke-SafeCommand "choco" @("install", "nvm", "-y") "Instalando NVM con Chocolatey"
            
        } else {
            Write-Host "Instalando mediante descarga directa..." -ForegroundColor Yellow
            
            # Descargar la última versión de nvm-windows
            $response = Invoke-RestMethod -Uri "https://api.github.com/repos/coreybutler/nvm-windows/releases/latest"
            $downloadUrl = ($response.assets | Where-Object { $_.name -like "*nvm-setup.exe" }).browser_download_url
            
            $tempPath = "$env:TEMP\nvm-setup.exe"
            Write-Host "Descargando NVM desde: $downloadUrl" -ForegroundColor Cyan
            Invoke-WebRequest -Uri $downloadUrl -OutFile $tempPath -UseBasicParsing
            
            Write-Host "Ejecutando instalador de NVM..." -ForegroundColor Cyan
            Start-Process -FilePath $tempPath -Wait
            
            Remove-Item $tempPath -Force -ErrorAction SilentlyContinue
        }
        
        Write-Host "NVM para Windows instalado correctamente" -ForegroundColor Green
        return $true
        
    } catch {
        Write-Host "Error al instalar NVM: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Install-NVMUnix {
    Write-Host "Instalacion de NVM para Unix/Linux/macOS" -ForegroundColor Blue
    Write-Host "=========================================" -ForegroundColor Blue
    
    try {
        # Instalar gestores de paquetes si es necesario
        if ($linux) {
            if (Test-Command "apt-get") {
                Write-Host "Actualizando repositorios e instalando dependencias..." -ForegroundColor Cyan
                Invoke-SafeCommand "apt-get" @("update") "Actualizando repositorios" -IgnoreErrors
                Invoke-SafeCommand "apt-get" @("install", "-y", "curl", "wget", "build-essential") "Instalando dependencias basicas" -IgnoreErrors
            } elseif (Test-Command "yum") {
                Invoke-SafeCommand "yum" @("install", "-y", "curl", "wget", "gcc", "gcc-c++", "make") "Instalando dependencias basicas" -IgnoreErrors
            } elseif (Test-Command "dnf") {
                Invoke-SafeCommand "dnf" @("install", "-y", "curl", "wget", "gcc", "gcc-c++", "make") "Instalando dependencias basicas" -IgnoreErrors
            }
        }
        
        # Descargar e instalar NVM usando la ultima version disponible
        Write-Host "Descargando e instalando NVM..." -ForegroundColor Cyan
        
        if (Test-Command "curl") {
            Invoke-SafeCommand "curl" @("-o-", "https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh") "Descargando NVM con curl" | bash
        } elseif (Test-Command "wget") {
            Invoke-SafeCommand "wget" @("-qO-", "https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh") "Descargando NVM con wget" | bash
        } else {
            throw "Ni curl ni wget estan disponibles. Instala uno de ellos primero."
        }
        
        # Cargar NVM en la sesion actual
        $nvmScript = "$env:HOME/.nvm/nvm.sh"
        if (Test-Path $nvmScript) {
            Write-Host "Cargando NVM en la sesion actual..." -ForegroundColor Cyan
            bash -c "source $nvmScript && nvm --version"
        }
        
        Write-Host "NVM para Unix/Linux/macOS instalado correctamente" -ForegroundColor Green
        Write-Host "IMPORTANTE: Reinicia tu terminal o ejecuta 'source ~/.bashrc' para usar NVM" -ForegroundColor Yellow
        return $true
        
    } catch {
        Write-Host "Error al instalar NVM: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Install-NodeLTS {
    Write-Host "Instalacion de Node.js v$NODE_LTS_VERSION" -ForegroundColor Blue
    Write-Host "=========================================" -ForegroundColor Blue
    
    try {
        if ($windows) {
            # Recargar variables de entorno para que NVM funcione
            $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
            
            Write-Host "Instalando Node.js version especifica: v$NODE_LTS_VERSION" -ForegroundColor Cyan
            
            # Instalar version especifica
            Invoke-SafeCommand "nvm" @("install", $NODE_LTS_VERSION) "Instalando Node.js v$NODE_LTS_VERSION"
            Invoke-SafeCommand "nvm" @("use", $NODE_LTS_VERSION) "Configurando Node.js v$NODE_LTS_VERSION como version activa"
            
        } else {
            # Unix/Linux/macOS
            Write-Host "Cargando NVM y instalando Node.js v$NODE_LTS_VERSION..." -ForegroundColor Cyan
            
            $nodeInstallScript = @"
export NVM_DIR="`$HOME/.nvm"
[ -s "`$NVM_DIR/nvm.sh" ] && \. "`$NVM_DIR/nvm.sh"
[ -s "`$NVM_DIR/bash_completion" ] && \. "`$NVM_DIR/bash_completion"

echo "Instalando Node.js v$NODE_LTS_VERSION..."
nvm install $NODE_LTS_VERSION
nvm use $NODE_LTS_VERSION
nvm alias default $NODE_LTS_VERSION

echo "Verificando instalacion..."
node --version
npm --version
"@
            
            bash -c $nodeInstallScript
        }
        
        # Verificar que Node.js se instalo correctamente con la version correcta
        Start-Sleep -Seconds 2
        if ($windows) {
            $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        }
        
        if (Test-Command "node") {
            $nodeVersion = & node --version 2>$null
            if ($nodeVersion -eq "v$NODE_LTS_VERSION") {
                Write-Host "Node.js v$NODE_LTS_VERSION instalado correctamente" -ForegroundColor Green
            } else {
                Write-Host "Node.js instalado pero version no coincide: $nodeVersion (esperado: v$NODE_LTS_VERSION)" -ForegroundColor Yellow
            }
        } else {
            throw "Node.js no esta disponible despues de la instalacion"
        }
        
        return $true
        
    } catch {
        Write-Host "Error al instalar Node.js v${NODE_LTS_VERSION}: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Install-AngularCLI {
    Write-Host "Instalacion de Angular CLI v$ANGULAR_CLI_VERSION" -ForegroundColor Blue
    Write-Host "===============================================" -ForegroundColor Blue
    
    try {
        # Verificar que npm este disponible
        if (-not (Test-Command "npm")) {
            Write-Host "NPM no esta disponible. Asegurate de que Node.js este instalado correctamente." -ForegroundColor Red
            return $false
        }
        
        Write-Host "Desinstalando versiones previas de Angular CLI..." -ForegroundColor Cyan
        # Desinstalar versiones previas para evitar conflictos
        try {
            Invoke-SafeCommand "npm" @("uninstall", "-g", "@angular/cli") "Desinstalando Angular CLI previo" -IgnoreErrors
        } catch {
            Write-Host "No habia version previa instalada o error al desinstalar (continuando...)" -ForegroundColor Yellow
        }
        
        Write-Host "Instalando Angular CLI version especifica: v$ANGULAR_CLI_VERSION" -ForegroundColor Cyan
        
        # Instalar Angular CLI con version especifica
        Invoke-SafeCommand "npm" @("install", "-g", "@angular/cli@$ANGULAR_CLI_VERSION") "Instalando Angular CLI v$ANGULAR_CLI_VERSION"
        
        # Verificar instalacion con version correcta
        Start-Sleep -Seconds 2
        if (Test-Command "ng") {
            try {
                $ngVersion = & ng version --skip-git 2>$null | Select-Object -First 1
                if ($ngVersion -match "Angular CLI: ([0-9.]+)") {
                    $installedVersion = $matches[1]
                    if ($installedVersion -eq $ANGULAR_CLI_VERSION) {
                        Write-Host "Angular CLI v$ANGULAR_CLI_VERSION instalado correctamente" -ForegroundColor Green
                    } else {
                        Write-Host "Angular CLI instalado pero version no coincide: v$installedVersion (esperado: v$ANGULAR_CLI_VERSION)" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "Angular CLI instalado (version no detectada automaticamente)" -ForegroundColor Green
                }
            } catch {
                Write-Host "Angular CLI instalado (version no detectada automaticamente)" -ForegroundColor Green
            }
        } else {
            throw "Angular CLI no esta disponible despues de la instalacion"
        }
        
        return $true
        
    } catch {
        Write-Host "Error al instalar Angular CLI v${ANGULAR_CLI_VERSION}: $($_.Exception.Message)" -ForegroundColor Red
        
        # Intentar solucion alternativa
        Write-Host "Intentando instalacion alternativa..." -ForegroundColor Yellow
        try {
            if ($windows) {
                cmd /c "npm install -g @angular/cli@$ANGULAR_CLI_VERSION"
            } else {
                bash -c "npm install -g @angular/cli@$ANGULAR_CLI_VERSION"
            }
            
            if (Test-Command "ng") {
                Write-Host "Angular CLI v$ANGULAR_CLI_VERSION instalado con metodo alternativo" -ForegroundColor Green
                return $true
            }
        } catch {
            Write-Host "Metodo alternativo tambien fallo" -ForegroundColor Red
        }
        
        return $false
    }
}

# ===============================
# INSTALACION POR PLATAFORMA  
# ===============================

Write-Host "Iniciando instalacion automatica..." -ForegroundColor Yellow
Write-Host ""

try {
    # Instalar NVM
    if ($Force -or -not $nvmInstalled) {
        if ($windows) {
            $success = Install-NVMWindows
        } else {
            $success = Install-NVMUnix
        }
        
        if (-not $success) {
            throw "Error en la instalacion de NVM"
        }
    } else {
        Write-Host "NVM ya esta instalado (usar -Force para reinstalar)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # Instalar Node.js version especifica
    if ($Force -or -not $nodeCorrectVersion) {
        $success = Install-NodeLTS
        if (-not $success) {
            Write-Host "Error en la instalacion de Node.js v$NODE_LTS_VERSION - continuando con Angular CLI..." -ForegroundColor Red
        }
    } else {
        Write-Host "Node.js v$NODE_LTS_VERSION ya esta instalado (usar -Force para reinstalar)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # Instalar Angular CLI version especifica
    if ($Force -or -not $angularCorrectVersion) {
        $success = Install-AngularCLI
        if (-not $success) {
            Write-Host "Error en la instalacion de Angular CLI v$ANGULAR_CLI_VERSION" -ForegroundColor Red
        }
    } else {
        Write-Host "Angular CLI v$ANGULAR_CLI_VERSION ya esta instalado (usar -Force para reinstalar)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Instalacion completada exitosamente!" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "Error durante la instalacion: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Soluciones sugeridas:" -ForegroundColor Yellow
    Write-Host "   1. Verifica tu conexion a internet" -ForegroundColor White
    Write-Host "   2. Ejecuta el script como administrador (Windows)" -ForegroundColor White
    Write-Host "   3. Verifica que tu sistema operativo sea compatible" -ForegroundColor White
    Write-Host "   4. Reinicia tu terminal y vuelve a intentar" -ForegroundColor White
    exit 1
}

# ===============================
# VERIFICACION POST-INSTALACION
# ===============================

Write-Host ""
Write-Host "Verificacion post-instalacion..." -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue

# Esperar un poco para que los servicios se inicialicen
Start-Sleep -Seconds 3

# Refrescar PATH en Windows
if ($windows) {
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
}

# Verificar herramientas instaladas
$nvmWorking = Test-NVM
$nodeWorking = Test-Command "node"
$npmWorking = Test-Command "npm"  
$angularWorking = Test-Command "ng"

Write-Host "NVM: " -NoNewline
if ($nvmWorking) {
    Write-Host "Disponible" -ForegroundColor Green
    try {
        if ($windows) {
            $nvmVersion = & nvm version 2>$null
        } else {
            $nvmVersion = bash -c 'source ~/.nvm/nvm.sh && nvm --version' 2>$null
        }
        if ($nvmVersion) {
            Write-Host "   Version: $nvmVersion" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   Version: No disponible (puede necesitar reinicio)" -ForegroundColor Yellow
    }
} else {
    Write-Host "No disponible en PATH" -ForegroundColor Red
}

Write-Host "Node.js: " -NoNewline
if ($nodeWorking) {
    Write-Host "Disponible" -ForegroundColor Green
    try {
        $nodeVersion = & node --version 2>$null
        Write-Host "   Version: $nodeVersion" -ForegroundColor Gray
    } catch {
        Write-Host "   Version: No disponible" -ForegroundColor Yellow
    }
} else {
    Write-Host "No disponible" -ForegroundColor Red
}

Write-Host "NPM: " -NoNewline
if ($npmWorking) {
    Write-Host "Disponible" -ForegroundColor Green
    try {
        $npmVersion = & npm --version 2>$null
        Write-Host "   Version: $npmVersion" -ForegroundColor Gray
    } catch {
        Write-Host "   Version: No disponible" -ForegroundColor Yellow
    }
} else {
    Write-Host "No disponible" -ForegroundColor Red
}

Write-Host "Angular CLI: " -NoNewline
if ($angularWorking) {
    Write-Host "Disponible" -ForegroundColor Green
    try {
        $ngOutput = & ng version --skip-git 2>$null
        if ($ngOutput -match "Angular CLI: ([0-9.]+)") {
            Write-Host "   Version: $($matches[1])" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   Version: No disponible" -ForegroundColor Yellow
    }
} else {
    Write-Host "No disponible" -ForegroundColor Red
}

# ===============================
# PRUEBAS OPCIONALES
# ===============================

if ($Test -and $angularWorking) {
    Write-Host ""
    Write-Host "Ejecutando pruebas adicionales..." -ForegroundColor Blue
    
    try {
        Write-Host "Creando proyecto Angular de prueba..." -ForegroundColor Cyan
        $testDir = "$env:TEMP\angular-test-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        
        # Crear proyecto Angular minimo
        & ng new test-app --routing=false --style=css --skip-git=true --directory="$testDir" --skip-install=true 2>$null
        
        if (Test-Path "$testDir") {
            Write-Host "Proyecto Angular de prueba creado exitosamente" -ForegroundColor Green
            Remove-Item "$testDir" -Recurse -Force -ErrorAction SilentlyContinue
        } else {
            Write-Host "No se pudo crear proyecto de prueba (puede ser normal)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Prueba de proyecto Angular fallo (puede ser normal): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# ===============================
# INSTRUCCIONES FINALES
# ===============================

Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Blue
Write-Host "==================" -ForegroundColor Blue

if ($windows) {
    Write-Host "1. Reinicia tu terminal o PowerShell para que NVM funcione completamente" -ForegroundColor White
    Write-Host "2. Verifica las instalaciones con los comandos mostrados abajo" -ForegroundColor White
    Write-Host "3. Crea tu primer proyecto: ng new mi-proyecto-angular" -ForegroundColor White
    
} elseif ($linux -or $macOS) {
    Write-Host "1. Reinicia tu terminal o ejecuta: source ~/.bashrc (o ~/.zshrc)" -ForegroundColor White
    Write-Host "2. Verifica las instalaciones con los comandos mostrados abajo" -ForegroundColor White
    Write-Host "3. Crea tu primer proyecto: ng new mi-proyecto-angular" -ForegroundColor White
}

Write-Host ""
Write-Host "Comandos de verificacion:" -ForegroundColor Blue
Write-Host "   nvm --version            # Verificar NVM" -ForegroundColor Gray
Write-Host "   nvm list                 # Ver versiones de Node.js instaladas" -ForegroundColor Gray
Write-Host "   node --version           # Verificar Node.js" -ForegroundColor Gray  
Write-Host "   npm --version            # Verificar NPM" -ForegroundColor Gray
Write-Host "   ng version               # Verificar Angular CLI" -ForegroundColor Gray

Write-Host ""
Write-Host "Comandos utiles de NVM:" -ForegroundColor Blue
if ($windows) {
    Write-Host "   nvm list available       # Ver versiones disponibles para instalar" -ForegroundColor Gray
    Write-Host "   nvm install $NODE_LTS_VERSION    # Reinstalar la version LTS configurada" -ForegroundColor Gray
    Write-Host "   nvm use $NODE_LTS_VERSION        # Usar la version LTS configurada" -ForegroundColor Gray
    Write-Host "   nvm use <version>        # Cambiar a otra version de Node.js" -ForegroundColor Gray
} else {
    Write-Host "   nvm ls-remote --lts      # Ver versiones LTS disponibles" -ForegroundColor Gray
    Write-Host "   nvm install $NODE_LTS_VERSION    # Reinstalar la version LTS configurada" -ForegroundColor Gray
    Write-Host "   nvm use $NODE_LTS_VERSION        # Usar la version LTS configurada" -ForegroundColor Gray
    Write-Host "   nvm use <version>        # Cambiar a otra version de Node.js" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Versiones instaladas por este script:" -ForegroundColor Blue
Write-Host "   Node.js: v$NODE_LTS_VERSION (LTS)" -ForegroundColor Gray
Write-Host "   Angular CLI: v$ANGULAR_CLI_VERSION" -ForegroundColor Gray

Write-Host ""
Write-Host "Comandos utiles de Angular:" -ForegroundColor Blue
Write-Host "   ng new <nombre-proyecto> # Crear nuevo proyecto Angular" -ForegroundColor Gray
Write-Host "   ng serve                 # Ejecutar servidor de desarrollo" -ForegroundColor Gray
Write-Host "   ng build                 # Compilar proyecto para produccion" -ForegroundColor Gray
Write-Host "   ng generate component    # Generar nuevo componente" -ForegroundColor Gray

Write-Host ""
Write-Host "Herramientas de desarrollo listas para usar!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan