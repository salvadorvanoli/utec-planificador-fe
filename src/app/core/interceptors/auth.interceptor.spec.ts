import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['clearSession']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
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
        expect(authService.clearSession).toHaveBeenCalled();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should clear session on 401 error', () => {
    const testUrl = '/api/data';

    httpClient.get(testUrl).subscribe({
      error: () => {
        expect(authService.clearSession).toHaveBeenCalled();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should not redirect to login for 401 on /auth/login endpoint', () => {
    const loginUrl = '/auth/login';

    httpClient.post(loginUrl, {}).subscribe({
      error: () => {
        expect(authService.clearSession).not.toHaveBeenCalled();
      }
    });

    const req = httpMock.expectOne(loginUrl);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should not handle errors other than 401', () => {
    const testUrl = '/api/data';

    httpClient.get(testUrl).subscribe({
      error: () => {
        expect(authService.clearSession).not.toHaveBeenCalled();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should allow successful requests to proceed', (done) => {
    const testUrl = '/api/data';
    const testData = { message: 'Success' };

    httpClient.get(testUrl).subscribe({
      next: (response) => {
        expect(response).toEqual(testData);
        expect(authService.clearSession).not.toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne(testUrl);
    expect(req.request.withCredentials).toBe(true);
    req.flush(testData);
  });

  it('should handle multiple concurrent requests correctly', () => {
    const urls = ['/api/data1', '/api/data2', '/api/data3'];

    urls.forEach(url => {
      httpClient.get(url).subscribe();
    });

    urls.forEach(url => {
      const req = httpMock.expectOne(url);
      expect(req.request.withCredentials).toBe(true);
      req.flush({});
    });
  });

  it('should handle 401 on specific URL patterns', () => {
    const protectedUrl = '/api/protected/resource';

    httpClient.get(protectedUrl).subscribe({
      error: () => {
        expect(authService.clearSession).toHaveBeenCalled();
      }
    });

    const req = httpMock.expectOne(protectedUrl);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});

