# Documentación de Testing - UTEC Planificador Frontend

## Índice

1. [Introducción](#introducción)
2. [Configuración del Entorno de Testing](#configuración-del-entorno-de-testing)
3. [Ejecutar Tests](#ejecutar-tests)
4. [Estructura de Tests](#estructura-de-tests)
5. [Tipos de Tests](#tipos-de-tests)
6. [Patrones y Mejores Prácticas](#patrones-y-mejores-prácticas)
7. [Ejemplos por Categoría](#ejemplos-por-categoría)
8. [Solución de Problemas Comunes](#solución-de-problemas-comunes)

---

## Introducción

Este proyecto utiliza **Jasmine** como framework de testing y **Karma** como test runner para realizar pruebas unitarias en Angular. La suite de tests está diseñada para garantizar la calidad y estabilidad del código del frontend.

### Tecnologías Utilizadas

- **Jasmine**: Framework de testing BDD (Behavior-Driven Development)
- **Karma**: Test runner que ejecuta los tests en navegadores reales
- **Angular Testing Utilities**: Herramientas de testing proporcionadas por Angular
- **Chrome Headless**: Navegador sin interfaz gráfica para CI/CD

---

## Configuración del Entorno de Testing

### Archivos de Configuración

#### `karma.conf.js`
Configuración principal de Karma que define:
- Navegadores a usar (Chrome, ChromeHeadless)
- Frameworks (Jasmine, Angular CLI)
- Plugins y reportes
- Timeouts y configuración de ejecución

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

# Ejecutar tests una sola vez en Chrome Headless (CI/CD)
npm run test:headless

# Ejecutar tests con cobertura de código
npm run test:coverage
```

### Salida de Tests

Cuando todos los tests pasan, verás:
```
Chrome Headless 142.0.0.0 (Windows 10): Executed 75 of 75 SUCCESS (0.308 secs / 0.271 secs)
TOTAL: 75 SUCCESS
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
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]  // Importar componente standalone
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
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

  const buttonElement = debugElement.query(By.css('button'));
  expect(buttonElement).toBeTruthy();
  expect(buttonElement.nativeElement.textContent.trim()).toBe(testLabel);
});

it('should apply CSS classes conditionally', () => {
  fixture.componentRef.setInput('active', true);
  fixture.detectChanges();

  const element = debugElement.nativeElement;
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

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no hay peticiones pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send login request', () => {
    const mockCredentials = { email: 'test@test.com', password: 'pass123' };
    const mockResponse = { token: 'abc123', user: { id: 1, email: 'test@test.com' } };

    service.login(mockCredentials).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    req.flush(mockResponse);
  });

  it('should handle login error', () => {
    const mockCredentials = { email: 'test@test.com', password: 'wrong' };

    service.login(mockCredentials).subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/auth/login`);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
```

### 3. Tests de Guards

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

  it('should deny activation and redirect to login when not authenticated', (done) => {
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
});
```

### 4. Tests de Interceptors

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
});
```

---

## Patrones y Mejores Prácticas

### 1. Patrón AAA (Arrange-Act-Assert)

```typescript
it('should calculate total price correctly', () => {
  // Arrange: Preparar el escenario
  const items = [
    { name: 'Item 1', price: 10 },
    { name: 'Item 2', price: 20 }
  ];
  component.items.set(items);
  
  // Act: Ejecutar la acción
  const total = component.calculateTotal();
  
  // Assert: Verificar el resultado
  expect(total).toBe(30);
});
```

### 2. Uso de Spies y Mocks

```typescript
describe('Component with Dependencies', () => {
  let mockService: jasmine.SpyObj<MyService>;

  beforeEach(() => {
    // Crear un spy del servicio
    mockService = jasmine.createSpyObj('MyService', ['getData', 'saveData']);
    mockService.getData.and.returnValue(of({ data: 'test' }));

    TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        { provide: MyService, useValue: mockService }
      ]
    });
  });

  it('should call service on init', () => {
    expect(mockService.getData).toHaveBeenCalled();
  });

  it('should handle service error', () => {
    mockService.getData.and.returnValue(throwError(() => new Error('Error')));
    // Test error handling
  });
});
```

### 3. Testing Asíncrono

```typescript
import { fakeAsync, tick, waitForAsync } from '@angular/core/testing';

// Con fakeAsync y tick
it('should update after timeout', fakeAsync(() => {
  component.delayedUpdate();
  tick(1000); // Avanza el tiempo 1 segundo
  expect(component.value()).toBe('updated');
}));

// Con async/await
it('should load data asynchronously', async () => {
  await component.loadData();
  expect(component.data()).toBeDefined();
});

// Con done callback
it('should emit event', (done) => {
  component.dataLoaded.subscribe(data => {
    expect(data).toBeTruthy();
    done();
  });
  component.loadData();
});
```

### 4. Testing de Routing

```typescript
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';

describe('Navigation', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        provideRouter([
          { path: 'home', component: HomeComponent },
          { path: 'login', component: LoginComponent }
        ])
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should navigate to home', async () => {
    await router.navigate(['/home']);
    expect(router.url).toBe('/home');
  });
});
```

### 5. Testing de Directivas

```typescript
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MyDirective } from './my-directive';

@Component({
  template: '<div appMyDirective [config]="config"></div>',
  imports: [MyDirective]
})
class TestComponent {
  config = { enabled: true };
}

describe('MyDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directive: MyDirective;
  let element: DebugElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    element = fixture.debugElement.query(By.directive(MyDirective));
    directive = element.injector.get(MyDirective);
    fixture.detectChanges();
  });

  it('should apply directive', () => {
    expect(directive).toBeTruthy();
  });
});
```

### 6. Testing de Pipes

```typescript
import { MyPipe } from './my-pipe';

describe('MyPipe', () => {
  let pipe: MyPipe;

  beforeEach(() => {
    pipe = new MyPipe();
  });

  it('should transform value', () => {
    expect(pipe.transform('hello')).toBe('HELLO');
  });

  it('should handle null values', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
```

---

## Ejemplos por Categoría

### Componente Simple con Signals

```typescript
// button.ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  template: '<button (click)="handleClick()">{{ label() }}</button>'
})
export class ButtonComponent {
  readonly label = input<string>('Button');
  readonly onClick = output<void>();

  handleClick(): void {
    this.onClick.emit();
  }
}

// button.spec.ts
describe('ButtonComponent', () => {
  it('should emit onClick when button is clicked', () => {
    let clicked = false;
    component.onClick.subscribe(() => clicked = true);
    
    const button = debugElement.query(By.css('button'));
    button.nativeElement.click();
    
    expect(clicked).toBe(true);
  });
});
```

### Servicio con HTTP

```typescript
// course.service.ts
export class CourseService {
  private readonly http = inject(HttpClient);
  
  getCourses(params: CourseParams): Observable<CoursePage> {
    return this.http.get<CoursePage>(`${this.apiUrl}/courses`, { params });
  }
}

// course.service.spec.ts
describe('CourseService', () => {
  it('should fetch courses with correct params', () => {
    const mockParams = { page: 0, size: 10 };
    const mockResponse = { content: [], totalElements: 0 };

    service.getCourses(mockParams).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(request => 
      request.url.includes('/courses') &&
      request.params.get('page') === '0' &&
      request.params.get('size') === '10'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
```

### Componente con Formulario

```typescript
// login.ts
export class Login {
  readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  getEmailError(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required') && emailControl?.touched) {
      return 'El correo es requerido';
    }
    if (emailControl?.hasError('email') && emailControl?.touched) {
      return 'Ingresa un correo válido';
    }
    return '';
  }
}

// login.spec.ts
describe('Login Form Validation', () => {
  it('should return email required error', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.markAsTouched();
    emailControl?.setValue('');
    
    expect(component.getEmailError()).toBe('El correo es requerido');
  });

  it('should return email format error', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.markAsTouched();
    emailControl?.setValue('invalid-email');
    
    expect(component.getEmailError()).toBe('Ingresa un correo válido');
  });

  it('should not return error for valid email', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.markAsTouched();
    emailControl?.setValue('test@example.com');
    
    expect(component.getEmailError()).toBe('');
  });
});
```

---

## Solución de Problemas Comunes

### Error: "Property 'X' is protected/private"

**Problema**: No se puede acceder a propiedades protegidas/privadas en tests.

**Solución**:
```typescript
// ❌ Incorrecto
export class MyComponent {
  protected readonly title = signal('Title');
}

// ✅ Correcto
export class MyComponent {
  readonly title = signal('Title'); // Por defecto es public
}
```

### Error: "ng-reflect-* attribute is null"

**Problema**: Los atributos `ng-reflect-*` solo aparecen en modo desarrollo.

**Solución**: Buscar el elemento real renderizado:
```typescript
// ❌ Incorrecto
const label = button.nativeElement.getAttribute('ng-reflect-label');

// ✅ Correcto
const buttonElement = debugElement.query(By.css('button'));
const label = buttonElement.nativeElement.textContent.trim();
```

### Error: "Expected spy to have been called"

**Problema**: El spy no está siendo llamado como se esperaba.

**Solución**: Verificar que `detectChanges()` se haya llamado:
```typescript
component.someInput.set('value');
fixture.detectChanges(); // ← Importante
expect(mockService.method).toHaveBeenCalled();
```

### Error: "HttpTestingController.verify() failed"

**Problema**: Hay peticiones HTTP pendientes sin responder.

**Solución**:
```typescript
afterEach(() => {
  httpMock.verify(); // Esto fallará si hay peticiones sin respuesta
});

it('should make request', () => {
  service.getData().subscribe();
  const req = httpMock.expectOne('/api/data');
  req.flush(mockData); // ← Asegurarse de responder todas las peticiones
});
```

### Error: "Can't resolve all parameters"

**Problema**: TestBed no puede inyectar dependencias.

**Solución**: Proveer todas las dependencias necesarias:
```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [MyComponent],
    providers: [
      provideHttpClient(),
      provideRouter([]),
      MyService, // ← Proveer servicios necesarios
      { provide: OtherService, useValue: mockService }
    ]
  });
});
```

### Tests Asíncronos que Fallan

**Problema**: Los tests terminan antes de que se complete la operación asíncrona.

**Solución**: Usar las utilidades correctas:
```typescript
// Opción 1: done callback
it('should work', (done) => {
  service.asyncOperation().subscribe(result => {
    expect(result).toBeTruthy();
    done(); // ← Indica que el test terminó
  });
});

// Opción 2: async/await
it('should work', async () => {
  const result = await firstValueFrom(service.asyncOperation());
  expect(result).toBeTruthy();
});

// Opción 3: fakeAsync
it('should work', fakeAsync(() => {
  service.asyncOperation().subscribe();
  tick(1000);
  expect(component.data()).toBeTruthy();
}));
```

---

## Cobertura de Tests

### Ver Reporte de Cobertura

```bash
npm run test:coverage
```

Esto generará un reporte en `coverage/` mostrando:
- **Statements**: % de líneas ejecutadas
- **Branches**: % de ramas condicionales probadas
- **Functions**: % de funciones ejecutadas
- **Lines**: % de líneas de código cubiertas

### Objetivo de Cobertura

- **Mínimo recomendado**: 80%
- **Óptimo**: 90%+
- **Crítico** (guards, interceptors, servicios core): 100%

---

## Integración Continua (CI)

### GitHub Actions / GitLab CI

```yaml
test:
  script:
    - npm ci
    - npm run test:headless
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

---

## Recursos Adicionales

- [Angular Testing Guide](https://angular.dev/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Configuration](https://karma-runner.github.io/latest/config/configuration-file.html)
- [Testing with Signals](https://angular.dev/guide/signals#testing)

---

## Resumen de Comandos

```bash
# Desarrollo
npm test                    # Tests en modo watch
npm run test:headless      # Tests headless (CI)
npm run test:coverage      # Tests con cobertura

# Crear un nuevo test
ng generate component my-component --skip-tests=false
ng generate service my-service --skip-tests=false
```

---

## Convenciones del Proyecto

1. **Cada archivo debe tener su test**: `*.ts` → `*.spec.ts`
2. **Organización**: Tests junto al código que prueban
3. **Naming**: Usar nombres descriptivos en los `it()` y `describe()`
4. **Standalone**: Usar standalone components en TestBed
5. **Signals**: Usar `signal()`, `computed()`, `input()`, `output()`
6. **Limpieza**: Usar `afterEach()` para limpiar recursos
7. **Independencia**: Cada test debe ser independiente
8. **Legibilidad**: Código de tests debe ser claro y fácil de entender

---

**Última actualización**: 14 de noviembre de 2025

