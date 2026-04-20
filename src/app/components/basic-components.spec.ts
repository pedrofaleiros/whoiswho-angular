import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as backButtonModule from './back-button/back-button.component';
import { AppBarComponent } from './app-bar/app-bar.component';
import { GameEnvInputComponent } from './game-env-input/game-env-input.component';
import { GameEnv } from '../models/game-env';
import { ImpostorsButtonComponent } from './impostors-button/impostors-button.component';
import { NavGameEnvButtonComponent } from './nav-game-env-button/nav-game-env-button.component';
import { PlayerRoleListComponent } from './player-role-list/player-role-list.component';
import { PlayerRole } from '../models/player-role';
import { RoomSwitchesComponent } from './room-switches/room-switches.component';
import { UsersListComponent } from './users-list/users-list.component';
import {
  createLocationSpy,
  createRouterSpy,
  createToastrSpy,
  makeUser,
  resetStorage,
} from '../../../testing/test-helpers';

describe('basic components', () => {
  afterEach(() => {
    resetStorage();
  });

  describe('AppBarComponent', () => {
    let fixture: ComponentFixture<AppBarComponent>;
    let component: AppBarComponent;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
      resetStorage();
      localStorage.setItem('auth-username', 'Alice');
      router = createRouterSpy();

      TestBed.configureTestingModule({
        imports: [AppBarComponent],
        providers: [
          { provide: Router, useValue: router },
        ],
      });

      fixture = TestBed.createComponent(AppBarComponent);
      component = fixture.componentInstance;
    });

    it('reads the username and navigates to profile and home', () => {
      expect(component.showTrailing).toBeTrue();
      expect(component.username).toBe('Alice');

      component.navigateProfile();
      component.navigateHome();

      expect(router.navigate).toHaveBeenCalledWith(['profile']);
      expect(router.navigate).toHaveBeenCalledWith(['home']);
    });
  });

  describe('BackButtonComponent', () => {
    let fixture: ComponentFixture<backButtonModule.BackButtonComponent>;
    let component: backButtonModule.BackButtonComponent;
    let router: jasmine.SpyObj<Router>;
    let location: jasmine.SpyObj<Location>;
    let toast: jasmine.SpyObj<ToastrService>;

    beforeEach(() => {
      router = createRouterSpy();
      location = createLocationSpy();
      toast = createToastrSpy();

      TestBed.configureTestingModule({
        imports: [backButtonModule.BackButtonComponent],
        providers: [
          { provide: Router, useValue: router },
          { provide: Location, useValue: location },
          { provide: ToastrService, useValue: toast },
        ],
      });

      fixture = TestBed.createComponent(backButtonModule.BackButtonComponent);
      component = fixture.componentInstance;
    });

    it('goes back when the window history is long enough', () => {
      spyOn(backButtonModule.backButtonBrowser, 'getWindowHistoryLength').and.returnValue(3);

      component.navigateBack();

      expect(toast.clear).toHaveBeenCalled();
      expect(location.back).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('navigates home when the window history is short', () => {
      spyOn(backButtonModule.backButtonBrowser, 'getWindowHistoryLength').and.returnValue(2);

      component.navigateBack();

      expect(toast.clear).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['home']);
    });

    it('returns the current browser history length', () => {
      expect(backButtonModule.backButtonBrowser.getWindowHistoryLength()).toBe(window.history.length);
    });
  });

  describe('GameEnvInputComponent', () => {
    it('emits createGameEnv on submit', () => {
      TestBed.configureTestingModule({
        imports: [GameEnvInputComponent],
      });

      const fixture = TestBed.createComponent(GameEnvInputComponent);
      const component = fixture.componentInstance;
      component.newGameEnv = new GameEnv('', '');
      component.errorMessage = null;
      spyOn(component.createGameEnv, 'emit');

      component.onSubmit();

      expect(component.createGameEnv.emit).toHaveBeenCalled();
    });
  });

  describe('ImpostorsButtonComponent', () => {
    it('emits only when the user is admin', () => {
      TestBed.configureTestingModule({
        imports: [ImpostorsButtonComponent],
      });

      const fixture = TestBed.createComponent(ImpostorsButtonComponent);
      const component = fixture.componentInstance;
      spyOn(component.onClick, 'emit');

      component.isADM = false;
      component.handleClick();
      expect(component.onClick.emit).not.toHaveBeenCalled();

      component.isADM = true;
      component.handleClick();
      expect(component.onClick.emit).toHaveBeenCalled();
    });
  });

  describe('NavGameEnvButtonComponent', () => {
    it('navigates to the game environments page', () => {
      const router = createRouterSpy();

      TestBed.configureTestingModule({
        imports: [NavGameEnvButtonComponent],
        providers: [
          { provide: Router, useValue: router },
        ],
      });

      const fixture = TestBed.createComponent(NavGameEnvButtonComponent);
      const component = fixture.componentInstance;

      component.navigateGameEnvs();

      expect(router.navigate).toHaveBeenCalledWith(['gameEnvs']);
    });
  });

  describe('PlayerRoleListComponent', () => {
    it('deletes a role only in editable mode', () => {
      TestBed.configureTestingModule({
        imports: [PlayerRoleListComponent],
      });

      const fixture = TestBed.createComponent(PlayerRoleListComponent);
      const component = fixture.componentInstance;
      component.playerRoles = [new PlayerRole('role-1', 'Doctor')];
      spyOn(component.deletePlayerRole, 'emit');

      component.editable = false;
      component.delete('role-1');
      expect(component.deletePlayerRole.emit).not.toHaveBeenCalled();

      component.editable = true;
      component.delete('role-1');
      expect(component.deletePlayerRole.emit).toHaveBeenCalledWith('role-1');
    });
  });

  describe('RoomSwitchesComponent', () => {
    it('emits both switch actions', () => {
      TestBed.configureTestingModule({
        imports: [RoomSwitchesComponent],
      });

      const fixture = TestBed.createComponent(RoomSwitchesComponent);
      const component = fixture.componentInstance;
      spyOn(component.onClickDefault, 'emit');
      spyOn(component.onClickUser, 'emit');

      component.handleClickDefault();
      component.handleClickUser();

      expect(component.onClickDefault.emit).toHaveBeenCalled();
      expect(component.onClickUser.emit).toHaveBeenCalled();
    });
  });

  describe('UsersListComponent', () => {
    it('reads storage state and identifies the current user', () => {
      resetStorage();
      localStorage.setItem('auth-id', 'user-1');
      localStorage.setItem('auth-username', 'Alice');

      TestBed.configureTestingModule({
        imports: [UsersListComponent],
      });

      const fixture = TestBed.createComponent(UsersListComponent);
      const component = fixture.componentInstance;
      component.users = [makeUser()];
      component.ownerId = 'user-1';

      expect(component.userId).toBe('user-1');
      expect(component.username).toBe('Alice');
      expect(component.isMe('user-1')).toBeTrue();
      expect(component.isMe('user-2')).toBeFalse();
    });

    it('falls back to empty strings when storage is empty', () => {
      resetStorage();

      TestBed.configureTestingModule({
        imports: [UsersListComponent],
      });

      const fixture = TestBed.createComponent(UsersListComponent);
      const component = fixture.componentInstance;

      expect(component.userId).toBe('');
      expect(component.username).toBe('');
    });
  });
});
