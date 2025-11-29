# Documentación de Testing - UTEC Planificador Frontend

## Índice

1. [Introducción](#introducción)
2. [Configuración del Entorno de Testing](#configuración-del-entorno-de-testing)
3. [Ejecutar Tests](#ejecutar-tests)
4. [Estadísticas de Tests](#estadísticas-de-tests)
5. [Estructura de Tests](#estructura-de-tests)
6. [Tipos de Tests](#tipos-de-tests)
7. [Patrones y Mejores Prácticas](#patrones-y-mejores-prácticas)
8. [Ejemplos por Categoría](#ejemplos-por-categoría)
9. [Solución de Problemas Comunes](#solución-de-problemas-comunes)
10. [Comandos Útiles](#comandos-útiles)
11. [Cobertura de Código](#cobertura-de-código)
12. [Recursos Adicionales](#recursos-adicionales)

---

## Introducción

Este proyecto utiliza **Jasmine** como framework de testing y **Karma** como test runner para realizar pruebas unitarias en Angular. La suite de tests está diseñada para garantizar la calidad y estabilidad del código del frontend.

### Tecnologías Utilizadas

- **Jasmine**: Framework de testing BDD (Behavior-Driven Development)
- **Karma v6.4.4**: Test runner que ejecuta los tests en navegadores reales
- **Angular Testing Utilities**: Herramientas de testing proporcionadas por Angular (`@angular/core/testing`, `@angular/common/http/testing`)
- **Chrome 142.0**: Navegador para desarrollo (Windows 10)
- **ChromeHeadless**: Navegador sin interfaz gráfica para CI/CD

---

## Configuración del Entorno de Testing

### Archivos de Configuración

#### `karma.conf.js`
Configuración principal de Karma que define:
- **Navegadores**: Chrome (desarrollo), ChromeHeadless (CI/CD)
- **Frameworks**: Jasmine, @angular-devkit/build-angular
- **Plugins**: 
  - karma-jasmine
  - karma-chrome-launcher
  - karma-jasmine-html-reporter
  - karma-coverage
  - @angular-devkit/build-angular/plugins/karma
- **Cobertura de código**: Configurado con umbrales mínimos del 50% en statements, branches, functions y lines
- **Reportes**: HTML, text-summary, lcovonly

#### `tsconfig.spec.json`
Configuración de TypeScript específica para tests:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jasmine"]
  },
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

#### `src/test-setup.ts`
Archivo de inicialización que configura el entorno de testing de Angular antes de ejecutar los tests.

---

## Ejecutar Tests

### Comandos Disponibles

```bash
# Ejecutar tests en modo watch (desarrollo)
npm test

# Ejecutar tests una sola vez en Chrome Headless
npm run test:headless

# Ejecutar tests con cobertura de código
npm run test:coverage

# Ejecutar tests en CI/CD con configuración optimizada
npm run test:ci
```

### Opciones Adicionales

```bash
# Ejecutar tests sin watch y con cobertura
npm test -- --no-watch --code-coverage

# Ejecutar un archivo específico
npm test -- --include='**/auth.service.spec.ts'
```

### Salida de Tests

Cuando todos los tests pasan, verás:
```
Chrome 142.0.0.0 (Windows 10): Executed 79 of 79 SUCCESS (0.412 secs / 0.354 secs)
TOTAL: 79 SUCCESS
```

---

## Estadísticas de Tests

**Última actualización:** 26 de noviembre de 2025

### Resumen General
- **Total de archivos de test:** 12
- **Total de tests ejecutados:** 79
- **Tests exitosos:** 79 (100%)
- **Tests fallidos:** 0
- **Tiempo de ejecución:** ~0.4 segundos

### Distribución por Categoría

| Categoría | Archivos | Descripción |
|-----------|----------|-------------|
| **Componentes** | 6 | Tests de componentes UI (button, color-picker, multiselect, expanded-info, title-and-background, home) |
| **Servicios** | 2 | Tests de servicios (AuthService, CourseService) |
| **Guards** | 1 | Tests de guards de navegación (authGuard) |
| **Interceptors** | 1 | Tests de interceptores HTTP (authInterceptor) |
| **Páginas** | 2 | Tests de páginas (Home, Login) |
| **App** | 1 | Test del componente principal de la aplicación |

### Archivos de Test en el Proyecto

```
src/app/
├── app.spec.ts
├── core/
│   ├── guards/
│   │   └── auth.guard.spec.ts
│   ├── interceptors/
│   │   └── auth.interceptor.spec.ts
│   └── services/
│       ├── auth.service.spec.ts
│       └── course.service.spec.ts
├── features/
│   └── planner/
│       └── components/
│           └── color-picker/
│               └── color-picker.spec.ts
├── pages/
│   ├── home/
│   │   ├── home.spec.ts
│   │   └── components/
│   │       └── title-and-background/
│   │           └── title-and-background.spec.ts
│   └── login/
│       └── login.spec.ts
└── shared/
    └── components/
        ├── button/
        │   └── button.spec.ts
        ├── course-info/
        │   └── components/
        │       └── expanded-info/
        │           └── expanded-info.spec.ts
        └── multiselect/
            └── multiselect.spec.ts
```

---

## Estructura de Tests

### Organización de Archivos

Los archivos de test siguen la convención `*.spec.ts` y se ubican junto a los archivos que prueban:

```
src/
├── app/
│   ├── app.ts
│   ├── app.spec.ts                    # Test del componente principal
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── auth.guard.spec.ts     # Test de guards
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   └── auth.interceptor.spec.ts
│   │   └── services/
│   │       ├── auth.service.ts
│   │       └── auth.service.spec.ts   # Test de servicios
│   ├── pages/
│   │   ├── login/
│   │   │   ├── login.ts
│   │   │   └── login.spec.ts          # Test de páginas
│   │   └── home/
│   │       ├── home.ts
│   │       └── home.spec.ts
│   └── shared/
│       └── components/
│           ├── button/
│           │   ├── button.ts
│           │   └── button.spec.ts     # Test de componentes compartidos
│           └── color-picker/
│               ├── color-picker.ts
│               └── color-picker.spec.ts
```

### Anatomía de un Test

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiComponente } from './mi-componente';

describe('MiComponente', () => {
  let component: MiComponente;
  let fixture: ComponentFixture<MiComponente>;

  // Configuración antes de cada test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiComponente]  // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(MiComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test individual
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Grupo de tests relacionados
  describe('Funcionalidad específica', () => {
    it('should do something', () => {
      // Arrange (preparar)
      const value = 'test';
      
      // Act (actuar)
      component.setValue(value);
      
      // Assert (verificar)
      expect(component.value()).toBe(value);
    });
  });
});
```

---

## Tipos de Tests

### 1. Tests de Componentes

#### Componentes Standalone

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]  // Importar componente standalone
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

#### Testing de Inputs y Outputs

```typescript
describe('Input properties', () => {
  it('should accept label input', () => {
    const testLabel = 'Test Button';
    fixture.componentRef.setInput('label', testLabel);
    fixture.detectChanges();
    expect(component.label()).toBe(testLabel);
  });
});

describe('Output events', () => {
  it('should emit onClick event', () => {
    let emittedEvent: MouseEvent | undefined;
    
    component.onClick.subscribe((event: MouseEvent) => {
      emittedEvent = event;
    });

    const mockEvent = new MouseEvent('click');
    component.onClick.emit(mockEvent);

    expect(emittedEvent).toBeDefined();
  });
});
```

#### Testing de Signals

```typescript
it('should update signal value', () => {
  // Signal inicial
  expect(component.count()).toBe(0);
  
  // Actualizar signal
  component.count.set(5);
  expect(component.count()).toBe(5);
  
  // Usar update
  component.count.update(v => v + 1);
  expect(component.count()).toBe(6);
});

it('should compute derived values', () => {
  component.firstName.set('John');
  component.lastName.set('Doe');
  
  // El computed se actualiza automáticamente
  expect(component.fullName()).toBe('John Doe');
});
```

#### Testing del DOM

```typescript
import { By } from '@angular/platform-browser';

it('should render button with correct label', () => {
  const testLabel = 'Click Me';
  fixture.componentRef.setInput('label', testLabel);
  fixture.detectChanges();

  const buttonElement = fixture.debugElement.query(By.css('button'));
  expect(buttonElement).toBeTruthy();
  expect(buttonElement.nativeElement.textContent.trim()).toBe(testLabel);
});

it('should apply CSS classes conditionally', () => {
  fixture.componentRef.setInput('active', true);
  fixture.detectChanges();

  const element = fixture.debugElement.nativeElement;
  expect(element.classList.contains('active')).toBe(true);
});
```

#### Testing de Formularios Reactivos

```typescript
import { ReactiveFormsModule } from '@angular/forms';

describe('Login Form', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule]
    }).compileComponents();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('');
    emailControl?.markAsTouched();
    
    expect(emailControl?.hasError('required')).toBe(true);
    expect(component.loginForm.valid).toBe(false);
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();
    
    expect(emailControl?.hasError('email')).toBe(true);
  });

  it('should be valid with correct inputs', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(component.loginForm.valid).toBe(true);
  });
});
```

### 2. Tests de Servicios

#### Testing de Servicios HTTP

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CourseService } from './course.service';

describe('CourseService', () => {
  let service: CourseService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/v1/courses';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CourseService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(CourseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no hay peticiones pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send GET request with query parameters', (done) => {
    const userId = 123;
    const campusId = 1;
    const searchText = 'Programación';
    const mockResponse = { /* mock data */ };

    service.getCourses(userId, campusId, '2025-1', searchText, 0, 10).subscribe({
      next: (response) => {
        expect(response).toEqual(mockResponse);
        done();
      }
    });

    // Importante: Angular codifica automáticamente caracteres especiales en URLs
    const req = httpMock.expectOne(
      `${apiUrl}?page=0&size=10&userId=${userId}&campusId=${campusId}&period=2025-1&searchText=${encodeURIComponent(searchText)}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should send POST request to create resource', (done) => {
    const mockRequest = { name: 'New Course' };
    const mockResponse = { id: 1, ...mockRequest };

    service.createCourse(mockRequest).subscribe({
      next: (response) => {
        expect(response).toEqual(mockResponse);
        done();
      }
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('should handle 404 error', (done) => {
    const courseId = 999;

    service.getCourseById(courseId).subscribe({
      error: (error: any) => {
        expect(error.status).toBe(404);
        done();
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });
});
```

### 3. Tests de Guards

Los guards funcionales se prueban usando `TestBed.runInInjectionContext()`:

```typescript
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '../services';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Crear spies de los servicios que necesita el guard
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['checkAuthStatus']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow activation when user is authenticated', (done) => {
    authService.checkAuthStatus.and.returnValue(of(true));

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);

      if (typeof result === 'object' && result !== null && 'subscribe' in result) {
        result.subscribe((canActivate) => {
          expect(canActivate).toBe(true);
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        });
      }
    });
  });

  it('should deny activation and redirect to login', (done) => {
    authService.checkAuthStatus.and.returnValue(of(false));

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);

      if (typeof result === 'object' && result !== null && 'subscribe' in result) {
        result.subscribe((canActivate) => {
          expect(canActivate).toBe(false);
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          done();
        });
      }
    });
  });

  it('should handle errors gracefully', (done) => {
    authService.checkAuthStatus.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);

      if (typeof result === 'object' && result !== null && 'subscribe' in result) {
        result.subscribe((canActivate) => {
          expect(canActivate).toBe(false);
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          done();
        });
      }
    });
  });
});
```

### 4. Tests de Interceptors

Los interceptores funcionales se prueban configurándolos con `withInterceptors()`:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Limpiar storage antes de cada test
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add withCredentials to all requests', () => {
    const testUrl = '/api/test';

    httpClient.get(testUrl).subscribe();

    const req = httpMock.expectOne(testUrl);
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('should redirect to login on 401 error', () => {
    const testUrl = '/api/data';

    httpClient.get(testUrl).subscribe({
      error: () => {
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should clear storage on 401 error', () => {
    localStorage.setItem('test', 'value');
    sessionStorage.setItem('test', 'value');

    httpClient.get('/api/data').subscribe({
      error: () => {
        expect(localStorage.length).toBe(0);
        expect(sessionStorage.length).toBe(0);
      }
    });

    const req = httpMock.expectOne('/api/data');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should not redirect for 401 on login endpoint', () => {
    httpClient.post('/auth/login', {}).subscribe({
      error: () => {
        expect(router.navigate).not.toHaveBeenCalled();
      }
    });

    const req = httpMock.expectOne('/auth/login');
    req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
  });
});
```

---

## Patrones y Mejores Prácticas

### 1. Uso de Spies (Jasmine Spies)

Los spies permiten simular y verificar el comportamiento de funciones:

```typescript
describe('Component with service dependency', () => {
  it('should call service method', () => {
    const serviceSpy = jasmine.createSpyObj('MyService', ['getData']);
    serviceSpy.getData.and.returnValue(of({ data: 'test' }));

    // Usar el spy en el componente
    component.service = serviceSpy;
    component.loadData();

    expect(serviceSpy.getData).toHaveBeenCalled();
    expect(serviceSpy.getData).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Tests Asíncronos

El proyecto usa callbacks `done()` para tests asíncronos:

```typescript
it('should handle async operation', (done) => {
  service.getData().subscribe({
    next: (data) => {
      expect(data).toBeTruthy();
      done(); // Marca el test como completado
    },
    error: (error) => {
      fail('Should not have failed');
      done();
    }
  });
});
```

### 3. Limpieza de Estado

Siempre limpia el estado entre tests:

```typescript
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  httpMock.verify(); // Para tests HTTP
});
```

### 4. Organización con `describe()` anidados

Agrupa tests relacionados para mejor organización:

```typescript
describe('CourseService', () => {
  describe('CRUD Operations', () => {
    it('should create course', () => { /* ... */ });
    it('should read course', () => { /* ... */ });
    it('should update course', () => { /* ... */ });
    it('should delete course', () => { /* ... */ });
  });

  describe('Error Handling', () => {
    it('should handle 404 error', () => { /* ... */ });
    it('should handle network error', () => { /* ... */ });
  });
});
```

### 5. Manejo de Caracteres Especiales en URLs

Al probar peticiones HTTP con parámetros que contienen caracteres especiales, usa `encodeURIComponent()`:

```typescript
const searchText = 'Programación';
const req = httpMock.expectOne(
  `${apiUrl}?searchText=${encodeURIComponent(searchText)}`
);
// Angular codifica automáticamente: Programaci%C3%B3n
```

### 6. Testing de Standalone Components

Todos los componentes en este proyecto son standalone, se importan directamente:

```typescript
await TestBed.configureTestingModule({
  imports: [MyStandaloneComponent, CommonModule, ReactiveFormsModule]
}).compileComponents();
```

### 7. Evitar Código Duplicado

Crea helpers y fixtures reutilizables:

```typescript
const mockCourse = {
  id: 1,
  name: 'Test Course',
  // ... otros campos
};

// Reutilizar en múltiples tests
it('test 1', () => {
  service.getCourse(1).subscribe(course => {
    expect(course).toEqual(mockCourse);
  });
});
```

---

## Ejemplos por Categoría

### Tests Implementados en el Proyecto

#### 1. Componentes UI
- **ButtonComponent**: Tests de inputs (color, label, font), outputs (onClick), y renderizado DOM
- **ColorPickerComponent**: Tests de selección de color y emisión de eventos
- **MultiSelector**: Tests de selección múltiple
- **ExpandedInfo**: Tests de visualización de información expandida
- **TitleAndBackground**: Tests de título y fondo

#### 2. Servicios
- **AuthService**: Tests de login, logout, verificación de estado de autenticación
- **CourseService**: Tests completos de CRUD, paginación, filtros, manejo de errores

#### 3. Guards
- **authGuard**: Tests de autorización, redirección a login, manejo de errores

#### 4. Interceptors
- **authInterceptor**: Tests de agregado de credentials, manejo de 401, limpieza de storage

#### 5. Páginas
- **Home**: Tests del componente de página principal
- **Login**: Tests de formulario de login, validaciones

#### 6. App
- **AppComponent**: Tests del componente raíz de la aplicación

---

## Solución de Problemas Comunes

### 1. Error: "Expected one matching request, found none"

**Problema**: La URL esperada no coincide con la URL real.

**Solución**: Verifica el encoding de caracteres especiales:
```typescript
// ❌ Incorrecto
const req = httpMock.expectOne(`${apiUrl}?search=Programación`);

// ✅ Correcto
const req = httpMock.expectOne(`${apiUrl}?search=${encodeURIComponent('Programación')}`);
```

### 2. Error: "Expected no open requests, found 1"

**Problema**: No se manejó una petición HTTP en el test.

**Solución**: Asegúrate de llamar a `httpMock.verify()` en `afterEach()` y de manejar todas las peticiones:
```typescript
afterEach(() => {
  httpMock.verify();
});

it('test', () => {
  service.getData().subscribe();
  const req = httpMock.expectOne('/api/data');
  req.flush(mockData); // No olvides esto
});
```

### 3. Error: "has no exported member 'X'"

**Problema**: Nombre de clase/export incorrecto.

**Solución**: Verifica que el nombre de la clase en el archivo `.spec.ts` coincida con el del archivo `.ts`:
```typescript
// ✅ Correcto
import { MultiSelector } from './multiselect';
// Nombre de la clase es MultiSelector, no Multiselect
```

### 4. Warnings de archivos 404

**Warnings como**: `404: /base/media/utec_txt_light.ttf`

**Solución**: Estos son warnings normales de fuentes y assets que no afectan los tests. Pueden ignorarse o configurarse en `karma.conf.js`.

### 5. Tests que fallan intermitentemente

**Problema**: Tests asíncronos sin manejo correcto.

**Solución**: Usa el callback `done()` y maneja tanto success como error:
```typescript
it('async test', (done) => {
  service.getData().subscribe({
    next: (data) => {
      expect(data).toBeTruthy();
      done();
    },
    error: (error) => {
      fail('Should not error');
      done();
    }
  });
});
```

---

## Comandos Útiles

```bash
# Ver cobertura en navegador
npm run test:coverage
# Luego abrir: ./coverage/utec-planificador-fe/index.html

# Ejecutar tests específicos (modificar el archivo spec temporalmente)
# Cambiar 'describe' por 'fdescribe' o 'it' por 'fit'

# Ejecutar en modo headless para CI/CD
npm run test:ci

# Ejecutar tests en modo debug
npm test
# Luego abrir: http://localhost:9876/debug.html
```

---

## Cobertura de Código

El proyecto está configurado con umbrales mínimos de cobertura del **50%** en:
- Statements
- Branches  
- Functions
- Lines

Los reportes de cobertura se generan en: `./coverage/utec-planificador-fe/`

Para ver el reporte de cobertura:
```bash
npm run test:coverage
# Abrir: coverage/utec-planificador-fe/index.html
```

---

## Recursos Adicionales

- [Documentación oficial de Jasmine](https://jasmine.github.io/)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Karma Configuration](https://karma-runner.github.io/latest/config/configuration-file.html)
- [HTTP Testing en Angular](https://angular.io/guide/http-test-requests)

---

**Última actualización**: 26 de noviembre de 2025  
**Versión de Angular**: 19.x  
**Total de tests**: 79 exitosos  
**Estado del proyecto**: ✅ Todos los tests pasando

