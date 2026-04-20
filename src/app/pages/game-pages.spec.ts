import { ActivatedRoute, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import * as homeModule from './home/home.component';
import { HomeComponent } from './home/home.component';
import { GameEnvsComponent } from './game-envs/game-envs.component';
import { GameEnvService } from '../services/game-env.service';
import { RoomService } from '../services/room.service';
import { PlayComponent } from './play/play.component';
import { SocketService } from '../services/socket.service';
import { GameEnv } from '../models/game-env';
import { MockSocketService, createRouterSpy, createToastrSpy, makeGame, makeGamePlayer, makeRoom, makeUser, resetStorage } from '../../../testing/test-helpers';

describe('game-related pages', () => {
  afterEach(() => {
    resetStorage();
  });

  describe('HomeComponent', () => {
    let roomService: jasmine.SpyObj<RoomService>;
    let router: jasmine.SpyObj<Router>;
    let toast: jasmine.SpyObj<ToastrService>;

    beforeEach(() => {
      resetStorage();
      roomService = jasmine.createSpyObj<RoomService>('RoomService', ['createRoom']);
      router = createRouterSpy();
      Object.defineProperty(router, 'url', { configurable: true, value: '/home' });
      toast = createToastrSpy();

      TestBed.configureTestingModule({
        imports: [HomeComponent],
        providers: [
          { provide: RoomService, useValue: roomService },
          { provide: Router, useValue: router },
          { provide: ToastrService, useValue: toast },
        ],
      });
      TestBed.overrideComponent(HomeComponent, {
        set: { template: '' },
      });
    });

    function createComponent() {
      const fixture = TestBed.createComponent(HomeComponent);
      return fixture.componentInstance;
    }

    it('initializes form state and reads navigation state and last room', () => {
      sessionStorage.setItem('last-room', '123');
      spyOn(homeModule.homeBrowser, 'getNavigationState').and.returnValue({ errorMessage: 'Room unavailable' });
      spyOn(homeModule.homeBrowser, 'clearNavigationState');
      const component = createComponent();

      component.ngOnInit();

      expect(component.roomForm.value.roomId).toBe('');
      expect(homeModule.homeBrowser.clearNavigationState).toHaveBeenCalledWith('/home');
      expect(toast.clear).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Room unavailable');
      expect(component.lastRoom).toBe('123');
    });

    it('handles init without navigation errors or previous room', () => {
      spyOn(homeModule.homeBrowser, 'getNavigationState').and.returnValue({});
      spyOn(homeModule.homeBrowser, 'clearNavigationState');
      const component = createComponent();

      component.ngOnInit();

      expect(toast.error).not.toHaveBeenCalled();
      expect(component.lastRoom).toBeNull();
    });

    it('proxies browser history helpers', () => {
      spyOn(history, 'replaceState');

      expect(homeModule.homeBrowser.getNavigationState()).toBe(history.state);

      homeModule.homeBrowser.clearNavigationState('/home');
      expect(history.replaceState).toHaveBeenCalledWith({}, '', '/home');
    });

    it('creates a room, handles errors, and respects loading guards', () => {
      const component = createComponent();
      roomService.createRoom.and.returnValue(of('321'));

      component.loadingEnter = true;
      component.createRoom();
      expect(roomService.createRoom).not.toHaveBeenCalled();

      component.loadingEnter = false;
      component.createRoom();
      expect(roomService.createRoom).toHaveBeenCalled();
      expect(component.loadingNew).toBeTrue();
      expect(router.navigate).toHaveBeenCalledWith(['play', '321']);

      component.loadingNew = false;
      roomService.createRoom.and.returnValue(throwError(() => new Error('fail')));
      component.createRoom();
      expect(component.loadingNew).toBeFalse();
    });

    it('navigates to a room only when the room id is present and not loading', () => {
      const component = createComponent();

      component.loadingNew = true;
      component.navigateRoom();
      expect(router.navigate).not.toHaveBeenCalled();

      component.loadingNew = false;
      component.roomForm.setValue({ roomId: '' });
      component.navigateRoom();
      expect(router.navigate).not.toHaveBeenCalled();

      component.roomForm.setValue({ roomId: '999' });
      component.navigateRoom();
      expect(component.loadingEnter).toBeTrue();
      expect(router.navigate).toHaveBeenCalledWith(['play', '999']);
    });

    it('navigates to the last room only when available and not loading', () => {
      const component = createComponent();
      component.lastRoom = '999';

      component.loadingEnter = true;
      component.navigateLastRoom();
      expect(router.navigate).not.toHaveBeenCalled();

      component.loadingEnter = false;
      component.lastRoom = null;
      component.navigateLastRoom();
      expect(router.navigate).not.toHaveBeenCalled();

      component.lastRoom = '999';
      component.navigateLastRoom();
      expect(component.loadingLast).toBeTrue();
      expect(router.navigate).toHaveBeenCalledWith(['play', '999']);
    });
  });

  describe('GameEnvsComponent', () => {
    let fixture: ComponentFixture<GameEnvsComponent>;
    let component: GameEnvsComponent;
    let gameEnvService: jasmine.SpyObj<GameEnvService>;
    let toast: jasmine.SpyObj<ToastrService>;

    beforeEach(() => {
      gameEnvService = jasmine.createSpyObj<GameEnvService>('GameEnvService', ['findAll', 'findAllDefault', 'findById', 'delete', 'create', 'update']);
      gameEnvService.findAll.and.returnValue(of([
        new GameEnv('u2', 'Airport'),
        new GameEnv('u1', 'Beach'),
      ]));
      gameEnvService.findAllDefault.and.returnValue(of([
        new GameEnv('d2', 'Zoo'),
        new GameEnv('d1', 'Museum'),
      ]));
      gameEnvService.create.and.returnValue(of(new GameEnv('u3', 'Cinema')));
      gameEnvService.delete.and.returnValue(of({}));
      toast = createToastrSpy();

      TestBed.configureTestingModule({
        imports: [GameEnvsComponent],
        providers: [
          { provide: GameEnvService, useValue: gameEnvService },
          { provide: ToastrService, useValue: toast },
        ],
      });
      TestBed.overrideComponent(GameEnvsComponent, {
        set: { template: '' },
      });

      fixture = TestBed.createComponent(GameEnvsComponent);
      component = fixture.componentInstance;
    });

    it('loads both environment lists on construction and sorts them', () => {
      expect(gameEnvService.findAll).toHaveBeenCalled();
      expect(gameEnvService.findAllDefault).toHaveBeenCalled();
      expect(component.userGameEnvs.map((env) => env.name)).toEqual(['Airport', 'Beach']);
      expect(component.defaultGameEnvs.map((env) => env.name)).toEqual(['Museum', 'Zoo']);
      expect(component.activeIndex).toBe(0);
    });

    it('creates environments and handles empty input and backend failures', () => {
      component.createGameEnv();
      expect(gameEnvService.create).not.toHaveBeenCalled();

      component.newGameEnv.name = 'Cinema';
      component.createGameEnv();
      expect(toast.clear).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Adicionado com sucesso');
      expect(component.errorMessage).toBeNull();
      expect(component.newGameEnv.name).toBe('');
      expect(component.userGameEnvs.map((env) => env.name)).toEqual(['Airport', 'Beach', 'Cinema']);

      gameEnvService.create.and.returnValue(throwError(() => ({ error: { message: 'Duplicated' } })));
      component.newGameEnv.name = 'Cinema';
      component.createGameEnv();
      expect(component.errorMessage).toBe('Duplicated');
    });

    it('deletes environments only when confirmed and tolerates backend errors', () => {
      component.userGameEnvs = [
        new GameEnv('u1', 'Beach'),
        new GameEnv('u2', 'Airport'),
      ];
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteGameEnv('u1');
      expect(gameEnvService.delete).not.toHaveBeenCalled();

      (window.confirm as jasmine.Spy).and.returnValue(true);
      component.deleteGameEnv('u1');
      expect(gameEnvService.delete).toHaveBeenCalledWith('u1');
      expect(toast.success).toHaveBeenCalledWith('Deletado com sucesso');
      expect(component.userGameEnvs.map((env) => env.id)).toEqual(['u2']);

      gameEnvService.delete.and.returnValue(throwError(() => new Error('fail')));
      expect(() => component.deleteGameEnv('u2')).not.toThrow();
    });

    it('handles find methods errors and can switch tabs', () => {
      gameEnvService.findAll.and.returnValue(throwError(() => new Error('fail')));
      gameEnvService.findAllDefault.and.returnValue(throwError(() => new Error('fail')));

      expect(() => component.findUserGameEnvs()).not.toThrow();
      expect(() => component.findDefaultGameEnvs()).not.toThrow();
      expect(() => component.findGameEnvs()).not.toThrow();

      component.setActive(1);
      expect(component.activeIndex).toBe(1);
    });
  });

  describe('PlayComponent', () => {
    let fixture: ComponentFixture<PlayComponent>;
    let component: PlayComponent;
    let router: jasmine.SpyObj<Router>;
    let socketService: MockSocketService;
    let activatedRoute: { snapshot: { params: { id?: string } } };

    beforeEach(() => {
      resetStorage();
      localStorage.setItem('auth-id', 'user-1');
      localStorage.setItem('auth-username', 'Alice');
      router = createRouterSpy();
      socketService = new MockSocketService();
      activatedRoute = { snapshot: { params: { id: 'room-1' } } };

      TestBed.configureTestingModule({
        imports: [PlayComponent],
        providers: [
          { provide: Router, useValue: router },
          { provide: SocketService, useValue: socketService },
          { provide: ActivatedRoute, useValue: activatedRoute },
        ],
      });
      TestBed.overrideComponent(PlayComponent, {
        set: { template: '' },
      });

      fixture = TestBed.createComponent(PlayComponent);
      component = fixture.componentInstance;
    });

    it('joins the room on init and reacts to socket state changes', () => {
      const matchingGame = makeGame({
        id: 'game-1',
        gamePlayers: [
          makeGamePlayer({ user: makeUser({ id: 'user-1' }) }),
          makeGamePlayer({ id: 'game-player-2', user: makeUser({ id: 'user-2', username: 'Bob' }), impostor: true, playerRole: null }),
        ],
      });

      component.ngOnInit();
      expect(component.roomId).toBe('room-1');
      expect(component.userId).toBe('user-1');
      expect(component.username).toBe('Alice');
      expect(socketService.joinRoom).toHaveBeenCalledWith('room-1');
      expect(component.showGameIndex).toBe(-1);

      socketService.users$.next([makeUser()]);
      socketService.roomData$.next(makeRoom({ ownerId: 'user-1' }));
      socketService.games$.next([matchingGame]);
      socketService.countDown$.next('3');
      socketService.isLoading$.next(false);

      expect(component.users.length).toBe(1);
      expect(component.roomData?.ownerId).toBe('user-1');
      expect(component.games.length).toBe(1);
      expect(component.userGamePlayer?.user.id).toBe('user-1');
      expect(component.showGameIndex).toBe(0);
      expect(component.countDown).toBe('3');
      expect(component.isLoading).toBeFalse();
    });

    it('does not join when the route has no room id', () => {
      activatedRoute.snapshot.params = {};
      component = TestBed.createComponent(PlayComponent).componentInstance;

      component.ngOnInit();

      expect(socketService.joinRoom).not.toHaveBeenCalled();
    });

    it('falls back to empty auth data when storage is empty', () => {
      resetStorage();
      component = TestBed.createComponent(PlayComponent).componentInstance;

      component.ngOnInit();

      expect(component.userId).toBe('');
      expect(component.username).toBe('');
    });

    it('leaves the room, navigates home, and closes subscriptions on destroy', () => {
      component.ngOnInit();

      component.leaveRoom();
      expect(socketService.leaveRoom).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['home']);

      socketService.leaveRoom.calls.reset();
      component.ngOnDestroy();
      expect(socketService.leaveRoom).toHaveBeenCalled();
      expect((component as any).subs.closed).toBeTrue();
    });

    it('evaluates admin state, game navigation, user role lookup, and latest game', () => {
      component.userId = 'user-1';
      component.roomData = makeRoom({ ownerId: 'user-1' });
      expect(component.isADM()).toBeTrue();

      component.games = [makeGame({ id: 'game-1' }), makeGame({ id: 'game-2' })];
      component.showGameIndex = 0;
      component.addShowGameIndex();
      expect(component.showGameIndex).toBe(1);
      component.addShowGameIndex();
      expect(component.showGameIndex).toBe(1);

      component.lessShowGameIndex();
      expect(component.showGameIndex).toBe(0);
      component.lessShowGameIndex();
      expect(component.showGameIndex).toBe(0);

      const game = makeGame({
        gamePlayers: [makeGamePlayer({ user: makeUser({ id: 'user-2' }) })],
      });
      expect(component.getUserRole(game)).toBeNull();

      game.gamePlayers.push(makeGamePlayer({ id: 'gp-2', user: makeUser({ id: 'user-1' }) }));
      expect(component.getUserRole(game)?.user.id).toBe('user-1');

      component.games = [];
      expect(component.getLatestGame()).toBeNull();

      component.games = [makeGame({ id: 'game-3' })];
      expect(component.getLatestGame()?.id).toBe('game-3');
    });
  });
});
