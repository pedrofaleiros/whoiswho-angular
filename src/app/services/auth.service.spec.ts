import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environment/environment';
import { createRouterSpy, resetStorage } from '../../../testing/test-helpers';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    resetStorage();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: createRouterSpy() },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    resetStorage();
  });

  it('logs in and stores auth data', () => {
    let response: any;

    service.login('alice', 'secret').subscribe((value) => {
      response = value;
    });

    const request = httpMock.expectOne(`${environment.API_URL}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'alice', password: 'secret' });
    request.flush({ id: '1', username: 'alice', token: 'token-1' });

    expect(response.username).toBe('alice');
    expect(localStorage.getItem('auth-token')).toBe('token-1');
    expect(localStorage.getItem('auth-username')).toBe('alice');
    expect(localStorage.getItem('auth-id')).toBe('1');
  });

  it('signs up and stores auth data', () => {
    service.signup('bob', 'secret').subscribe();

    const request = httpMock.expectOne(`${environment.API_URL}/auth/signup`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'bob', password: 'secret' });
    request.flush({ id: '2', username: 'bob', token: 'token-2' });

    expect(localStorage.getItem('auth-token')).toBe('token-2');
    expect(localStorage.getItem('auth-username')).toBe('bob');
    expect(localStorage.getItem('auth-id')).toBe('2');
  });

  it('logs in as guest and stores auth data', () => {
    service.loginGuest('guest').subscribe();

    const request = httpMock.expectOne(`${environment.API_URL}/auth/guest`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'guest' });
    request.flush({ id: '3', username: 'guest', token: 'token-3' });

    expect(localStorage.getItem('auth-token')).toBe('token-3');
    expect(localStorage.getItem('auth-username')).toBe('guest');
    expect(localStorage.getItem('auth-id')).toBe('3');
  });

  it('updates user data and stores returned auth data', () => {
    service.update('charlie').subscribe();

    const request = httpMock.expectOne(`${environment.API_URL}/auth/update`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ username: 'charlie' });
    request.flush({ id: '4', username: 'charlie', token: 'token-4' });

    expect(localStorage.getItem('auth-token')).toBe('token-4');
    expect(localStorage.getItem('auth-username')).toBe('charlie');
    expect(localStorage.getItem('auth-id')).toBe('4');
  });

  it('clears storage and navigates on logout', () => {
    const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    localStorage.setItem('auth-token', 'token');
    localStorage.setItem('auth-username', 'alice');
    localStorage.setItem('auth-id', '1');
    sessionStorage.setItem('last-room', 'room-1');

    service.logout(router);

    expect(localStorage.getItem('auth-token')).toBeNull();
    expect(localStorage.getItem('auth-username')).toBeNull();
    expect(localStorage.getItem('auth-id')).toBeNull();
    expect(sessionStorage.getItem('last-room')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['login']);
  });
});
