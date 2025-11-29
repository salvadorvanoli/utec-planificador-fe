import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { PositionService } from './position.service';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let positionService: jasmine.SpyObj<PositionService>;

  const mockAuthResponse: AuthResponse = {
    accessToken: 'mock-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    email: 'test@example.com',
    fullName: 'Test User',
    roles: ['STUDENT'],
    lastLoginAt: new Date().toISOString()
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const positionServiceSpy = jasmine.createSpyObj('PositionService', ['clearAllState']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: PositionService, useValue: positionServiceSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    positionService = TestBed.inject(PositionService) as jasmine.SpyObj<PositionService>;

    // Limpiar localStorage y sessionStorage antes de cada test
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send POST request with credentials and update state on success', (done) => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(service.isAuthenticated()).toBe(true);
          expect(service.currentUser()).toEqual(mockAuthResponse);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockAuthResponse);
    });

    it('should handle login error', (done) => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      service.login(credentials).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(service.isAuthenticated()).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should send POST request and clear state on success', () => {
      service.logout();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      req.flush({});

      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBe(null);
      expect(positionService.clearAllState).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should clear state even on logout error', () => {
      service.logout();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBe(null);
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('clearSession', () => {
    it('should clear state and redirect to login', () => {
      service.clearSession();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBe(null);
      expect(positionService.clearAllState).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should clear localStorage and sessionStorage', () => {
      localStorage.setItem('test', 'value');
      sessionStorage.setItem('test', 'value');

      service.clearSession();

      expect(localStorage.length).toBe(0);
      expect(sessionStorage.length).toBe(0);
    });
  });

  describe('checkAuthStatus', () => {
    it('should update state when authenticated', (done) => {
      service.checkAuthStatus().subscribe({
        next: (isAuthenticated) => {
          expect(isAuthenticated).toBe(true);
          expect(service.isAuthenticated()).toBe(true);
          expect(service.currentUser()).toEqual(mockAuthResponse);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/status`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockAuthResponse);
    });

    it('should return false and clear state when not authenticated', (done) => {
      service.checkAuthStatus().subscribe({
        next: (isAuthenticated) => {
          expect(isAuthenticated).toBe(false);
          expect(service.isAuthenticated()).toBe(false);
          expect(service.currentUser()).toBe(null);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/status`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('state management', () => {
    it('should initialize with unauthenticated state', () => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBe(null);
    });

    it('should clear localStorage and sessionStorage on logout', () => {
      localStorage.setItem('test', 'value');
      sessionStorage.setItem('test', 'value');

      service.logout();
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      req.flush({});

      expect(localStorage.length).toBe(0);
      expect(sessionStorage.length).toBe(0);
    });
  });
});

