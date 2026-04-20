import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenInterceptor } from './token-interceptor.service';
import { createRouterSpy, resetStorage } from '../../../testing/test-helpers';

describe('TokenInterceptor', () => {
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    resetStorage();
    router = createRouterSpy();
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['logout']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
      ],
    });
  });

  afterEach(() => {
    resetStorage();
  });

  it('adds the bearer token to protected requests', () => {
    localStorage.setItem('auth-token', 'token-1');
    let forwardedRequest: HttpRequest<unknown> | undefined;

    TestBed.runInInjectionContext(() => TokenInterceptor(
      new HttpRequest('GET', '/api/rooms'),
      (request) => {
        forwardedRequest = request;
        return of(new HttpResponse({ status: 200 }));
      },
    )).subscribe();

    expect(forwardedRequest?.headers.get('Authorization')).toBe('Bearer token-1');
  });

  it('does not add the bearer token to auth requests', () => {
    localStorage.setItem('auth-token', 'token-1');
    let forwardedRequest: HttpRequest<unknown> | undefined;

    TestBed.runInInjectionContext(() => TokenInterceptor(
      new HttpRequest('POST', '/api/login', null),
      (request) => {
        forwardedRequest = request;
        return of(new HttpResponse({ status: 200 }));
      },
    )).subscribe();

    expect(forwardedRequest?.headers.has('Authorization')).toBeFalse();
  });

  it('logs out on 401 errors', () => {
    TestBed.runInInjectionContext(() => TokenInterceptor(
      new HttpRequest('GET', '/api/rooms'),
      () => throwError(() => new HttpErrorResponse({ status: 401 })),
    )).subscribe({
      error: () => undefined,
    });

    expect(authService.logout).toHaveBeenCalledWith(router);
  });

  it('logs out on 403 errors', () => {
    TestBed.runInInjectionContext(() => TokenInterceptor(
      new HttpRequest('GET', '/api/rooms'),
      () => throwError(() => new HttpErrorResponse({ status: 403 })),
    )).subscribe({
      error: () => undefined,
    });

    expect(authService.logout).toHaveBeenCalledWith(router);
  });

  it('rethrows non-auth errors without logging out', () => {
    const error = new HttpErrorResponse({ status: 500 });
    let capturedError: HttpErrorResponse | undefined;

    TestBed.runInInjectionContext(() => TokenInterceptor(
      new HttpRequest('GET', '/api/rooms'),
      () => throwError(() => error),
    )).subscribe({
      error: (value) => {
        capturedError = value;
      },
    });

    expect(authService.logout).not.toHaveBeenCalled();
    expect(capturedError).toBe(error);
  });
});
