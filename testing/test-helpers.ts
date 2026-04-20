import { BehaviorSubject } from 'rxjs';
import { Game, GamePlayer } from '../src/app/models/game';
import { GameEnv } from '../src/app/models/game-env';
import { PlayerRole } from '../src/app/models/player-role';
import { Room, RoomStatus, User } from '../src/app/models/room';

export function resetStorage() {
  localStorage.clear();
  sessionStorage.clear();
}

export function createRouterSpy() {
  return jasmine.createSpyObj('Router', ['navigate']);
}

export function createToastrSpy() {
  return jasmine.createSpyObj('ToastrService', ['clear', 'error', 'warning', 'success']);
}

export function createLocationSpy() {
  return jasmine.createSpyObj('Location', ['back']);
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    username: 'Alice',
    ...overrides,
  };
}

export function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-1',
    ownerId: 'user-1',
    status: RoomStatus.IDLE,
    impostors: 1,
    includeDefaultGameEnvs: true,
    includeUserGameEnvs: true,
    ...overrides,
  };
}

export function makeGameEnv(overrides: Partial<GameEnv> = {}) {
  return new GameEnv(overrides.id ?? 'env-1', overrides.name ?? 'Beach');
}

export function makePlayerRole(overrides: Partial<PlayerRole> = {}) {
  return new PlayerRole(overrides.id ?? 'role-1', overrides.name ?? 'Doctor');
}

export function makeGamePlayer(overrides: Partial<GamePlayer> = {}): GamePlayer {
  return {
    id: 'game-player-1',
    user: makeUser(),
    playerRole: makePlayerRole(),
    impostor: false,
    ...overrides,
  };
}

export function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: 'game-1',
    gameEnvironment: makeGameEnv(),
    gamePlayers: [makeGamePlayer()],
    ...overrides,
  };
}

export function createHttpError(status: number, message?: string) {
  return {
    status,
    error: message ? { message } : {},
  };
}

export class MockSocket {
  handlers = new Map<string, (data?: any) => void>();
  connect = jasmine.createSpy('connect');
  disconnect = jasmine.createSpy('disconnect');
  emit = jasmine.createSpy('emit');
  removeAllListeners = jasmine.createSpy('removeAllListeners');
  on = jasmine.createSpy('on').and.callFake((event: string, handler: (data?: any) => void) => {
    this.handlers.set(event, handler);
    return this;
  });

  trigger(event: string, data?: any) {
    this.handlers.get(event)?.(data);
  }
}

export class MockStompClient {
  config: any;
  subscriptions = new Map<string, (message: { body: string }) => void>();
  activate = jasmine.createSpy('activate');
  deactivate = jasmine.createSpy('deactivate');
  publish = jasmine.createSpy('publish');
  subscribe = jasmine.createSpy('subscribe').and.callFake((destination: string, handler: (message: { body: string }) => void) => {
    this.subscriptions.set(destination, handler);
    return { unsubscribe() {} };
  });

  trigger(destination: string, body: string) {
    this.subscriptions.get(destination)?.({ body });
  }
}

export class MockSocketService {
  users$ = new BehaviorSubject<User[]>([]);
  roomData$ = new BehaviorSubject<Room | null>(null);
  games$ = new BehaviorSubject<Game[]>([]);
  countDown$ = new BehaviorSubject<string | null>(null);
  isLoading$ = new BehaviorSubject<boolean>(true);

  joinRoom = jasmine.createSpy('joinRoom');
  leaveRoom = jasmine.createSpy('leaveRoom');
  startGame = jasmine.createSpy('startGame');
  finishGame = jasmine.createSpy('finishGame');
  updateIncludeDefault = jasmine.createSpy('updateIncludeDefault');
  updateIncludeUser = jasmine.createSpy('updateIncludeUser');
  updateImpostors = jasmine.createSpy('updateImpostors');
}
