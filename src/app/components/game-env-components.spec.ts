import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DefaultGameEnvComponent } from './default-game-env/default-game-env.component';
import { GameEnvListComponent } from './game-env-list/game-env-list.component';
import { UserGameEnvComponent } from './user-game-env/user-game-env.component';
import { GameEnv } from '../models/game-env';
import { GameEnvService } from '../services/game-env.service';
import { PlayerRoleService } from '../services/player-role.service';
import {
  createRouterSpy,
  createToastrSpy,
  makeGameEnv,
  makePlayerRole,
  resetStorage,
} from '../../../testing/test-helpers';

describe('game environment components', () => {
  afterEach(() => {
    resetStorage();
  });

  describe('DefaultGameEnvComponent', () => {
    let fixture: ComponentFixture<DefaultGameEnvComponent>;
    let component: DefaultGameEnvComponent;
    let playerRoleService: jasmine.SpyObj<PlayerRoleService>;

    beforeEach(() => {
      playerRoleService = jasmine.createSpyObj<PlayerRoleService>('PlayerRoleService', ['findAll', 'create', 'delete']);
      playerRoleService.findAll.and.returnValue(of([makePlayerRole({ name: 'Pilot' })]));

      TestBed.configureTestingModule({
        imports: [DefaultGameEnvComponent],
        providers: [
          { provide: PlayerRoleService, useValue: playerRoleService },
        ],
      });

      fixture = TestBed.createComponent(DefaultGameEnvComponent);
      component = fixture.componentInstance;
      component.gameEnv = makeGameEnv();
    });

    it('loads player roles only on first expand', () => {
      component.setExpand();
      expect(component.expand).toBeTrue();
      expect(playerRoleService.findAll).toHaveBeenCalledWith('env-1');
      expect(component.playerRoles[0].name).toBe('Pilot');
      expect(component.loading).toBeFalse();

      component.setExpand();
      component.setExpand();
      expect(playerRoleService.findAll).toHaveBeenCalledTimes(1);
    });

    it('marks loading as false when role loading fails', () => {
      playerRoleService.findAll.and.returnValue(throwError(() => new Error('fail')));

      component.findPlayerRoles();

      expect(component.loading).toBeFalse();
    });
  });

  describe('UserGameEnvComponent', () => {
    let fixture: ComponentFixture<UserGameEnvComponent>;
    let component: UserGameEnvComponent;
    let playerRoleService: jasmine.SpyObj<PlayerRoleService>;
    let toast: jasmine.SpyObj<ToastrService>;

    beforeEach(() => {
      playerRoleService = jasmine.createSpyObj<PlayerRoleService>('PlayerRoleService', ['findAll', 'create', 'delete']);
      toast = createToastrSpy();

      TestBed.configureTestingModule({
        imports: [UserGameEnvComponent],
        providers: [
          { provide: PlayerRoleService, useValue: playerRoleService },
          { provide: ToastrService, useValue: toast },
        ],
      });

      fixture = TestBed.createComponent(UserGameEnvComponent);
      component = fixture.componentInstance;
      component.gameEnv = makeGameEnv();
    });

    it('loads roles on first expand only', () => {
      playerRoleService.findAll.and.returnValue(of([makePlayerRole()]));

      component.setExpand();
      component.setExpand();
      component.setExpand();

      expect(playerRoleService.findAll).toHaveBeenCalledTimes(1);
      expect(component.playerRoles.length).toBe(1);
    });

    it('creates roles, sorts them, and handles empty input', () => {
      playerRoleService.create.and.returnValue(of(makePlayerRole({ id: 'role-2', name: 'Actor' })));
      component.playerRoles = [makePlayerRole({ id: 'role-1', name: 'Doctor' })];

      component.createPlayerRole();
      expect(playerRoleService.create).not.toHaveBeenCalled();

      component.newPlayerRole.name = 'Actor';
      component.createPlayerRole();

      expect(toast.clear).toHaveBeenCalled();
      expect(playerRoleService.create).toHaveBeenCalledWith('Actor', 'env-1');
      expect(component.newPlayerRole.name).toBe('');
      expect(component.playerRoles.map((role) => role.name)).toEqual(['Actor', 'Doctor']);
    });

    it('shows a toast when role creation fails', () => {
      playerRoleService.create.and.returnValue(throwError(() => ({ error: { message: 'Duplicated' } })));
      component.newPlayerRole.name = 'Actor';

      component.createPlayerRole();

      expect(toast.error).toHaveBeenCalledWith('Duplicated');
    });

    it('deletes a role when confirmed', () => {
      playerRoleService.delete.and.returnValue(of({}));
      component.playerRoles = [makePlayerRole({ id: 'role-1' }), makePlayerRole({ id: 'role-2' })];
      spyOn(window, 'confirm').and.returnValue(true);

      component.deletePlayerRole('role-1');

      expect(playerRoleService.delete).toHaveBeenCalledWith('role-1');
      expect(component.playerRoles.map((role) => role.id)).toEqual(['role-2']);
    });

    it('does not delete a role when the user cancels and tolerates delete errors', () => {
      const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);

      component.deletePlayerRole('role-1');

      expect(playerRoleService.delete).not.toHaveBeenCalled();

      confirmSpy.and.returnValue(true);
      playerRoleService.delete.and.returnValue(throwError(() => new Error('fail')));

      expect(() => component.deletePlayerRole('role-1')).not.toThrow();
    });

    it('loads roles and handles load errors', () => {
      playerRoleService.findAll.and.returnValue(of([makePlayerRole()]));

      component.findPlayerRoles();
      expect(component.playerRoles.length).toBe(1);
      expect(component.loading).toBeFalse();

      component.loading = true;
      playerRoleService.findAll.and.returnValue(throwError(() => new Error('fail')));
      component.findPlayerRoles();
      expect(component.loading).toBeFalse();
    });

    it('emits deleteGameEnv', () => {
      spyOn(component.deleteGameEnv, 'emit');

      component.delete();

      expect(component.deleteGameEnv.emit).toHaveBeenCalled();
    });
  });

  describe('GameEnvListComponent', () => {
    let fixture: ComponentFixture<GameEnvListComponent>;
    let component: GameEnvListComponent;
    let gameEnvService: jasmine.SpyObj<GameEnvService>;
    let router: jasmine.SpyObj<Router>;
    let toast: jasmine.SpyObj<ToastrService>;

    beforeEach(() => {
      resetStorage();
      gameEnvService = jasmine.createSpyObj<GameEnvService>('GameEnvService', ['findAll', 'findAllDefault', 'findById', 'delete', 'create', 'update']);
      gameEnvService.findAll.and.returnValue(of([
        new GameEnv('env-1', 'Beach'),
        new GameEnv('env-2', 'Airport'),
        new GameEnv('env-3', 'Museum'),
        new GameEnv('env-4', 'School'),
        new GameEnv('env-5', 'Hotel'),
        new GameEnv('env-6', 'Zoo'),
      ]));
      gameEnvService.create.and.returnValue(of(new GameEnv('env-7', 'Theater')));
      router = createRouterSpy();
      toast = createToastrSpy();

      TestBed.configureTestingModule({
        imports: [GameEnvListComponent],
        providers: [
          { provide: GameEnvService, useValue: gameEnvService },
          { provide: Router, useValue: router },
          { provide: ToastrService, useValue: toast },
        ],
      });

      fixture = TestBed.createComponent(GameEnvListComponent);
      component = fixture.componentInstance;
    });

    it('loads environments on construction and limits the list when showAll is false', () => {
      expect(gameEnvService.findAll).toHaveBeenCalled();
      expect(component.showAll).toBeFalse();
      expect(component.gameEnvs.length).toBe(6);
      expect(component.getList().length).toBe(5);
    });

    it('persists the showAll flag', () => {
      component.setShowAll();

      expect(component.showAll).toBeTrue();
      expect(sessionStorage.getItem('show-all-game-env')).toBe('true');
      expect(component.getList().length).toBe(6);

      component.setShowAll();
      expect(component.showAll).toBeFalse();
      expect(sessionStorage.getItem('show-all-game-env')).toBe('false');
    });

    it('reads the showAll flag from session storage on construction', () => {
      resetStorage();
      sessionStorage.setItem('show-all-game-env', 'true');
      gameEnvService.findAll.calls.reset();

      const newFixture = TestBed.createComponent(GameEnvListComponent);
      const newComponent = newFixture.componentInstance;

      expect(newComponent.showAll).toBeTrue();
      expect(gameEnvService.findAll).toHaveBeenCalled();
    });

    it('logs errors when environment loading fails', () => {
      spyOn(console, 'log');
      gameEnvService.findAll.and.returnValue(throwError(() => new Error('fail')));

      component.findAll();

      expect(console.log).toHaveBeenCalled();
    });

    it('navigates to the selected game environment', () => {
      component.edit(new GameEnv('env-1', 'Beach'));

      expect(router.navigate).toHaveBeenCalledWith(['/gameEnv', 'env-1']);
    });

    it('creates environments and resets the input', () => {
      component.create();
      expect(gameEnvService.create).not.toHaveBeenCalled();

      component.newGameEnv.name = 'Theater';
      component.create();

      expect(gameEnvService.create).toHaveBeenCalledWith('Theater');
      expect(component.gameEnvs[component.gameEnvs.length - 1].name).toBe('Theater');
      expect(component.newGameEnv.name).toBe('');
    });

    it('shows an error toast when environment creation fails', () => {
      gameEnvService.create.and.returnValue(throwError(() => ({ error: { message: 'Duplicated' } })));
      component.newGameEnv.name = 'Theater';

      component.create();

      expect(toast.error).toHaveBeenCalledWith('Duplicated');
    });
  });
});
