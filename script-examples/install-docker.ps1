<#
.SYNOPSIS
    Cross-Platform Docker Installation Script

.DESCRIPTION
    Script completamente autonomo que instala Docker en Windows, Linux y macOS.
    No requiere dependencias previas - instala todo lo necesario automaticamente.
    
    Caracteristicas:
    - Deteccion automatica del OS y arquitectura
    - Instalacion de gestores de paquetes si no existen
    - Verificacion de permisos y prerequisitos
    - Manejo robusto de errores con fallbacks
    - Verificacion post-instalacion completa
    - Cero configuracion manual requerida

.PARAMETER Force
    Reinstala Docker aunque ya este presente

.PARAMETER NoSudo
    Evita usar sudo en Linux/macOS (para entornos root)

.PARAMETER Verbose
    Muestra informacion detallada del proceso

.PARAMETER Test
    Ejecuta verificaciones adicionales como docker run hello-world

.EXAMPLE
    .\install-docker-ultimate.ps1
    
.EXAMPLE
    .\install-docker-ultimate.ps1 -Force -Verbose -Test
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

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "    ULTIMATE DOCKER INSTALLATION SCRIPT                        " -ForegroundColor Cyan
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
        Write-Host "   3. Ejecutar: .\install-docker-ultimate.ps1" -ForegroundColor White
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

function Test-DockerCompose {
    if (Test-Command "docker-compose") { return $true }
    try {
        & docker compose version > $null 2>&1
        return ($LASTEXITCODE -eq 0)
    } catch {
        return $false
    }
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
            if ($NoSudo) {
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

$dockerInstalled = Test-Command "docker"
$dockerComposeInstalled = Test-DockerCompose

Write-Host "   Docker: " -NoNewline
if ($dockerInstalled) {
    Write-Host "Instalado" -ForegroundColor Green
    if (-not $Force) {
        Write-Host ""
        Write-Host "Docker ya esta instalado. Use -Force para reinstalar." -ForegroundColor Yellow
        Write-Host "Comandos de prueba:" -ForegroundColor Blue
        Write-Host "   docker --version" -ForegroundColor Gray
        Write-Host "   docker run hello-world" -ForegroundColor Gray
        exit 0
    }
} else {
    Write-Host "No instalado" -ForegroundColor Red
}

Write-Host "   Docker Compose: " -NoNewline
if ($dockerComposeInstalled) {
    Write-Host "Instalado" -ForegroundColor Green
} else {
    Write-Host "No instalado" -ForegroundColor Red
}

Write-Host ""

# ===============================
# INSTALACION POR PLATAFORMA
# ===============================

Write-Host "Iniciando instalacion automatica..." -ForegroundColor Yellow
Write-Host ""

try {
    if ($windows) {
        Write-Host "Instalacion para Windows" -ForegroundColor Blue
        Write-Host "================================" -ForegroundColor Blue
        
        # Prioridad: winget > chocolatey > instalacion manual
        if (Test-Command "winget") {
            Write-Host "winget detectado - usando metodo preferido" -ForegroundColor Green
            Invoke-SafeCommand "winget" @("install", "--id", "Docker.DockerDesktop", "-e", "--accept-source-agreements", "--accept-package-agreements") "Instalando Docker Desktop con winget"
            
        } elseif (Test-Command "choco") {
            Write-Host "Chocolatey detectado - usando fallback" -ForegroundColor Green
            Invoke-SafeCommand "choco" @("install", "docker-desktop", "-y") "Instalando Docker Desktop con Chocolatey"
            
        } else {
            Write-Host "Instalando Chocolatey primero..." -ForegroundColor Yellow
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
            
            # Refrescar PATH para detectar choco
            $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
            
            if (Test-Command "choco") {
                Invoke-SafeCommand "choco" @("install", "docker-desktop", "-y") "Instalando Docker Desktop con Chocolatey"
            } else {
                throw "No se pudo instalar o detectar Chocolatey"
            }
        }
        
    } elseif ($linux) {
        Write-Host "Instalacion para Linux" -ForegroundColor Blue
        Write-Host "==========================" -ForegroundColor Blue
        
        # Detectar y usar el gestor de paquetes apropiado
        if (Test-Command "apt-get") {
            Write-Host "Detectado: Debian/Ubuntu (apt)" -ForegroundColor Green
            
            # Instalar dependencias basicas
            Invoke-SafeCommand "apt-get" @("update") "Actualizando repositorios"
            Invoke-SafeCommand "apt-get" @("install", "-y", "ca-certificates", "curl", "gnupg", "lsb-release") "Instalando dependencias basicas"
            
            # Crear directorio para llaves
            Invoke-SafeCommand "mkdir" @("-p", "/etc/apt/keyrings") "Creando directorio de llaves" -IgnoreErrors
            
            # Agregar llave GPG de Docker
            Invoke-SafeCommand "curl" @("-fsSL", "https://download.docker.com/linux/ubuntu/gpg", "-o", "/tmp/docker.gpg") "Descargando llave GPG de Docker"
            Invoke-SafeCommand "gpg" @("--dearmor", "-o", "/etc/apt/keyrings/docker.gpg", "/tmp/docker.gpg") "Instalando llave GPG"
            
            # Agregar repositorio de Docker
            $arch = & "dpkg" "--print-architecture" 2>$null
            $codename = & "lsb_release" "-cs" 2>$null
            $repoLine = "deb [arch=$arch signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $codename stable"
            
            Write-Host "Agregando repositorio de Docker..." -ForegroundColor Cyan
            $repoLine | & "sudo" "tee" "/etc/apt/sources.list.d/docker.list" | Out-Null
            
            # Instalar Docker
            Invoke-SafeCommand "apt-get" @("update") "Actualizando repositorios con Docker"
            Invoke-SafeCommand "apt-get" @("install", "-y", "docker-ce", "docker-ce-cli", "containerd.io", "docker-compose-plugin") "Instalando Docker"
            
        } elseif (Test-Command "dnf") {
            Write-Host "Detectado: Fedora/RHEL 8+ (dnf)" -ForegroundColor Green
            Invoke-SafeCommand "dnf" @("install", "-y", "dnf-plugins-core") "Instalando plugins de DNF"
            Invoke-SafeCommand "dnf" @("config-manager", "--add-repo", "https://download.docker.com/linux/fedora/docker-ce.repo") "Agregando repositorio de Docker"
            Invoke-SafeCommand "dnf" @("install", "-y", "docker-ce", "docker-ce-cli", "containerd.io", "docker-compose-plugin") "Instalando Docker"
            
        } elseif (Test-Command "yum") {
            Write-Host "Detectado: CentOS/RHEL 7 (yum)" -ForegroundColor Green
            Invoke-SafeCommand "yum" @("install", "-y", "yum-utils") "Instalando utilidades de YUM"
            Invoke-SafeCommand "yum-config-manager" @("--add-repo", "https://download.docker.com/linux/centos/docker-ce.repo") "Agregando repositorio de Docker"
            Invoke-SafeCommand "yum" @("install", "-y", "docker-ce", "docker-ce-cli", "containerd.io") "Instalando Docker"
            
        } elseif (Test-Command "zypper") {
            Write-Host "Detectado: openSUSE (zypper)" -ForegroundColor Green
            Invoke-SafeCommand "zypper" @("install", "-y", "docker", "docker-compose") "Instalando Docker"
            
        } else {
            Write-Host "Usando instalacion generica con script oficial..." -ForegroundColor Yellow
            Invoke-SafeCommand "curl" @("-fsSL", "https://get.docker.com", "-o", "/tmp/get-docker.sh") "Descargando script oficial de Docker"
            Invoke-SafeCommand "sh" @("/tmp/get-docker.sh") "Ejecutando instalador oficial"
            Invoke-SafeCommand "rm" @("/tmp/get-docker.sh") "Limpiando archivos temporales" -IgnoreErrors
        }
        
        # Configuracion post-instalacion de Linux
        if (Test-Command "systemctl") {
            Invoke-SafeCommand "systemctl" @("enable", "docker") "Habilitando servicio Docker"
            Invoke-SafeCommand "systemctl" @("start", "docker") "Iniciando servicio Docker"
        } elseif (Test-Command "service") {
            Invoke-SafeCommand "service" @("docker", "start") "Iniciando servicio Docker (service)"
        } else {
            Write-Host "No se detecto systemd ni 'service' - asegurate de iniciar Docker manualmente si corresponde." -ForegroundColor Yellow
        }
        
        # Agregar usuario al grupo docker
        if (-not $NoSudo) {
            $currentUser = $env:USER
            if (-not $currentUser) {
                $currentUser = & "whoami" 2>$null
            }
            
            if ($currentUser) {
                Invoke-SafeCommand "usermod" @("-aG", "docker", $currentUser) "Agregando usuario $currentUser al grupo docker"
                Write-Host "IMPORTANTE: Cierra sesion y vuelve a entrar para usar Docker sin sudo" -ForegroundColor Yellow
            }
        }
        
    } elseif ($macOS) {
        Write-Host "Instalacion para macOS" -ForegroundColor Blue
        Write-Host "==========================" -ForegroundColor Blue
        
        if (Test-Command "brew") {
            Write-Host "Homebrew detectado - instalando con brew" -ForegroundColor Green
            Invoke-SafeCommand "brew" @("install", "--cask", "docker") "Instalando Docker Desktop"
            
        } else {
            Write-Host "Instalando Homebrew primero..." -ForegroundColor Yellow
            $installScript = Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh" -UseBasicParsing
            $installScript.Content | & "/bin/bash"
            
            # Agregar Homebrew al PATH
            if (Test-Path "/opt/homebrew/bin/brew") {
                $env:PATH = "/opt/homebrew/bin:$env:PATH"
            } else {
                $env:PATH = "/usr/local/bin:$env:PATH"
            }
            
            if (Test-Command "brew") {
                Invoke-SafeCommand "brew" @("install", "--cask", "docker") "Instalando Docker Desktop"
            } else {
                throw "No se pudo instalar o detectar Homebrew"
            }
        }
        
    } else {
        throw "Sistema operativo no soportado"
    }
    
    Write-Host ""
    Write-Host "Instalacion completada exitosamente!" -ForegroundColor Green
    
    # Verificacion inmediata post-instalacion
    Write-Host ""
    Write-Host "Verificando instalacion de Docker..." -ForegroundColor Blue
    try {
        Invoke-SafeCommand "docker" @("--version") "Comprobando docker --version"
    } catch {
        Write-Host "No se pudo ejecutar 'docker --version'." -ForegroundColor Red
    }

    # Opcional: intentar hello-world pero sin romper el script en caso de fallo
    if ($Test -or $Force) {
        try {
            Write-Host "Probando docker run hello-world (esto puede fallar si no hay red)..." -ForegroundColor Cyan
            & docker run --rm hello-world 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Hello-world ejecutado correctamente." -ForegroundColor Green
            } else {
                Write-Host "Fallo hello-world (exit code $LASTEXITCODE). Revisa logs." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "No se pudo ejecutar 'docker run hello-world' (se continuara)." -ForegroundColor Yellow
        }
    }
    
} catch {
    Write-Host ""
    Write-Host "Error durante la instalacion: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Soluciones sugeridas:" -ForegroundColor Yellow
    Write-Host "   1. Verifica tu conexion a internet" -ForegroundColor White
    Write-Host "   2. Ejecuta el script como administrador (Windows) o con sudo (Linux/macOS)" -ForegroundColor White
    Write-Host "   3. Verifica que tu sistema operativo sea compatible" -ForegroundColor White
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

$dockerWorking = Test-Command "docker"
$dockerComposeWorking = Test-DockerCompose

Write-Host "Docker: " -NoNewline
if ($dockerWorking) {
    Write-Host "Disponible" -ForegroundColor Green
    try {
        $version = & docker --version 2>$null
        Write-Host "   Version: $version" -ForegroundColor Gray
    } catch {
        Write-Host "   Version: No disponible (puede necesitar reinicio)" -ForegroundColor Yellow
    }
} else {
    Write-Host "No disponible en PATH" -ForegroundColor Red
}

Write-Host "Docker Compose: " -NoNewline
if ($dockerComposeWorking) {
    Write-Host "Disponible" -ForegroundColor Green
} else {
    Write-Host "No disponible" -ForegroundColor Red
}

# ===============================
# INSTRUCCIONES FINALES
# ===============================

Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Blue
Write-Host "==================" -ForegroundColor Blue

if ($windows) {
    Write-Host "1. Abre Docker Desktop desde el menu de inicio" -ForegroundColor White
    Write-Host "2. Acepta los terminos y condiciones" -ForegroundColor White
    Write-Host "3. Configura tu cuenta de Docker (opcional)" -ForegroundColor White
    Write-Host "4. Prueba: docker run hello-world" -ForegroundColor White
    
} elseif ($linux) {
    Write-Host "1. Cierra sesion y vuelve a entrar (para usar Docker sin sudo)" -ForegroundColor White
    Write-Host "2. Prueba: docker run hello-world" -ForegroundColor White
    Write-Host "3. Verifica el servicio: sudo systemctl status docker" -ForegroundColor White
    
} elseif ($macOS) {
    Write-Host "1. Abre Docker Desktop desde Applications" -ForegroundColor White
    Write-Host "2. Acepta los terminos y condiciones" -ForegroundColor White
    Write-Host "3. Prueba: docker run hello-world" -ForegroundColor White
}

Write-Host ""
Write-Host "Comandos de verificacion:" -ForegroundColor Blue
Write-Host "   docker --version" -ForegroundColor Gray
Write-Host "   docker run hello-world" -ForegroundColor Gray
Write-Host "   docker ps" -ForegroundColor Gray
Write-Host "   docker images" -ForegroundColor Gray

Write-Host ""
Write-Host "Docker esta listo para usar!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
