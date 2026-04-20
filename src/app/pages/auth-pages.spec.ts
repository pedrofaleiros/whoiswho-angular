import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { LoginComponent } from './login/login.component';
import { LoginGuestComponent } from './login-guest/login-guest.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import {
  createRouterSpy,
  createToastrSpy,
  resetStorage,
} from '../../../testing/test-helpers';

describe('auth-related pages', () => {
  afterEach(() => {
    resetStorage();
  });

  describe('LoginComponent', () => {
    let router: jasmine.SpyObj<Router>;
    let toast: jasmine.SpyObj<ToastrService>;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
      resetStorage();
      router = createRouterSpy();
      toast = createToastrSpy();
      authService = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'signup', 'loginGuest', 'update', 'logout']);

      TestBed.configureTestingModule({
        imports: [LoginComponent],
        providers: [
          { provide: Router, useValue: router },
          { provide: ToastrService, useValue: toast },
          { provide: AuthService, useValue: authService },
        ],
      });
      TestBed.overrideComponent(LoginComponent, {
        set: { template: '' },
      });
    });

    function createComponent() {
      const fixture = TestBed.createComponent(LoginComponent);
      return fixture.componentInstance;
    }

    it('redirects home from the constructor when a token already exists', () => {
      localStorage.setItem('auth-token', 'token');

      createComponent();

      expect(router.navigate).toHaveBeenCalledWith(['home']);
    });

    it('toggles password visibility, validates input, submits, and handles navigation', () => {
      const component = createComponent();
      authService.login.and.returnValue(of({ id: '1', username: 'alice', token: 'token' } as any));

      expect(component.showPassword).toBeFalse();
      component.setShowPassword();
      expect(component.showPassword).toBeTrue();

      component.submit();
      expect(toast.warning).toHaveBeenCalledWith('Preencha todos os campos');

      component.loginForm.setValue({ username: 'alice', password: 'secret' });
      component.submit();
      expect(authService.login).toHaveBeenCalledWith('alice', 'secret');
      expect(component.isLoading).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['home']);

      component.isLoading = true;
      router.navigate.calls.reset();
      component.loginGuest();
      component.navigate();
      expect(router.navigate).not.toHaveBeenCalled();

      component.isLoading = false;
      component.loginGuest();
      component.navigate();
      expect(router.navigate).toHaveBeenCalledWith(['guest']);
      expect(router.navigate).toHaveBeenCalledWith(['signup']);
    });

    it('returns early from submit while loading', () => {
      const component = createComponent();
      component.loginForm.setValue({ username: 'alice', password: 'secret' });
      component.isLoading = true;

      component.submit();

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('handles login failures with and without backend messages', () => {
      const component = createComponent();
      component.loginForm.setValue({ username: 'alice', password: 'secret' });

      authService.login.and.returnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));
      component.submit();
      expect(component.isLoading).toBeFalse();
      expect(toast.clear).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');

      toast.error.calls.reset();
      authService.login.and.returnValue(throwError(() => ({ error: {} })));
      component.submit();
      expect(toast.error).toHaveBeenCalledWith('Erro inesperado');
    });
  });

  describe('LoginGuestComponent', () => {
    let router: jasmine.SpyObj<Router>;
    let toast: jasmine.SpyObj<ToastrService>;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
      resetStorage();
      router = createRouterSpy();
      toast = createToastrSpy();
      authService = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'signup', 'loginGuest', 'update', 'logout']);

      TestBed.configureTestingModule({
        imports: [LoginGuestComponent],
        providers: [
          { provide: Router, useValue: router },
          { provide: ToastrService, useValue: toast },
          { provide: AuthService, useValue: authService },
        ],
      });
      TestBed.overrideComponent(LoginGuestComponent, {
        set: { template: '' },
      });
    });

    function createComponent() {
      const fixture = TestBed.createComponent(LoginGuestComponent);
      return fixture.componentInstance;
    }

    it('redirects home when a token already exists', () => {
      localStorage.setItem('auth-token', 'token');

      createComponent();

      expect(router.navigate).toHaveBeenCalledWith(['home']);
    });

    it('submits guest login and guards empty/loading states', () => {
      const component = createComponent();
      authService.loginGuest.and.returnValue(of({ id: '1', username: 'guest', token: 'token' } as any));

      component.submit();
      expect(authService.loginGuest).not.toHaveBeenCalled();

      component.guestForm.setValue({ username: 'guest' });
      component.submit();
      expect(authService.loginGuest).toHaveBeenCalledWith('guest');
      expect(component.isLoading).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['home']);

      component.isLoading = true;
      authService.loginGuest.calls.reset();
      component.submit();
      expect(authService.loginGuest).not.toHaveBeenCalled();
    });

    it('handles guest login failures with and without backend messages', () => {
      const component = createComponent();
      component.guestForm.setValue({ username: 'guest' });

      authService.loginGuest.and.returnValue(throwError(() => ({ error: { message: 'Blocked' } })));
      component.submit();
      expect(toast.clear).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Blocked');

      toast.error.calls.reset();
      authService.loginGuest.and.returnValue(throwError(() => ({ error: {} })));
      component.submit();
      expect(toast.error).toHaveBeenCalledWith('Erro inesperado');
    });
  });

  describe('SignupComponent', () => {
    let router: jasmine.SpyObj<Router>;
    let toast: jasmine.SpyObj<ToastrService>;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
      resetStorage();
      router = createRouterSpy();
      toast = createToastrSpy();
      authService = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'signup', 'loginGuest', 'update', 'logout']);

      TestBed.configureTestingModule({
        imports: [SignupComponent],
        providers: [
          { provide: Router, useValue: router },
          { provide: ToastrService, useValue: toast },
          { provide: AuthService, useValue: authService },
        ],
      });
      TestBed.overrideComponent(SignupComponent, {
        set: { template: '' },
      });
    });

    function createComponent() {
      const fixture = TestBed.createComponent(SignupComponent);
      return fixture.componentInstance;
    }

    it('toggles password visibility, validates input, and submits', () => {
      const component = createComponent();
      authService.signup.and.returnValue(of({ id: '1', username: 'alice', token: 'token' } as any));

      component.setShowPassword();
      expect(component.showPassword).toBeTrue();

      component.submit();
      expect(toast.warning).toHaveBeenCalledWith('Preencha todos os campos');

      component.signupForm.setValue({
        username: 'alice',
        password: 'secret',
        passwordConfirm: 'different',
      });
      component.submit();
      expect(toast.warning).toHaveBeenCalledWith('Verifique a senha');

      component.signupForm.setValue({
        username: 'alice',
        password: 'secret',
        passwordConfirm: 'secret',
      });
      component.submit();
      expect(authService.signup).toHaveBeenCalledWith('alice', 'secret');
      expect(component.isLoading).toBeFalse();
      expect(toast.success).toHaveBeenCalledWith('Cadastrado com sucesso');
      expect(router.navigate).toHaveBeenCalledWith(['home']);

      component.isLoading = true;
      authService.signup.calls.reset();
      component.submit();
      expect(authService.signup).not.toHaveBeenCalled();
    });

    it('handles signup failures and navigation', () => {
      const component = createComponent();
      component.signupForm.setValue({
        username: 'alice',
        password: 'secret',
        passwordConfirm: 'secret',
      });

      authService.signup.and.returnValue(throwError(() => ({ error: { message: 'Duplicated' } })));
      component.submit();
      expect(toast.clear).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Duplicated');

      toast.error.calls.reset();
      authService.signup.and.returnValue(throwError(() => ({ error: {} })));
      component.submit();
      expect(toast.error).toHaveBeenCalledWith('Erro inesperado');

      component.isLoading = true;
      router.navigate.calls.reset();
      component.navigate();
      expect(router.navigate).not.toHaveBeenCalled();

      component.isLoading = false;
      component.navigate();
      expect(router.navigate).toHaveBeenCalledWith(['login']);
    });
  });

  describe('ProfileComponent', () => {
    let fixture: ComponentFixture<ProfileComponent>;
    let component: ProfileComponent;
    let router: jasmine.SpyObj<Router>;
    let toast: jasmine.SpyObj<ToastrService>;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
      resetStorage();
      localStorage.setItem('auth-username', 'Alice');
      router = createRouterSpy();
      toast = createToastrSpy();
      authService = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'signup', 'loginGuest', 'update', 'logout']);

      TestBed.configureTestingModule({
        imports: [ProfileComponent],
        providers: [
          { provide: Router, useValue: router },
          { provide: ToastrService, useValue: toast },
          { provide: AuthService, useValue: authService },
        ],
      });
      TestBed.overrideComponent(ProfileComponent, {
        set: { template: '' },
      });

      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
    });

    it('initializes the username input from storage', () => {
      expect(component.username).toBe('Alice');
      expect(component.usernameInput).toBe('Alice');
    });

    it('falls back to an empty username when storage is empty', () => {
      resetStorage();
      const newFixture = TestBed.createComponent(ProfileComponent);
      const newComponent = newFixture.componentInstance;

      expect(newComponent.username).toBe('');
      expect(newComponent.usernameInput).toBe('');
    });

    it('logs out only when the user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.logout();
      expect(authService.logout).not.toHaveBeenCalled();

      (window.confirm as jasmine.Spy).and.returnValue(true);
      component.logout();
      expect(authService.logout).toHaveBeenCalledWith(router);
    });

    it('skips saving on empty input and short-circuits when the username did not change', () => {
      component.usernameInput = '';
      component.save();
      expect(toast.clear).toHaveBeenCalled();
      expect(authService.update).not.toHaveBeenCalled();

      component.usernameInput = 'Alice';
      component.save();
      expect(toast.success).toHaveBeenCalledWith('Alterado com sucesso.');
      expect(authService.update).not.toHaveBeenCalled();
    });

    it('saves the new username and handles backend errors', () => {
      authService.update.and.returnValue(of({ username: 'Bob' } as any));
      component.usernameInput = 'Bob';

      component.save();

      expect(authService.update).toHaveBeenCalledWith('Bob');
      expect(component.username).toBe('Bob');
      expect(component.usernameInput).toBe('Bob');

      authService.update.and.returnValue(throwError(() => ({ error: { message: 'Duplicated' } })));
      component.usernameInput = 'Carol';
      component.save();
      expect(component.errorMessage).toBe('Duplicated');
    });
  });
});
