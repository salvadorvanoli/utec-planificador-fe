# UTEC Planificador - Frontend

Sistema de planificación académica desarrollado para la Universidad Tecnológica del Uruguay (UTEC). Esta aplicación web permite a los estudiantes gestionar sus horarios, tareas y planificación académica de manera eficiente e intuitiva.

## Propósito del Proyecto

El **UTEC Planificador** es una herramienta integral diseñada para optimizar la experiencia académica de los estudiantes universitarios, proporcionando funcionalidades para:

- **Gestión de horarios académicos**: Visualización y organización de cronogramas de clases
- **Planificación de tareas**: Sistema completo de gestión de entregas y evaluaciones
- **Dashboard personalizado**: Panel de control con métricas y resúmenes académicos
- **Gestión de recursos**: Acceso centralizado a materiales y herramientas educativas

## Stack Tecnológico

### Framework y Lenguajes
- **Angular** `v20.2.0` - Framework principal para desarrollo de aplicaciones SPA
- **TypeScript** `v5.7.0` - Lenguaje de programación con tipado estático
- **SCSS** - Preprocesador CSS para estilos avanzados

### Librerías de UI y Estilos
- **PrimeNG** `v20.2.0` - Biblioteca de componentes UI empresariales
- **PrimeIcons** `v7.0.0` - Conjunto de iconos oficial de PrimeNG
- **Tailwind CSS** `v4.1.4` - Framework CSS utility-first para estilos responsive

### Herramientas de Desarrollo
- **Angular CLI** `v20.2.0` - Herramienta de línea de comandos para desarrollo Angular
- **Prettier** - Formateador de código automático
- **ESLint** - Herramienta de análisis estático de código

## Arquitectura del Proyecto

La aplicación sigue una arquitectura modular basada en **feature-driven development** con separación clara de responsabilidades, implementando los principios de **Domain-Driven Design (DDD)** y **Clean Architecture**.

### Estructura de Directorios

```
src/
├── app/
│   ├── core/                    # Funcionalidad central del sistema
│   ├── features/                # Módulos de características de negocio
│   ├── layout/                  # Componentes de estructura y navegación
│   ├── pages/                   # Páginas independientes
│   └── shared/                  # Componentes y utilidades reutilizables
└── assets/                      # Recursos estáticos
```
## Descripción Detallada de Directorios

### `/src/app/core` - Núcleo del Sistema

Contiene la funcionalidad esencial que se carga una sola vez durante el ciclo de vida de la aplicación.

#### Subdirectorios:

- **`/constants`**: Valores inmutables utilizados globalmente
   ```typescript
   // Ejemplo: API_ENDPOINTS, DATE_FORMATS, STORAGE_KEYS
   export const API_ENDPOINTS = {
      AUTH: '/api/auth',
      USERS: '/api/users'
   } as const;
   ```

- **`/enums`**: Enumeraciones que definen estados y opciones fijas
   ```typescript
   // Ejemplo: TaskStatus, Priority, UserRole
   export enum TaskStatus {
      PENDING = 'pending',
      IN_PROGRESS = 'in_progress',
      COMPLETED = 'completed'
   }
   ```

- **`/guards`**: Protección de rutas y control de acceso
  - AuthGuard: Verificación de autenticación
  - RoleGuard: Control de permisos por rol
  - CanDeactivateGuard: Prevención de pérdida de datos

- **`/interceptors`**: Interceptación y transformación de peticiones HTTP
  - AuthInterceptor: Inyección automática de tokens
  - ErrorInterceptor: Manejo centralizado de errores
  - LoadingInterceptor: Indicadores de carga globales

- **`/models`**: Interfaces y tipos que definen la estructura de datos
   ```typescript
   // Ejemplo: User, Task, ApiResponse
   export interface User {
      id: string;
      email: string;
      role: UserRole;
      profile: UserProfile;
   }
   ```

- **`/services`**: Servicios singleton para funcionalidad transversal
  - ApiService: Cliente HTTP base
  - AuthService: Gestión de autenticación
  - NotificationService: Sistema de notificaciones

- **`/types`**: Tipos utilitarios avanzados de TypeScript
  ```typescript
  // Ejemplo: Result<T>, Dictionary<T>, RequireOnly<T>
  export type Result<T, E = Error> = 
    | { success: true; data: T }
    | { success: false; error: E };
  ```

### `/src/app/features` - Características de Negocio

Módulos completos e independientes implementando funcionalidades específicas con **lazy loading**.

#### Estructura por Feature:
```
/features/dashboard/
├── dashboard.component.ts       # Componente principal
├── components/                  # Componentes específicos
├── services/                    # Servicios de dominio
├── models/                      # Tipos específicos del dominio
└── utils/                       # Utilidades del feature
```

**Ejemplos de Features:**
- **`/dashboard`**: Panel principal con métricas y resúmenes académicos
- **`/planning`**: Herramientas de planificación y gestión de horarios
- **`/tasks`**: Sistema CRUD completo para gestión de tareas

### `/src/app/layout` - Componentes Estructurales

Define la arquitectura visual y navegacional de la aplicación.

- **`/header`**: Barra de navegación superior
  - Logo institucional responsive
  - Menú de navegación principal
  - Acciones de usuario (perfil, notificaciones)

- **`/footer`**: Pie de página institucional
  - Enlaces corporativos
  - Información de contacto
  - Derechos de autor

- **`/main-layout`**: Layout principal que compone header, content y footer
   ```typescript
   // Estructura del main-layout
   template: `
      <app-header />
      <main class="min-h-screen">
         <router-outlet />
      </main>
      <app-footer />
   `
   ```

### `/src/app/pages` - Páginas Independientes

Páginas que no requieren lazy loading y representan vistas completas.

- **`/home`**: Landing page con información institucional
- **`/login`**: Página de autenticación y registro
- **`/not-found`**: Página de error 404 personalizada

### `/src/app/shared` - Componentes Reutilizables

Elementos compartidos sin dependencias de dominio específico.

- **`/components`**: Componentes UI reutilizables
   ```typescript
   // Ejemplo: ButtonComponent, ModalComponent, LoaderComponent
   @Component({
      selector: 'app-button',
      template: `<button [class]="buttonClasses()">...</button>`
   })
   ```

- **`/directives`**: Directivas personalizadas
  - HighlightDirective: Resaltado de texto
  - TooltipDirective: Tooltips informativos
  - AutofocusDirective: Enfoque automático

- **`/pipes`**: Transformadores de datos para templates
   ```typescript
   // Ejemplo: DateFormatPipe, CurrencyPipe, TruncatePipe
   @Pipe({ name: 'dateFormat' })
   export class DateFormatPipe implements PipeTransform {
      transform(date: Date, format: string): string { ... }
   }
   ```

- **`/utils`**: Funciones utilitarias y helpers
   ```typescript
   // Ejemplo: dateHelpers, stringUtils, arrayUtils
   export const dateHelpers = {
      formatToLocal: (date: Date) => { ... },
      isWeekend: (date: Date) => { ... }
   };
   ```

- **`/validators`**: Validadores personalizados para formularios reactivos
   ```typescript
   // Ejemplo: strongPassword, utecEmail, futureDate
   export const utecEmailValidator = (control: AbstractControl) => {
      const email = control.value;
      return email?.endsWith('@utec.edu.uy') ? null : { utecEmail: true };
   };
   ```

### `/src/assets` - Recursos Estáticos

La carpeta `assets` contiene todos los recursos estáticos del proyecto organizados estratégicamente por categorías para mantener la identidad visual institucional de UTEC y optimizar el rendimiento de la aplicación.

#### Estructura Organizacional

```
src/assets/
├── fonts/                      # Tipografías institucionales UTEC
│   └── utec/                   # Familias tipográficas oficiales
├── icons/                      # Iconografía institucional y funcional
├── images/                     # Imágenes y recursos gráficos
│   ├── backgrounds/                   # Fondos y texturas
│   ├── illustrations/                 # Ilustraciones vectoriales
│   └── photos/                        # Fotografías institucionales
└── logos/                      # Isologotipos y marcas UTEC
    ├── utec-logo-primary.svg          # Logo principal vectorial
    ├── utec-logo-horizontal.png       # Versión horizontal
    ├── utec-logo-vertical.png         # Versión vertical
    └── utec-isologo.svg               # Isologo institucional
```

#### Descripción Detallada por Categoría

##### **Tipografías (`/fonts/utec/`)**

**Propósito**: Mantener consistencia visual con la identidad institucional de UTEC.

**Familias tipográficas institucionales:**

- **UTEC Gruesa** (`utec_gruesa_3.0.ttf`)
  - **Uso**: Títulos principales, encabezados destacados
  - **Características**: Alta legibilidad, impacto visual fuerte
  - **Implementación**: `font-family: 'UTEC Gruesa', sans-serif;`

- **UTEC Liviana** (`utec_liviana_3.0.ttf`)
  - **Uso**: Subtítulos, texto secundario
  - **Características**: Elegante, moderna, ligera
  - **Implementación**: `font-family: 'UTEC Liviana', sans-serif;`

- **UTEC Text** (4 variantes)
  - **Black** (`utec_text_black_3.0.ttf`): Texto con máximo peso visual
  - **Heavy** (`utec_text_heavy_3.0.ttf`): Texto con peso pesado
  - **Roman** (`utec_text_roman_3.0.ttf`): Texto estándar para contenido
  - **Light** (`utec_text_light_3.0.ttf`): Texto ligero para anotaciones

**Configuración CSS:**
```scss
// Carga automática en styles.scss
@font-face {
   font-family: 'UTEC Gruesa';
   src: url('assets/fonts/utec/utec_gruesa_3.0.ttf') format('truetype');
   font-weight: bold;
   font-display: swap; // Optimización de carga
}
```

##### **Iconografía (`/icons/`)**

**Propósito**: Proporcionar elementos visuales consistentes para la interfaz de usuario.

**Características del conjunto:**
- **Formato**: PNG optimizado para web
- **Nomenclatura**: Estandarizada (`icons-XX.png`)
- **Cantidad**: 59 iconos únicos (icons-25 hasta icons-83)
- **Estilo**: Coherente con la identidad visual UTEC
- **Uso**: Navegación, acciones, categorización de contenido

**Iconos principales por funcionalidad:**
```typescript
// Ejemplos de uso en componentes
const ICONS = {
   ACADEMIC: 'assets/icons/icons-25.png',      // Académico
   PLANNING: 'assets/icons/icons-26.png',      // Planificación
   TASKS: 'assets/icons/icons-27.png',         // Tareas
   CALENDAR: 'assets/icons/icons-28.png',      // Calendario
   DASHBOARD: 'assets/icons/icons-29.png',     // Panel de control
   // ... conjunto completo disponible
};
```

**Optimización implementada:**
- Renombrado automático desde formato legacy (`Recurso XXicon_.png`)
- Nomenclatura consistente para facilitar mantenimiento
- Carga lazy para optimizar rendimiento inicial

##### **Imágenes (`/images/`)**

**Propósito**: Recursos gráficos para enriquecer la experiencia visual.

**Categorías organizacionales:**
- **`/backgrounds/`**: Fondos de pantalla, texturas, patrones
- **`/illustrations/`**: Ilustraciones vectoriales y gráficos explicativos
- **`/photos/`**: Fotografías institucionales, instalaciones UTEC

**Mejores prácticas:**
- Formato WebP para mejor compresión
- Múltiples resoluciones (responsive images)
- Lazy loading automático con `NgOptimizedImage`

##### **Logos (`/logos/`)**

**Propósito**: Isologotipos oficiales para branding institucional.

**Variantes disponibles:**
- **Logo Principal** (`utec-logo-primary.svg`)
  - Formato vectorial escalable
  - Uso en headers y elementos principales
  
- **Versiones Específicas:**
  - Horizontal: Para headers amplios
  - Vertical: Para sidebars y espacios estrechos
  - Isologo: Símbolo sin texto para iconos

**Implementación responsive:**
```html
<!-- Uso con NgOptimizedImage -->
<img ngSrc="assets/logos/utec-logo-primary.svg" 
   alt="UTEC - Universidad Tecnológica"
   width="200" 
   height="60"
   priority
>
```

#### Fuentes de Recursos Institucionales

Todos los recursos visuales y tipográficos han sido extraídos de las **fuentes oficiales de UTEC** para garantizar coherencia con la identidad institucional:

##### **Fuentes Principales (Versión Organizada)**

- **Recursos Generales**: https://red.utec.edu.uy/recursos_old/
  - Biblioteca completa de recursos institucionales
  - Materiales organizados por categorías
  - Versión estable y bien estructurada

- **Tipografías Oficiales**: https://red.utec.edu.uy/recursos_old/tipografia/
  - Familias UTEC Gruesa, Liviana y Text
  - Archivos `.ttf` en versión 3.0
  - Licencias de uso institucional

- **Iconografía Institucional**: https://red.utec.edu.uy/recursos_old/iconos/
  - Conjunto completo de iconos temáticos
  - Formato PNG optimizado
  - Consistencia visual garantizada

- **Isologotipos y Marcas**: https://red.utec.edu.uy/recursos_old/logos-utec/
  - Logos en múltiples formatos (SVG, PNG)
  - Variantes horizontal, vertical e isologo
  - Especificaciones de uso y aplicación

##### **Fuente Actualizada (En Desarrollo)**

- **Recursos Nuevos**: https://red.utec.edu.uy/recursos/
  - Versión más reciente de recursos
  - Menor organización

**Nota de mantenimiento**: Se recomienda revisar periódicamente la fuente actualizada para incorporar nuevos recursos o versiones mejoradas de elementos existentes.

#### Estrategia de Optimización

**Performance:**
- Lazy loading de imágenes no críticas
- Compresión WebP donde sea posible
- Font-display: swap para tipografías
- Versionado de assets para cache busting

**Mantenibilidad:**
- Nomenclatura consistente y descriptiva
- Organización por funcionalidad
- Path mappings para referencias limpias (`@assets/*`)
- Documentación de uso por categoría

**Escalabilidad:**
- Estructura preparada para nuevos recursos
- Categorización extensible
- Automatización de procesos de renombrado
- Integración con pipeline de construcción

## Configuración de Path Mappings

El archivo `tsconfig.app.json` define alias para importaciones limpias y mantenibles:

```jsonc
{
   "compilerOptions": {
      "paths": {
         "@app/*": ["./src/app/*"],
         "@core/*": ["./src/app/core/*"],
         "@shared/*": ["./src/app/shared/*"],
         "@features/*": ["./src/app/features/*"],
         "@layout/*": ["./src/app/layout/*"],
         "@pages/*": ["./src/app/pages/*"],
         "@assets/*": ["./src/assets/*"]
      }
   }
}
```

### Uso de Path Mappings

```typescript
// ✓ Importaciones correctas con path mappings
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { Header } from '@layout/header/header';

// ✗ Evitar importaciones relativas complejas
import { AuthService } from '../../../core/services/auth.service';
```

## Configuración de Rutas

### Estructura del Archivo `app.routes.ts`

El sistema de routing está diseñado con una arquitectura jerárquica que utiliza **nested routing** para organizar las rutas por layouts y responsabilidades:

```typescript
import { Routes } from '@angular/router';
import { MainLayout } from '@layout/main-layout/main-layout';
import { Home } from '@pages/home/home';

export const routes: Routes = [
   {
      path: '',
      component: MainLayout,                                                        // Layout padre
      children: [                                                                   // Rutas anidadas
         { path: '', redirectTo: '/inicio', pathMatch: 'full' },
         {
            path: 'inicio',
            component: Home                                                         // Page: Carga inmediata
         },
         {
            path: 'dashboard',
            loadComponent: () => import('@features/dashboard/dashboard.component')  // Feature: Lazy loading
         },
         {
            path: 'planning',
            loadComponent: () => import('@features/planning/planning.component')    // Feature: Lazy loading
         },
         {
            path: 'tasks',
            loadComponent: () => import('@features/tasks/tasks.component')          // Feature: Lazy loading
         }
      ]
   }
];
```

### Manejo de Layouts en las Rutas

#### **Layout Principal (MainLayout)**
```typescript
{
   path: '',
   component: MainLayout,  // Componente que envuelve todas las rutas principales
   children: [
      // Todas las rutas que usan header y footer
   ]
}
```

**Características del MainLayout:**
- Proporciona estructura visual consistente (header, footer)
- Contiene `<router-outlet>` para renderizar las rutas hijas
- Se carga una sola vez y permanece activo durante la navegación

#### **Múltiples Layouts (Patrón Escalable)**
```typescript
export const routes: Routes = [
   // Layout principal para usuarios autenticados
   {
      path: '',
      component: MainLayout,
      canActivate: [AuthGuard],
      children: [
         { path: 'dashboard', loadComponent: () => import('@features/dashboard/dashboard.component') },
         { path: 'tasks', loadComponent: () => import('@features/tasks/tasks.component') }
      ]
   },
   // Layout de autenticación (sin header/footer)
   {
      path: 'auth',
      component: AuthLayout,
      children: [
         { path: 'login', component: LoginComponent },
         { path: 'register', loadComponent: () => import('@pages/register/register.component') }
      ]
   },
   // Layout de administración
   {
      path: 'admin',
      component: AdminLayout,
      canActivate: [AdminGuard],
      children: [
         { path: 'users', loadComponent: () => import('@features/admin/users/users.component') },
         { path: 'settings', loadComponent: () => import('@features/admin/settings/settings.component') }
      ]
   }
];
```

### Diferencias entre Pages y Features en las Rutas

#### **Pages: Carga Inmediata (`component`)**
```typescript
{
   path: 'inicio',
   component: Home    // Import directo, disponible inmediatamente
}
```

**Características de Pages:**
- **Carga Eager**: Se incluyen en el bundle principal
- **Páginas críticas**: Home, Login, Error 404
- **Contenido estático**: Información institucional, landing pages
- **Performance**: Disponibles instantáneamente, no requieren descarga adicional
- **Uso**: Para páginas que SIEMPRE se necesitan o son muy pequeñas

#### **Features: Carga Diferida (`loadComponent`)**
```typescript
{
   path: 'dashboard',
   loadComponent: () => import('@features/dashboard/dashboard.component')
}
```

**Características de Features:**
- **Carga Lazy**: Se descargan solo cuando se navega a ellas
- **Funcionalidades complejas**: Dashboard, gestión de tareas, planificación
- **Bundle separado**: Cada feature genera su propio chunk de JavaScript
- **Performance**: Reduce el tamaño del bundle inicial
- **Uso**: Para módulos completos con lógica de negocio

### Comparación Práctica

| Aspecto | Pages (`component`) | Features (`loadComponent`) |
|---------|--------------------|-----------------------------|
| **Carga** | Inmediata (Eager) | Bajo demanda (Lazy) |
| **Bundle** | Principal (main.js) | Separado (feature.js) |
| **Tamaño inicial** | Aumenta bundle | Reduce bundle inicial |
| **Primera navegación** | Instantánea | Requiere descarga |
| **Uso recomendado** | Páginas críticas/pequeñas | Funcionalidades complejas |
| **Ejemplo** | Home, Login, 404 | Dashboard, Tasks, Planning |

### Ventajas del Patrón Implementado

#### **1. Performance Optimizada**
```typescript
// Bundle inicial: ~200KB (solo layout + pages críticas)
// Feature chunks: 50-100KB cada uno (se cargan bajo demanda)
```

#### **2. Escalabilidad**
```typescript
// Fácil agregar nuevas features sin afectar el bundle principal
{
   path: 'reports',
   loadComponent: () => import('@features/reports/reports.component')
}
```

#### **3. Mantenibilidad**
- Separación clara entre contenido estático y funcionalidades dinámicas
- Cada feature es autocontenida y puede desarrollarse independientemente

#### **4. Experiencia de Usuario**
- Carga inicial rápida (solo lo esencial)
- Navegación fluida entre pages
- Carga progresiva de features según necesidad

### Mejores Prácticas para Routing

#### **1. Nomenclatura Consistente**
```typescript
// URLs en español para el contexto académico UTEC
{ path: 'inicio', component: Home },
{ path: 'tareas', loadComponent: () => import('@features/tasks/tasks.component') },
{ path: 'planificacion', loadComponent: () => import('@features/planning/planning.component') }
```

#### **2. Redirecciones Apropiadas**
```typescript
{ path: '', redirectTo: '/inicio', pathMatch: 'full' },        // Ruta por defecto
{ path: '**', redirectTo: '/not-found' }                       // Rutas no encontradas
```

#### **3. Guards de Protección**
```typescript
{
   path: 'dashboard',
   loadComponent: () => import('@features/dashboard/dashboard.component'),
   canActivate: [AuthGuard, RoleGuard]
}
```

#### **4. Resolvers para Datos**
```typescript
{
   path: 'tasks',
   loadComponent: () => import('@features/tasks/tasks.component'),
   resolve: {
      tasks: TasksResolver,
      categories: CategoriesResolver
   }
}
```

## Sistema de Estilos

### Configuración de Styles.scss

El archivo `styles.scss` centraliza la configuración global de estilos:

#### Importaciones Base
```scss
@use './tailwind.css';           // Framework Tailwind CSS
@use "primeicons/primeicons.css"; // Iconos de PrimeNG
```

#### Tipografías Institucionales
```scss
// Configuración de @font-face para tipografías UTEC
@font-face {
   font-family: 'UTEC Gruesa 3.0';
   src: url('assets/fonts/utec/utec_gruesa_3.0.ttf') format('truetype');
}

// Clases utilitarias para tipografías
.utec-gruesa-3 {
   font-family: 'UTEC Gruesa 3.0', system-ui, sans-serif !important;
}
```

#### Variables CSS Institucionales
```scss
:root {
  --utec-blue: #00A9E0;    // Azul institucional UTEC
  --utec-black: #000000;   // Negro corporativo
  --utec-white: #FFFFFF;   // Blanco base
}
```

### Identidad Visual Institucional

Este proyecto adhiere estrictamente a las **especificaciones oficiales de identidad visual de UTEC** para garantizar coherencia con la imagen institucional.

#### **Documento de Referencia Oficial**

**Manual de Identidad Visual UTEC**  
**URL**: https://utec.edu.uy/uploads/documento/82a36430707aab6fe708f8fbdf9497a1723251db.pdf

Este documento contiene las **especificaciones técnicas oficiales** para:

##### **Paleta de Colores Institucional**
- Códigos hexadecimales exactos
- Valores CMYK para impresión
- Especificaciones RGB para medios digitales
- Variaciones y combinaciones permitidas

##### **Especificaciones Tipográficas**
- Familias UTEC oficiales (Gruesa, Liviana, Text)
- Tamaños y espaciados recomendados
- Jerarquías y aplicaciones por contexto
- Combinaciones tipográficas apropiadas

##### **Uso Correcto de Isologotipos**
- Versiones aprobadas del logo UTEC
- Espacios de protección mínimos
- Tamaños mínimos de reproducción
- Aplicaciones sobre fondos diversos

##### **Sistemas de Retícula y Composición**
- Estructuras de layout recomendadas
- Proporciones y márgenes institucionales
- Principios de composición visual

#### **Cumplimiento Normativo**

**Responsabilidad del Proyecto:**
- Todos los elementos visuales implementados siguen las directrices oficiales
- Los recursos tipográficos y cromáticos son extraídos de fuentes institucionales
- Las aplicaciones de marca respetan los estándares establecidos

**Referencias de Implementación:**
```scss
// Colores implementados según manual oficial
:root {
   --utec-primary-blue: #00A9E0;     // Azul principal según especificación
   --utec-secondary-black: #000000;  // Negro institucional
   --utec-base-white: #FFFFFF;       // Blanco base para contraste
  
   // Extensiones para variaciones aprobadas
   --utec-blue-light: #33BAEB;       // Variante clara del azul
   --utec-blue-dark: #0088B3;        // Variante oscura del azul
   --utec-gray-light: #F5F5F5;       // Gris claro para fondos
   --utec-gray-medium: #CCCCCC;      // Gris medio para separadores
}
```

**Tipografías según especificación oficial:**
```scss
// Implementación exacta según manual de identidad
@font-face {
   font-family: 'UTEC Gruesa 3.0';
   src: url('assets/fonts/utec/utec_gruesa_3.0.ttf') format('truetype');
   font-weight: bold;
   font-display: swap;
}

@font-face {
   font-family: 'UTEC Liviana 3.0';
   src: url('assets/fonts/utec/utec_liviana_3.0.ttf') format('truetype');
   font-weight: 300;
   font-display: swap;
}

// Familia UTEC Text completa según especificaciones
@font-face {
   font-family: 'UTEC Text';
   src: url('assets/fonts/utec/utec_text_roman_3.0.ttf') format('truetype');
   font-weight: normal;
}
```

#### **Aplicación Práctica en Componentes**

**Ejemplo de uso correcto según identidad institucional:**
```typescript
// Componente siguiendo especificaciones visuales UTEC
@Component({
   selector: 'app-header',
   template: `
      <header class="bg-utec-blue text-utec-white">
         <img src="assets/logos/utec-logo-primary.svg" 
            alt="UTEC - Universidad Tecnológica"
            class="h-12 w-auto">
         <h1 class="font-utec-gruesa text-2xl">
            {{ title }}
         </h1>
      </header>
   `,
   styles: [`
      .bg-utec-blue { background-color: var(--utec-primary-blue); }
      .text-utec-white { color: var(--utec-base-white); }
      .font-utec-gruesa { font-family: 'UTEC Gruesa 3.0', sans-serif; }
   `]
})
```

#### **Mantenimiento de Consistencia**

Para garantizar el cumplimiento continuo de la identidad visual:

1. **Revisión periódica** del documento oficial para actualizaciones
2. **Validación** de nuevos recursos contra las especificaciones
3. **Testing visual** para verificar coherencia en diferentes dispositivos
4. **Documentación** de cualquier adaptación necesaria para web

> **Nota importante**: Cualquier desviación de las especificaciones oficiales debe ser justificada técnicamente y aprobada por las autoridades competentes de UTEC.

#### Jerarquía Tipográfica Global
```scss
body {
   font-family: 'UTEC Text Light', system-ui, sans-serif !important;
}

h1 {
   font-family: 'UTEC Text Black', system-ui, sans-serif !important;
}

h2, h3, h4, h5, h6 {
   font-family: 'UTEC Text Heavy', system-ui, sans-serif !important;
}
```

### Convenciones para Nuevos Estilos

#### 1. Organización por Secciones
```scss
/* =============================================================================
   VARIABLES GLOBALES
   ============================================================================= */
:root {
   --custom-variable: value;
}

/* =============================================================================
   COMPONENTES BASE
   ============================================================================= */
.btn-primary {
   background: var(--utec-blue);
   color: var(--utec-white);
}

/* =============================================================================
   UTILITIES PERSONALIZADAS
   ============================================================================= */
.text-utec-blue {
   color: var(--utec-blue);
}
```

#### 2. Naming Conventions
- **Variables CSS**: `--prefix-property-modifier`
- **Clases utilitarias**: `prefix-property-value`
- **Componentes**: `component-name__element--modifier` (BEM)

#### 3. Responsive Design
```scss
// Mobile First Approach
.component {
   font-size: 1rem;
  
   @media (min-width: 768px) {
      font-size: 1.125rem;
   }
  
   @media (min-width: 1024px) {
      font-size: 1.25rem;
   }
}
```

#### 4. Integración con Tailwind
```scss
// Extender utilidades de Tailwind cuando sea necesario
@layer utilities {
   .text-shadow-utec {
      text-shadow: 2px 2px 4px rgba(0, 169, 224, 0.3);
   }
}
```

## Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# Generar build de producción
npm run build

# Ejecutar pruebas unitarias
npm run test

# Build con watch mode
npm run watch

# Generar componente
ng generate component path/component-name

# Generar servicio
ng generate service path/service-name

# Generar guard
ng generate guard path/guard-name
```

## Estándares de Calidad

- **TypeScript estricto**: Configuración strict activada para type safety
- **Angular Standalone Components**: Arquitectura moderna sin NgModules
- **Signals**: Sistema reactivo nativo de Angular para gestión de estado
- **OnPush Change Detection**: Optimización de rendimiento en componentes
- **Lazy Loading**: Carga diferida para mejora de performance inicial
- **Path Mappings**: Importaciones limpias y mantenibles
- **Responsive Design**: Diseño adaptativo mobile-first
- **Accesibilidad**: Cumplimiento de estándares WCAG 2.1

---

*Desarrollado para la Universidad Tecnológica del Uruguay (UTEC) - Proyecto Académico 2025*
