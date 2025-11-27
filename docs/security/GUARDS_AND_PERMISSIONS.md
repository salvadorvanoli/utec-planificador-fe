# Sistema de Guards y Permisos - Frontend

## Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Guards Implementados](#guards-implementados)
3. [Reglas de Acceso por Ruta](#reglas-de-acceso-por-ruta)
4. [Interceptor de Autenticación](#interceptor-de-autenticación)
5. [Manejo de Errores](#manejo-de-errores)
6. [Flujo de Validación](#flujo-de-validación)
7. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Visión General

El sistema de seguridad del frontend implementa una **estrategia híbrida**:

- **Guards en Frontend**: Mejoran la UX evitando navegación innecesaria
- **Validación en Backend**: Proporciona la seguridad real
- **Interceptor HTTP**: Maneja errores de autenticación/autorización elegantemente

### Principios de Diseño

1. **Defensa en Profundidad**: Múltiples capas de validación
2. **Fail-Safe**: En caso de duda, denegar acceso
3. **Usuario Informado**: Mensajes claros sobre por qué se deniega el acceso
4. **Experiencia Fluida**: Redirecciones inteligentes y automáticas

---

## Guards Implementados

### 1. **AuthGuard** (`auth.guard.ts`)

**Propósito**: Verificar que el usuario esté autenticado.

**Comportamiento**:
- Si está autenticado → Permite acceso
- Si NO está autenticado → Redirige a `/home`

**Uso**:
```typescript
{
  path: 'option-page',
  component: OptionPage,
  canActivate: [authGuard]
}
```

**Casos de Uso**:
- Proteger todas las rutas que requieren usuario logueado
- Evitar que usuarios no autenticados accedan a áreas privadas

---

### 2. **ContextGuard** (`context.guard.ts`)

**Propósito**: Validar que el usuario tenga un contexto válido (ITR + Campus).

**Comportamiento**:
- Extrae contexto encriptado del query param `ctx`
- Valida que `itrId` y `campusId` sean válidos
- Verifica que el usuario tenga posiciones en ese ITR/Campus
- Construye y setea el contexto en `PositionService`

**Validaciones**:
- Token `ctx` presente y válido
- `itrId` y `campusId` son números > 0
- Usuario tiene posiciones en ese ITR/Campus
- Si falla cualquier validación → Redirige a `/option-page`

**Uso**:
```typescript
{
  path: 'course-catalog',
  component: CourseCatalog,
  canActivate: [authGuard, contextGuard]
}
```

**Casos de Uso**:
- Rutas que requieren un campus específico seleccionado
- Validar que el contexto en la URL sea válido y no haya sido manipulado

---

### 3. **RoleGuard** (`role.guard.ts`)

**Propósito**: Verificar que el usuario tenga alguno de los roles requeridos en su contexto actual.

**Comportamiento**:
- Lee roles requeridos desde `route.data['requiredRoles']`
- Verifica que el usuario tenga al menos uno de esos roles en el contexto actual
- Tiene rol requerido → Permite acceso
- NO tiene rol → Redirige a `/home` con error

**Configuración en Rutas**:
```typescript
{
  path: 'chat-page',
  component: ChatPage,
  canActivate: [authGuard, contextGuard, roleGuard],
  data: { requiredRoles: [Role.TEACHER] }
}
```

**Roles Disponibles**:
- `TEACHER`: Docente
- `COORDINATOR`: Coordinador
- `ANALYST`: Analista
- `EDUCATION_MANAGER`: Gestor Educativo

**Casos de Uso**:
- Restringir acceso a funcionalidades específicas por rol
- Permitir múltiples roles para una misma ruta (OR lógico)

---

### 4. **CourseAccessGuard** (`course-access.guard.ts`)

**Propósito**: Validar que el usuario tenga acceso a un curso específico.

**Comportamiento**:

#### Para TEACHERS (cuando `validateCourseOwnership: true`):
1. Obtiene el `courseId` de la URL
2. Hace petición al backend para obtener el curso
3. Verifica que el usuario autenticado sea uno de los teachers del curso
4. Es su curso → Permite acceso
5. NO es su curso → Redirige a `/home` con error `not_your_course`

#### Para ANALYST, COORDINATOR, EDUCATION_MANAGER:
- Solo verifica que tengan contexto válido
- El backend validará que el curso esté en su campus

**Configuración**:
```typescript
{
  path: 'planner/:courseId',
  component: Planner,
  canActivate: [authGuard, contextGuard, roleGuard, courseAccessGuard],
  data: { 
    requiredRoles: [Role.TEACHER],
    validateCourseOwnership: true 
  }
}
```

**Casos de Uso**:
- `planner/:courseId`: Solo teachers pueden acceder a SUS cursos
- `statistics-page/:courseId`: Teachers (sus cursos) o gestores (cursos de su campus)

---

## Reglas de Acceso por Ruta

### Rutas Públicas (sin autenticación)

| Ruta | Descripción | Guards |
|------|-------------|--------|
| `/home` | Página principal | Ninguno |
| `/login` | Inicio de sesión | Ninguno |
| `/student/courses` | Portal de estudiantes | Ninguno |

### Rutas Protegidas (requieren autenticación)

| Ruta | Roles Permitidos | Guards | Descripción |
|------|-----------------|--------|-------------|
| `/option-page` | Todos autenticados | `authGuard` | Selección de ITR/Campus |
| `/course-catalog` | Todos autenticados | `authGuard`, `contextGuard` | Catálogo de cursos |
| `/planner/:courseId` | `TEACHER` (solo sus cursos) | `authGuard`, `contextGuard`, `roleGuard`, `courseAccessGuard` | Planificación de curso |
| `/statistics-page/:courseId` | `TEACHER`, `ANALYST`, `COORDINATOR`, `EDUCATION_MANAGER` | `authGuard`, `contextGuard`, `roleGuard` | Estadísticas de curso |
| `/chat-page` | `TEACHER` | `authGuard`, `contextGuard`, `roleGuard` | Chat/Consultas |
| `/assign-page` | `ANALYST`, `COORDINATOR` | `authGuard`, `contextGuard`, `roleGuard` | Asignación de cursos |
| `/pdf-preview/:courseId` | Todos autenticados | `authGuard`, `contextGuard` | Vista previa de PDF |

---

## Interceptor de Autenticación

### Archivo: `auth.interceptor.ts`

**Funcionalidades**:

1. **Agregar Credenciales**:
   - Agrega `withCredentials: true` a todas las peticiones HTTP
   - Permite envío de cookies de sesión

2. **Manejo de Error 401 (No Autenticado)**:
   ```typescript
   // Usuario no autenticado o sesión expirada
   - Limpia localStorage y sessionStorage
   - Redirige a /home con query param ?error=session_expired
   ```

3. **Manejo de Error 403 (Sin Permisos)**:
   ```typescript
   // Usuario autenticado pero sin permisos suficientes
   - Redirige a /home con query param ?error=insufficient_permissions
   ```

**Ventajas**:
- Manejo centralizado de errores de autenticación
- Usuario recibe feedback claro sobre por qué fue redirigido
- Limpieza automática de datos de sesión inválida

---

## Manejo de Errores

### Códigos de Error en Query Params

Cuando un guard o el interceptor redirige al usuario, puede agregar un código de error:

```typescript
router.navigate(['/home'], {
  queryParams: { error: 'error_code' }
});
```

### Códigos de Error Disponibles

| Código | Descripción | Dónde se muestra |
|--------|-------------|------------------|
| `session_expired` | Sesión expirada | Home (toast) |
| `insufficient_permissions` | Sin permisos para el recurso | Home (toast) |
| `not_your_course` | Intentó acceder a curso que no le pertenece | Home (toast) |
| `course_not_accessible` | Curso no existe o no tiene permisos | Home (toast) |

### Implementación en Home.ts

```typescript
ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    const error = params['error'];
    
    if (error) {
      this.showErrorMessage(error);
      // Limpiar query param después de mostrar
      window.history.replaceState({}, '', window.location.pathname);
    }
  });
}
```

**Mensajes Mostrados**:
- Toast de PrimeNG (posición: top-right)
- Severidad: `error`
- Duración: 6 segundos
- Mensaje personalizado según el código

---

## Flujo de Validación

### Ejemplo: Acceso a Planner

```
Usuario navega a: /planner/123

1. AuthGuard
   ↓
   ¿Está autenticado?
   ├─ NO → Redirige a /home
   └─ SÍ → Continúa

2. ContextGuard
   ↓
   ¿Tiene contexto válido (ITR + Campus)?
   ├─ NO → Redirige a /option-page
   └─ SÍ → Continúa

3. RoleGuard
   ↓
   ¿Tiene rol TEACHER en este contexto?
   ├─ NO → Redirige a /home con error
   └─ SÍ → Continúa

4. CourseAccessGuard
   ↓
   ¿Es uno de los teachers del curso 123?
   ├─ NO → Redirige a /home con error
   └─ SÍ → ACCESO PERMITIDO

5. Backend
   ↓
   Validación final en servidor
   ├─ 403/404 → Interceptor redirige a /home
   └─ 200 → Usuario accede al recurso
```

---

## Ejemplos de Uso

### Ejemplo 1: Ruta Simple con Autenticación

```typescript
{
  path: 'option-page',
  loadComponent: () => import('./features/option-page/option-page').then(m => m.OptionPage),
  canActivate: [authGuard]
}
```

**Valida**:
- Usuario autenticado

---

### Ejemplo 2: Ruta con Contexto y Rol

```typescript
{
  path: 'chat-page',
  loadComponent: () => import('./features/chat-page/chat-page').then(m => m.ChatPage),
  canActivate: [authGuard, contextGuard, roleGuard],
  data: { requiredRoles: [Role.TEACHER] }
}
```

**Valida**:
- Usuario autenticado
- Contexto válido (ITR + Campus)
- Rol TEACHER en contexto actual

---

### Ejemplo 3: Ruta con Múltiples Roles Permitidos

```typescript
{
  path: 'statistics-page/:courseId',
  loadComponent: () => import('./features/statistics-page/statistics-page').then(m => m.StatisticsPage),
  canActivate: [authGuard, contextGuard, roleGuard],
  data: { 
    requiredRoles: [Role.TEACHER, Role.ANALYST, Role.COORDINATOR, Role.EDUCATION_MANAGER]
  }
}
```

**Valida**:
- Usuario autenticado
- Contexto válido
- Tiene al menos UNO de los roles listados (OR lógico)

---

### Ejemplo 4: Ruta con Validación de Ownership

```typescript
{
  path: 'planner/:courseId',
  loadComponent: () => import('./features/planner/planner').then(m => m.Planner),
  canActivate: [authGuard, contextGuard, roleGuard, courseAccessGuard],
  data: { 
    requiredRoles: [Role.TEACHER],
    validateCourseOwnership: true 
  }
}
```

**Valida**:
- Usuario autenticado
- Contexto válido
- Rol TEACHER
- Es uno de los teachers del curso específico

---

## Casos de Borde y Consideraciones

### 1. Usuario No Autenticado
- **Guards**: Redirigen a `/home`
- **Backend 401**: Interceptor redirige a `/home`
- **Mensaje**: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."

### 2. Usuario Sin Rol Requerido
- **Guard**: Redirige a `/home` con error
- **Backend 403**: Interceptor redirige a `/home`
- **Mensaje**: "No tienes permisos suficientes para acceder a este recurso."

### 3. Teacher Intenta Acceder a Curso de Otro Teacher
- **Guard**: `courseAccessGuard` valida ownership
- **Resultado**: Redirige a `/home` con error `not_your_course`
- **Mensaje**: "No tienes permisos para acceder a este curso. Solo puedes acceder a tus propios cursos."

### 4. Contexto Inválido o Manipulado
- **Guard**: `contextGuard` valida token encriptado
- **Resultado**: Redirige a `/option-page` para reseleccionar
- **Sin mensaje**: Se asume error de navegación, no intento malicioso

### 5. Ruta No Existente
- **Router**: Catch-all `**` redirige a `/home`
- **Sin guards**: No hay validación adicional necesaria

---

## Mejores Prácticas

### DO

1. **Usar Guards en Cascada**: `[authGuard, contextGuard, roleGuard]`
2. **Especificar Roles Explícitamente**: `data: { requiredRoles: [...] }`
3. **Validar Ownership Cuando Sea Crítico**: `validateCourseOwnership: true`
4. **Confiar en Backend como Fuente de Verdad**: Guards mejoran UX, backend proporciona seguridad
5. **Mostrar Mensajes Claros**: Usuario debe entender por qué se le deniega acceso

### DON'T

1. **No Confiar Solo en Guards**: Backend siempre debe validar
2. **No Hardcodear Roles en Componentes**: Usar guards y configuración de rutas
3. **No Ignorar Errores 403**: Siempre manejar y redirigir apropiadamente
4. **No Mostrar Rutas Inaccesibles**: Ocultar opciones del menú según rol
5. **No Dejar Query Params de Error**: Limpiar después de mostrar mensaje

---

## Testing

### Escenarios de Prueba Recomendados

1. **Usuario No Autenticado**:
   - Intenta acceder a `/option-page` → Debe redirigir a `/home`

2. **Usuario TEACHER**:
   - Accede a `/planner/123` (su curso) → Permitido
   - Accede a `/planner/456` (curso de otro) → Redirige a `/home`
   - Accede a `/chat-page` → Permitido
   - Accede a `/assign-page` → Redirige a `/home`

3. **Usuario ANALYST**:
   - Accede a `/assign-page` → Permitido
   - Accede a `/chat-page` → Redirige a `/home`
   - Accede a `/statistics-page/123` (curso de su campus) → Permitido

4. **Contexto Inválido**:
   - URL con token `ctx` corrupto → Redirige a `/option-page`
   - URL sin token `ctx` → Redirige a `/option-page`

5. **Backend Rechaza Petición**:
   - Backend responde 403 → Interceptor redirige a `/home` con mensaje
   - Backend responde 401 → Interceptor limpia sesión y redirige a `/home`

---

## Referencias

- **AuthService**: `/src/app/core/services/auth.service.ts`
- **PositionService**: `/src/app/core/services/position.service.ts`
- **CourseService**: `/src/app/core/services/course.service.ts`
- **Role Enum**: `/src/app/core/enums/role.ts`
- **Context Encoder**: `/src/app/shared/utils/context-encoder.ts`

---

**Última Actualización**: 27 de Noviembre, 2025  
**Versión**: 1.0.0
