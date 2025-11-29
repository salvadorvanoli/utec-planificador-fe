import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockAuthResponse: AuthResponse = {
    accessToken: 'mock-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    email: 'test@example.com',
    fullName: 'Test User',
    roles: ['STUDENT'],
    lastLoginAt: new Date().toISOString()
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.loginForm.value).toEqual({
        email: '',
        password: ''
      });
    });

    it('should have required validators on email and password', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      expect(emailControl?.hasError('required')).toBe(true);
      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should validate email max length', () => {
      const emailControl = component.loginForm.get('email');
      const longEmail = 'a'.repeat(101) + '@test.com';
      emailControl?.setValue(longEmail);
      expect(emailControl?.hasError('maxlength')).toBe(true);
    });

    it('should validate password max length', () => {
      const passwordControl = component.loginForm.get('password');
      const longPassword = 'a'.repeat(129);
      passwordControl?.setValue(longPassword);
      expect(passwordControl?.hasError('maxlength')).toBe(true);
    });
  });

  describe('togglePasswordVisibility', () => {
    it('should toggle password visibility', () => {
      expect(component.showPassword()).toBe(false);

      component.togglePasswordVisibility();
      expect(component.showPassword()).toBe(true);

      component.togglePasswordVisibility();
      expect(component.showPassword()).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
      expect(component.loginForm.get('email')?.touched).toBe(true);
      expect(component.loginForm.get('password')?.touched).toBe(true);
    });

    it('should submit valid credentials and navigate on success', () => {
      authService.login.and.returnValue(of(mockAuthResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });

      component.onSubmit();

      expect(component.isLoading()).toBe(false);
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(router.navigate).toHaveBeenCalledWith(['/option-page']);
      expect(component.errorMessage()).toBe(null);
    });

    it('should set loading state during submission', () => {
      authService.login.and.returnValue(of(mockAuthResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });

      component.onSubmit();

      expect(component.isLoading()).toBe(false);
    });

    it('should handle 401 error (invalid credentials)', () => {
      const error = { status: 401, error: { message: 'Unauthorized' } };
      authService.login.and.returnValue(throwError(() => error));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      component.onSubmit();

      expect(component.isLoading()).toBe(false);
      // El componente usa el mensaje del backend directamente
      expect(component.errorMessage()).toBe('Unauthorized');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle 400 error (bad request)', () => {
      const error = { status: 400, error: { message: 'Bad Request' } };
      authService.login.and.returnValue(throwError(() => error));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });

      component.onSubmit();

      expect(component.isLoading()).toBe(false);
      // El componente usa el mensaje del backend directamente
      expect(component.errorMessage()).toBe('Bad Request');
    });

    it('should handle generic errors', () => {
      const error = { status: 500, error: { message: 'Server Error' } };
      authService.login.and.returnValue(throwError(() => error));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });

      component.onSubmit();

      expect(component.isLoading()).toBe(false);
      // El componente usa el mensaje del backend directamente
      expect(component.errorMessage()).toBe('Server Error');
    });

    it('should clear previous error message on new submission', () => {
      const error = { status: 401, error: { message: 'Unauthorized' } };
      authService.login.and.returnValue(throwError(() => error));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      component.onSubmit();
      expect(component.errorMessage()).not.toBe(null);

      authService.login.and.returnValue(of(mockAuthResponse));
      component.loginForm.patchValue({
        password: 'correctpassword'
      });

      component.onSubmit();
      expect(component.errorMessage()).toBe(null);
    });
  });

  describe('Error messages', () => {
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

    it('should return email max length error', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.markAsTouched();
      const longEmail = 'a'.repeat(101) + '@test.com';
      emailControl?.setValue(longEmail);

      expect(component.getEmailError()).toBe('El correo no puede exceder 100 caracteres');
    });

    it('should return password required error', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.markAsTouched();
      passwordControl?.setValue('');

      expect(component.getPasswordError()).toBe('La contraseña es requerida');
    });

    it('should return empty string when no errors', () => {
      component.loginForm.patchValue({
        email: 'valid@email.com',
        password: 'password123'
      });

      expect(component.getEmailError()).toBe('');
      expect(component.getPasswordError()).toBe('');
    });
  });

  describe('Component state', () => {
    it('should initialize with correct state', () => {
      expect(component.isLoading()).toBe(false);
      expect(component.errorMessage()).toBe(null);
      expect(component.showPassword()).toBe(false);
    });
  });
});

