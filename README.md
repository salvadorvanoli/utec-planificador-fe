<div align="center">

# UTEC Planificador - Frontend

### Interfaz Web para Sistema de Planificación Académica

[![Angular](https://img.shields.io/badge/Angular-20.2.0-red?logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-20.2.0-0078D7?logo=primeng&logoColor=white)](https://primeng.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![NGINX](https://img.shields.io/badge/NGINX-1.27-009639?logo=nginx&logoColor=white)](https://nginx.org/)

**Aplicación web moderna para la gestión integral de planificación docente en UTEC**

[Características](#características-principales) •
[Inicio Rápido](#inicio-rápido) •
[Arquitectura](#arquitectura) •
[Documentación](#documentación) •
[Testing](#testing)

</div>

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Inicio Rápido](#inicio-rápido)
- [Configuración](#configuración)
- [Componentes Principales](#componentes-principales)
- [Servicios](#servicios)
- [Testing](#testing)
- [Build y Deployment](#build-y-deployment)
- [Documentación](#documentación)
- [Contribuir](#contribuir)

---

## Descripción

**UTEC Planificador Frontend** es una aplicación web de una sola página (SPA) construida con Angular que proporciona la interfaz de usuario para el sistema de planificación académica de la Universidad Tecnológica del Uruguay (UTEC). La aplicación permite a docentes gestionar cursos, planificaciones semanales, contenido programático y utilizar asistencia de IA para mejorar la calidad académica.

### Integración del Sistema

El frontend se comunica con dos servicios backend:
- **API REST Backend** (Spring Boot): Gestión de datos académicos, autenticación y autorización
- **AI Agent** (FastAPI): Asistente conversacional con GPT-4o-mini para asesoramiento pedagógico

---

## Características Principales

### Gestión de Cursos

- **Catálogo de Cursos**: Navegación y búsqueda avanzada con filtros múltiples
- **Detalles Completos**: Visualización de información académica detallada
- **CRUD Completo**: Creación, edición y eliminación de cursos (según rol)
- **Multi-Campus**: Soporte para diferentes sedes de UTEC
- **Asignación de Docentes**: Gestión de posiciones y roles docentes

### Planificación Académica

- **Planificación Semanal**: Gestión de actividades por semana académica
- **Contenido Programático**: Objetivos, competencias, metodologías y evaluación
- **Actividades**: Gestión de clases presenciales y virtuales con recursos
- **Bibliografía**: Referencias físicas y digitales
- **Horarios de Oficina**: Gestión de disponibilidad docente
- **ODS y DUA**: Integración de Objetivos de Desarrollo Sostenible y Diseño Universal para el Aprendizaje

### Asistente de IA

- **Chat Conversacional**: Interfaz de chat integrada para consultas pedagógicas
- **Sugerencias Inteligentes**: Recomendaciones automáticas para mejorar contenido
- **Generación de Informes**: Reportes automáticos sobre planificaciones de cursos
- **Contexto de Curso**: El agente tiene acceso a toda la información del curso

### Gestión de Usuarios

- **Autenticación**: Login con credenciales locales o LDAP
- **Autorización**: Control de acceso basado en roles (RBAC)
- **Perfil de Usuario**: Visualización y gestión de información personal
- **Multi-Rol**: Soporte para diferentes permisos (Teacher, Coordinator, Administrator, etc.)

### Características de UI/UX

- **Responsive Design**: Adaptación a dispositivos móviles, tablets y escritorio
- **Tema Moderno**: Diseño basado en PrimeNG con personalización Tailwind
- **Modo Oscuro**: Preparado para implementación de tema oscuro
- **Componentes Reutilizables**: Librería de componentes compartidos
- **Navegación Intuitiva**: Breadcrumbs y menú lateral estructurado
- **Feedback Visual**: Mensajes toast, spinners y confirmaciones

### Exportación y Reportes

- **Generación PDF**: Exportación de planificaciones a formato PDF
- **Preview de PDF**: Visualización previa antes de descargar
- **Estadísticas**: Dashboards con métricas de cursos y planificaciones

---

## Stack Tecnológico

### Frontend Core

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Angular** | 20.2.0 | Framework principal SPA |
| **TypeScript** | 5.9.2 | Lenguaje de programación con tipado estático |
| **RxJS** | 7.8.0 | Programación reactiva y manejo de eventos asíncronos |
| **Zone.js** | 0.15.0 | Detección de cambios de Angular |

### UI Framework y Componentes

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **PrimeNG** | 20.2.0 | Biblioteca de componentes UI empresariales |
| **PrimeIcons** | 7.0.0 | Set de iconos |
| **PrimeUI Themes** | 1.2.4 | Sistema de temas |
| **Tailwind CSS** | 3.4.17 | Framework CSS utility-first |
| **Tailwind PrimeUI** | 0.3.4 | Integración Tailwind con PrimeNG |

### Herramientas de Visualización

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Chart.js** | 4.4.8 | Gráficos y visualización de datos |
| **html2pdf.js** | 0.12.1 | Generación de PDFs desde HTML |
| **Marked** | 17.0.0 | Procesamiento de Markdown |

### Testing

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Jasmine** | 5.9.0 | Framework de testing BDD |
| **Karma** | 6.4.0 | Test runner |
| **Karma Chrome Launcher** | 3.2.0 | Ejecución en Chrome |
| **Karma Coverage** | 2.2.0 | Reporte de cobertura |

### Build y DevOps

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Angular CLI** | 20.2.0 | Herramienta de desarrollo y build |
| **Node.js** | 22.x | Entorno de ejecución JavaScript |
| **Docker** | - | Containerización |
| **NGINX** | 1.27-alpine | Servidor web en producción |

### Utilidades de Desarrollo

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Prettier** | - | Formateador de código |
| **PostCSS** | 8.5.3 | Procesamiento CSS |
| **Autoprefixer** | 10.4.20 | Prefijos CSS automáticos |

---

## Arquitectura

### Arquitectura de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│           Components (Smart & Presentational)               │
│                    Templates (HTML + SCSS)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                       Application Layer                     │
│      Services - State Management - HTTP Communication       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                         Core Layer                          │
│   Guards - Interceptors - Models - Constants - Types        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   Backend APIs  │
                  │  (Spring Boot   │
                  │   + FastAPI)    │
                  └─────────────────┘
```

### Estructura del Proyecto

```
src/app/
├── core/                        # Funcionalidad central y transversal
│   ├── constants/              # Constantes globales de la aplicación
│   ├── enums/                  # Enumeraciones (Roles, Status, etc.)
│   ├── guards/                 # Guards de Angular (AuthGuard)
│   ├── interceptors/           # HTTP Interceptors (AuthInterceptor, ErrorInterceptor)
│   ├── models/                 # Interfaces y tipos de datos del dominio
│   ├── services/               # Servicios core (Auth, HTTP, State)
│   └── types/                  # Tipos TypeScript personalizados
│
├── features/                    # Módulos de características de negocio
│   ├── assign-page/            # Asignación de docentes a cursos
│   ├── chat-page/              # Chat con agente de IA
│   ├── course-catalog/         # Catálogo y búsqueda de cursos
│   ├── course-details/         # Detalles completos de curso
│   ├── option-page/            # Configuraciones y opciones
│   ├── planner/                # Planificación semanal
│   └── statistics-page/        # Estadísticas y reportes
│
├── layout/                      # Componentes de estructura
│   ├── header/                 # Encabezado con navegación
│   ├── footer/                 # Pie de página
│   ├── main-layout/            # Layout principal con sidebar
│   └── section-header/         # Encabezados de sección
│
├── pages/                       # Páginas independientes
│   ├── home/                   # Página de inicio
│   ├── login/                  # Página de autenticación
│   └── pdf-preview/            # Visualización de PDFs
│
└── shared/                      # Componentes y utilidades compartidas
    └── components/             # Componentes reutilizables
        ├── breadcrumb/         # Navegación de migas de pan
        ├── button/             # Botón personalizado
        ├── carousel/           # Carrusel de imágenes
        ├── color-block/        # Bloques de color temático
        ├── course-card/        # Tarjeta de curso
        ├── course-info/        # Información detallada de curso
        ├── datepicker/         # Selector de fechas
        ├── multiselect/        # Selector múltiple
        ├── paginator/          # Paginador
        ├── searchbar/          # Barra de búsqueda
        ├── select/             # Selector dropdown
        └── titulo/             # Componente de título
```

### Patrón de Componentes

La aplicación utiliza dos tipos de componentes:

**Smart Components (Container Components)**
- Gestionan el estado y la lógica de negocio
- Se comunican con servicios
- Orquestan componentes presentacionales
- Ejemplo: `course-catalog`, `chat-page`, `planner`

**Presentational Components (Dumb Components)**
- Solo reciben datos vía `@Input()`
- Emiten eventos vía `@Output()`
- Sin lógica de negocio
- Altamente reutilizables
- Ejemplo: `course-card`, `button`, `searchbar`

### Flujo de Datos

```
User Interaction
      ↓
Component (Smart)
      ↓
Service Layer
      ↓
HTTP Interceptor (Auth Token)
      ↓
Backend API
      ↓
HTTP Response
      ↓
Service (Transform Data)
      ↓
Component (Update View)
      ↓
Template Rendering
```

---

## Inicio Rápido

### Prerrequisitos

- **Docker Desktop** 4.x+ (recomendado) o
- **Node.js** 22 LTS + **npm** 10.x (desarrollo local)
- **Git** (para clonar el repositorio)
- **Backend corriendo** en `http://localhost:8080/api/v1`

### Opción 1: Docker (Recomendado)

**Clonar y configurar:**

```bash
# Clonar repositorio
git clone https://github.com/salvadorvanoli/utec-planificador-fe.git
cd utec-planificador-fe

# Configurar variables de entorno
cp .env.example .env
nano .env  # Editar BACKEND_API_URL si es necesario
```

**Iniciar servicios:**

```powershell
# Windows (PowerShell)
.\scripts\start.ps1

# Linux/macOS (bash con PowerShell instalado)
pwsh ./scripts/start.ps1
```

**Verificar que todo funciona:**

```bash
# Ver estado del contenedor
.\scripts\status.ps1

# Ver logs en tiempo real
.\scripts\logs.ps1

# Probar aplicación
curl http://localhost:4200
```

**URL disponible:**

- **Aplicación Web**: http://localhost:4200

**Detener servicios:**

```powershell
.\scripts\stop.ps1
```

### Opción 2: Desarrollo Local (sin Docker)

**Prerrequisitos adicionales:**

1. Node.js 22 LTS instalado
2. npm 10.x instalado
3. Backend corriendo en `http://localhost:8080/api/v1`

**Instalar y ejecutar:**

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
ng serve

# O usar npm script
npm start
```

La aplicación estará disponible en `http://localhost:4200`

**Hot Reload:** Los cambios se reflejan automáticamente en el navegador.

### Primer Login

Credenciales de prueba (si el backend tiene DataSeeder activo):

```
Email: juan.perez@utec.edu.uy
Password: password123
```

---

## Configuración

### Variables de Entorno

#### Desarrollo Local

**`src/environments/environment.ts`:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

#### Producción (Docker)

**`.env` file:**
```env
# Compose
COMPOSE_PROJECT_NAME=utec-planificador

# Frontend
FRONTEND_PORT=4200
BACKEND_API_URL=http://localhost:8080/api/v1
NODE_ENV=production

# Health Check
HEALTHCHECK_INTERVAL=30s
HEALTHCHECK_TIMEOUT=3s
HEALTHCHECK_RETRIES=3
```

### Configuración de Angular

**`angular.json`:** Configuración principal del proyecto Angular
- Build configurations (development, production)
- Asset management
- Style preprocessing (SCSS)
- Budget limits

**`tsconfig.json`:** Configuración de TypeScript
- Compiler options
- Path mappings
- Module resolution

**`tailwind.config.js`:** Configuración de Tailwind CSS
- Personalización de tema
- Plugins
- PurgeCSS para optimización

---

## Componentes Principales

### Componentes de Negocio

#### Course Catalog
**Ubicación:** `features/course-catalog`
**Propósito:** Búsqueda y navegación de cursos con filtros avanzados
**Características:**
- Búsqueda por texto
- Filtros múltiples (campus, programa, docente, etc.)
- Paginación
- Vista de tarjetas

#### Course Details
**Ubicación:** `features/course-details`
**Propósito:** Visualización detallada de información de curso
**Características:**
- Información completa del curso
- Contenido programático
- Planificaciones semanales
- Horarios de oficina
- Acciones CRUD (según permisos)

#### Planner (Weekly Planning)
**Ubicación:** `features/planner`
**Propósito:** Gestión de planificaciones semanales
**Características:**
- Vista por semana
- Gestión de actividades
- Agregar bibliografía
- Generación de PDF
- Integración con IA para sugerencias

#### Chat Page
**Ubicación:** `features/chat-page`
**Propósito:** Interfaz de chat con agente de IA
**Características:**
- Chat conversacional en tiempo real
- Historial de mensajes por sesión
- Contexto de curso automático
- Sugerencias y recomendaciones
- Generación de informes

#### Statistics Page
**Ubicación:** `features/statistics-page`
**Propósito:** Visualización de estadísticas y métricas
**Características:**
- Gráficos con Chart.js
- Métricas de curso
- Comparativas
- Exportación de datos

### Componentes Compartidos

#### Course Card
**Ubicación:** `shared/components/course-card`
**Propósito:** Tarjeta visual de curso para listas
**Props:**
- `course`: Datos del curso
- `showActions`: Mostrar acciones
**Eventos:**
- `cardClick`: Click en la tarjeta
- `actionClick`: Click en acción específica

#### Searchbar
**Ubicación:** `shared/components/searchbar`
**Propósito:** Barra de búsqueda con debounce
**Props:**
- `placeholder`: Texto placeholder
- `value`: Valor inicial
**Eventos:**
- `searchChange`: Emisión de búsqueda (con debounce)

#### Multiselect
**Ubicación:** `shared/components/multiselect`
**Propósito:** Selector múltiple con chips
**Props:**
- `options`: Lista de opciones
- `selectedValues`: Valores seleccionados
- `label`: Etiqueta del campo
**Eventos:**
- `selectionChange`: Cambio en selección

---

## Servicios

### Servicios Core

#### AuthService
**Ubicación:** `core/services/auth.service.ts`
**Responsabilidades:**
- Autenticación de usuarios (login/logout)
- Gestión de tokens JWT
- Estado de autenticación (Observable)
- Almacenamiento en localStorage
- Decodificación de tokens

**Métodos principales:**
```typescript
login(credentials: LoginDto): Observable<AuthResponse>
logout(): void
checkAuthStatus(): void
getCurrentUser(): User | null
isAuthenticated(): boolean
getToken(): string | null
```

#### CourseService
**Ubicación:** `core/services/course.service.ts`
**Responsabilidades:**
- CRUD de cursos
- Búsqueda y filtrado
- Gestión de ODS y DUA
- Gestión de sistemas de calificación
- Obtención de períodos académicos

**Métodos principales:**
```typescript
getCourses(filters?: FilterParams): Observable<PageResponse<Course>>
getCourseById(id: number): Observable<Course>
createCourse(course: CourseRequest): Observable<Course>
updateCourse(id: number, course: CourseRequest): Observable<Course>
deleteCourse(id: number): Observable<void>
```

#### WeeklyPlanningService
**Ubicación:** `core/services/weekly-planning.service.ts`
**Responsabilidades:**
- CRUD de planificaciones semanales
- Obtención por curso y semana
- Gestión de actividades
- Gestión de referencias bibliográficas

#### AIAgentService
**Ubicación:** `core/services/ai-agent.service.ts`
**Responsabilidades:**
- Comunicación con agente de IA
- Envío de mensajes de chat
- Obtención de sugerencias
- Generación de reportes
- Limpieza de sesiones

**Métodos principales:**
```typescript
sendMessage(sessionId: string, message: string, courseId: number): Observable<ChatResponse>
getSuggestions(courseId: number): Observable<SuggestionsResponse>
generateReport(courseId: number): Observable<ReportResponse>
clearSession(sessionId: string): Observable<void>
```

### Servicios de Dominio

| Servicio | Ubicación | Propósito |
|----------|-----------|-----------|
| **ActivityService** | core/services/ | Gestión de actividades de planificación |
| **CampusService** | core/services/ | Gestión de sedes |
| **CurricularUnitService** | core/services/ | Gestión de unidades curriculares |
| **EnumService** | core/services/ | Obtención de enumeraciones del backend |
| **ModificationService** | core/services/ | Auditoría de modificaciones |
| **OfficeHoursService** | core/services/ | Gestión de horarios de oficina |
| **PositionService** | core/services/ | Gestión de posiciones docentes |
| **ProgrammaticContentService** | core/services/ | Gestión de contenido programático |
| **UserService** | core/services/ | Gestión de usuarios |
| **PDFService** | core/services/ | Generación de PDFs |
| **FilterStateService** | core/services/ | Gestión de estado de filtros |

### Guards e Interceptors

#### AuthGuard
**Ubicación:** `core/guards/auth.guard.ts`
**Propósito:** Proteger rutas que requieren autenticación
**Comportamiento:**
- Verifica si el usuario está autenticado
- Redirige a `/login` si no hay sesión activa
- Permite acceso si hay token válido

#### AuthInterceptor
**Ubicación:** `core/interceptors/auth.interceptor.ts`
**Propósito:** Agregar token JWT a requests HTTP
**Comportamiento:**
- Intercepta todos los requests HTTP
- Agrega header `Authorization: Bearer <token>`
- Permite requests públicos (login, health)

#### ErrorInterceptor
**Ubicación:** `core/interceptors/error.interceptor.ts` (si existe)
**Propósito:** Manejo centralizado de errores HTTP
**Comportamiento:**
- Intercepta errores HTTP
- Muestra mensajes toast
- Maneja errores 401 (logout automático)
- Maneja errores 403, 404, 500, etc.

---

## Testing

### Suite de Tests

La aplicación incluye tests unitarios con Jasmine y Karma.

**Estadísticas de Testing:**
- Framework: Jasmine 5.9.0
- Test Runner: Karma 6.4.0
- Navegador: Chrome 142 (desarrollo), ChromeHeadless (CI)
- Cobertura mínima configurada: 50%

### Ejecutar Tests

```bash
# Modo watch (desarrollo)
npm test

# Ejecución única en headless
npm run test:headless

# Con reporte de cobertura
npm run test:coverage

# Modo CI/CD
npm run test:ci
```

### Tests Implementados

**Services:**
- `AuthService`: Login, logout, checkAuthStatus, state management
- `CourseService`: CRUD operations, filtros, ODS, DUA, períodos

**Guards:**
- `AuthGuard`: Protección de rutas

**Interceptors:**
- `AuthInterceptor`: Inyección de tokens

**Components:**
- `App`: Componente principal

### Reportes

Después de ejecutar `npm run test:coverage`, los reportes se generan en:

- **HTML Report**: `coverage/utec-planificador-fe/index.html`
- **LCOV**: `coverage/utec-planificador-fe/lcov.info`
- **Text Summary**: Consola

### Configuración de Tests

**`karma.conf.js`:**
```javascript
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    browsers: ['Chrome', 'ChromeHeadless'],
    coverageReporter: {
      type: 'html',
      dir: require('path').join(__dirname, './coverage/utec-planificador-fe'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ],
      check: {
        global: {
          statements: 50,
          branches: 50,
          functions: 50,
          lines: 50
        }
      }
    }
  });
};
```

**Documentación completa:** [TESTING_DOCUMENTATION.md](./TESTING_DOCUMENTATION.md)

---

## Build y Deployment

### Build de Producción

**Build local:**

```bash
# Build optimizado para producción
ng build --configuration production

# Output: dist/utec-planificador-fe/browser/
```

**Optimizaciones aplicadas:**
- Ahead-of-Time (AOT) compilation
- Tree-shaking
- Minificación
- Code splitting
- Lazy loading de módulos

### Docker Build

**Dockerfile multi-stage:**

**Stage 1: Build**
- Base: `node:22-alpine`
- Instala dependencias
- Compila Angular app
- Output: `dist/utec-planificador-fe/browser/`

**Stage 2: Production**
- Base: `nginx:1.27-alpine`
- Copia build artifacts
- Configura NGINX
- Expone puerto 80

**Build manual:**

```bash
# Build imagen
docker build -t utec-planificador-fe:latest .

# Run contenedor
docker run -p 4200:80 utec-planificador-fe:latest
```

**Con Docker Compose:**

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### NGINX Configuration

**`nginx.conf`:**
- Optimización de performance (gzip, sendfile)
- Configuración SPA (fallback a index.html)
- Cache de assets estáticos
- Headers de seguridad
- Logging

**Características:**
```nginx
# Gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# SPA fallback
location / {
    try_files $uri $uri/ /index.html;
}

# Cache estático
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Health Checks

**Docker health check:**
```yaml
healthcheck:
  test: ["CMD", "curl", "--fail", "http://localhost"]
  interval: 30s
  timeout: 3s
  retries: 3
```

---

## Documentación

### Documentación Disponible

| Documento | Ubicación | Descripción |
|-----------|-----------|-------------|
| [TESTING_DOCUMENTATION.md](./TESTING_DOCUMENTATION.md) | Raíz | Guía completa de testing con ejemplos |
| README.md | Raíz | Este documento (visión general) |

### Documentación de Código

**TSDoc:** Documentación inline en servicios y componentes críticos

**Ejemplo:**
```typescript
/**
 * Autentica un usuario con credenciales
 * @param credentials - Email y password del usuario
 * @returns Observable con respuesta de autenticación (token + user)
 * @throws Error si las credenciales son inválidas
 */
login(credentials: LoginDto): Observable<AuthResponse> {
  // ...
}
```

### API Documentation

**Swagger del Backend:** http://localhost:8080/api/v1/swagger-ui.html

---

## Contribuir

### Guía de Contribución

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Convenciones de Código

- **Angular Style Guide**: Guía oficial de Angular
- **Naming**:
  - Components: `kebab-case` (archivos), `PascalCase` (clases)
  - Services: `camelCase.service.ts`
  - Models: `PascalCase` interfaces
  - Constants: `UPPER_SNAKE_CASE`
- **Testing**: Todo nuevo componente/servicio debe incluir tests
- **Commits**: Mensajes descriptivos en inglés

### Comandos de Verificación

```bash
# Linting (si está configurado)
ng lint

# Tests
npm test

# Build
ng build

# Format (Prettier)
npx prettier --write "src/**/*.{ts,html,scss}"
```

---

## Licencia

Este proyecto es parte del Proyecto Final de la carrera **Analista en Tecnologías de la Información** de la **Universidad Tecnológica del Uruguay (UTEC)**.

**Desarrollado por:** Salvador Vanoli

**Institución:** Universidad Tecnológica del Uruguay (UTEC)

**Año:** 2025

---

## Soporte y Contacto

### Resolución de Problemas

La documentación completa se encuentra en el directorio del proyecto. Para problemas específicos:

- Revisar documentación de testing en `TESTING_DOCUMENTATION.md`
- Verificar configuración de entornos en `src/environments/`
- Consultar logs de Docker con `.\scripts\logs.ps1`

### Preguntas Frecuentes

**P: ¿Cómo cambio la URL del backend?**

R: Edita `src/environments/environment.ts` para desarrollo local, o `BACKEND_API_URL` en `.env` para Docker.

**P: ¿Por qué no se conecta al backend?**

R: Verifica que el backend esté corriendo en `http://localhost:8080/api/v1` y que no haya problemas de CORS.

**P: ¿Cómo genero la documentación de componentes?**

R: Usa Compodoc: `npm install -g @compodoc/compodoc` y luego `compodoc -p tsconfig.json`.

**P: ¿Cómo agrego un nuevo componente?**

R: Usa Angular CLI: `ng generate component features/mi-feature/mi-componente`.

---

<div align="center">

**Si este proyecto te fue útil, considera darle una estrella**

Desarrollado en UTEC

[Volver arriba](#utec-planificador---frontend)

</div>

