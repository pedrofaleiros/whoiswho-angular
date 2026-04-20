import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AuthGuard, AuthGuardService } from './auth-guard.service';
import { createRouterSpy, resetStorage } from '../../../testing/test-helpers';

describe('AuthGuardService', () => {
  let router: jasmine.SpyObj<Router>;
  let service: AuthGuardService;

  beforeEach(() => {
    resetStorage();
    router = createRouterSpy();

    TestBed.configureTestingModule({
      providers: [
        AuthGuardService,
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthGuardService);
  });

  afterEach(() => {
    resetStorage();
  });

  it('allows navigation when auth token exists', () => {
    localStorage.setItem('auth-token', 'token');

    expect(service.canActivate({} as any, {} as any)).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects to login when auth token does not exist', () => {
    expect(service.canActivate({} as any, {} as any)).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('delegates the functional guard to the service', () => {
    localStorage.setItem('auth-token', 'token');

    const result = TestBed.runInInjectionContext(() => AuthGuard({} as any, {} as any));

    expect(result).toBeTrue();
  });
});
