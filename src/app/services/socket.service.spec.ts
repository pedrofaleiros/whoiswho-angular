import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import * as socketServiceModule from './socket.service';
import { SocketConst } from '../utils/SocketConst';
import { environment } from '../../environment/environment';
import {
  MockSocket,
  createRouterSpy,
  createToastrSpy,
  makeGame,
  makeRoom,
  makeUser,
  resetStorage,
} from '../../../testing/test-helpers';

describe('SocketService', () => {
  let service: socketServiceModule.SocketService;
  let router: jasmine.SpyObj<Router>;
  let toast: jasmine.SpyObj<ToastrService>;
  let mockSocket: MockSocket;

  beforeEach(() => {
    resetStorage();
    router = createRouterSpy();
    toast = createToastrSpy();
    mockSocket = new MockSocket();

    spyOn(socketServiceModule.socketServiceFactory, 'createSocketConnection').and.returnValue(mockSocket as any);

    TestBed.configureTestingModule({
      providers: [
        socketServiceModule.SocketService,
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: toast },
      ],
    });

    service = TestBed.inject(socketServiceModule.SocketService);
  });

  afterEach(() => {
    resetStorage();
  });

  it('creates the socket connection in the constructor', () => {
    expect(socketServiceModule.socketServiceFactory.createSocketConnection).toHaveBeenCalledWith(environment.SOCKET_URL);
  });

  it('creates a concrete socket connection through the exported helper', () => {
    (socketServiceModule.socketServiceFactory.createSocketConnection as jasmine.Spy).and.callThrough();

    const socket = socketServiceModule.socketServiceFactory.createSocketConnection('http://example.com');
    socket.disconnect();

    expect(socket).toBeTruthy();
  });

  it('joins a room and handles all socket events', () => {
    const room = makeRoom();
    const users = [makeUser(), makeUser({ id: 'user-2', username: 'Bob' })];
    const game = makeGame();

    localStorage.setItem('auth-token', 'token-1');

    service.joinRoom('room-1');

    expect(mockSocket.connect).toHaveBeenCalled();

    mockSocket.trigger(SocketConst.CONNECT);
    expect(mockSocket.emit).toHaveBeenCalledWith(SocketConst.JOIN_ROOM, {
      token: 'token-1',
      roomId: 'room-1',
    });

    mockSocket.trigger(SocketConst.ERROR, 'error message');
    expect(toast.error).toHaveBeenCalledWith('error message');

    mockSocket.trigger(SocketConst.WARNING, 'warning message');
    expect(toast.warning).toHaveBeenCalledWith('warning message');
    expect((service as any).isLoadingSub.value).toBeFalse();

    mockSocket.trigger(SocketConst.USERS, users);
    expect((service as any).usersSub.value).toEqual(users);

    mockSocket.trigger(SocketConst.ROOM_DATA, room);
    expect((service as any).roomDataSub.value).toEqual(room);
    expect(sessionStorage.getItem('last-room')).toBe(room.id);

    mockSocket.trigger(SocketConst.GAMES, [game]);
    expect((service as any).gamesSub.value).toEqual([game]);

    mockSocket.trigger(SocketConst.COUNT_DOWN, '3');
    expect((service as any).countDownSub.value).toBe('3');

    mockSocket.trigger(SocketConst.NEW_GAME, makeGame({ id: 'game-2' }));
    expect((service as any).gamesSub.value.length).toBe(2);

    spyOn(service, 'disconnect').and.callThrough();
    mockSocket.trigger(SocketConst.DISCONNECT);
    expect(service.disconnect).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['home']);
  });

  it('resets state on disconnect and leaveRoom', () => {
    (service as any).roomDataSub.next(makeRoom());
    (service as any).usersSub.next([makeUser()]);
    (service as any).gamesSub.next([makeGame()]);
    (service as any).countDownSub.next('5');
    (service as any).isLoadingSub.next(false);

    service.disconnect();

    expect((service as any).roomDataSub.value).toBeNull();
    expect((service as any).usersSub.value).toEqual([]);
    expect((service as any).gamesSub.value).toEqual([]);
    expect((service as any).countDownSub.value).toBeNull();
    expect((service as any).isLoadingSub.value).toBeTrue();

    spyOn(service, 'disconnect').and.callThrough();
    service.leaveRoom();
    expect(service.disconnect).toHaveBeenCalled();
    expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('prevents starting the game when impostors are not a minority', () => {
    (service as any).roomDataSub.next(makeRoom({ impostors: 2 }));
    (service as any).usersSub.next([makeUser(), makeUser({ id: 'u2' }), makeUser({ id: 'u3' })]);

    service.startGame();

    expect(toast.warning).toHaveBeenCalledWith('Impostores devem ser minoria.');
    expect(mockSocket.emit).not.toHaveBeenCalledWith(SocketConst.START_GAME, {});
  });

  it('prevents starting the game when no environment type is selected', () => {
    (service as any).roomDataSub.next(makeRoom({
      includeDefaultGameEnvs: false,
      includeUserGameEnvs: false,
    }));
    (service as any).usersSub.next([
      makeUser(),
      makeUser({ id: 'u2' }),
      makeUser({ id: 'u3' }),
      makeUser({ id: 'u4' }),
    ]);

    service.startGame();

    expect(toast.warning).toHaveBeenCalledWith('Selecione pelo menos um tipo de ambiente.');
    expect(mockSocket.emit).not.toHaveBeenCalledWith(SocketConst.START_GAME, {});
  });

  it('starts and finishes the game when the room configuration is valid', () => {
    (service as any).roomDataSub.next(makeRoom({ impostors: 1 }));
    (service as any).usersSub.next([
      makeUser(),
      makeUser({ id: 'u2' }),
      makeUser({ id: 'u3' }),
    ]);

    service.startGame();
    service.finishGame();

    expect((service as any).isLoadingSub.value).toBeTrue();
    expect(mockSocket.emit).toHaveBeenCalledWith(SocketConst.START_GAME, {});
    expect(mockSocket.emit).toHaveBeenCalledWith(SocketConst.FINISH_GAME, {});
  });

  it('starts the game even without room data because there is no guard for that path', () => {
    service.startGame();

    expect((service as any).isLoadingSub.value).toBeTrue();
    expect(mockSocket.emit).toHaveBeenCalledWith(SocketConst.START_GAME, {});
  });

  it('updates room data directly and through toggle helpers', () => {
    service.updateRoomData({
      includeDefaultGameEnvs: false,
      includeUserGameEnvs: true,
      impostors: 2,
    });
    expect(mockSocket.emit).toHaveBeenCalledWith(SocketConst.SET_ROOM_DATA, {
      includeDefaultGameEnvs: false,
      includeUserGameEnvs: true,
      impostors: 2,
    });

    spyOn(service, 'updateRoomData').and.callThrough();

    service.updateIncludeDefault();
    service.updateIncludeUser();
    service.updateImpostors();
    expect(service.updateRoomData).toHaveBeenCalledTimes(0);

    (service as any).roomDataSub.next(makeRoom({
      includeDefaultGameEnvs: true,
      includeUserGameEnvs: false,
      impostors: 1,
    }));

    service.updateIncludeDefault();
    expect(service.updateRoomData).toHaveBeenCalledWith({
      includeDefaultGameEnvs: false,
      includeUserGameEnvs: false,
      impostors: 1,
    });

    service.updateIncludeUser();
    expect(service.updateRoomData).toHaveBeenCalledWith({
      includeDefaultGameEnvs: true,
      includeUserGameEnvs: true,
      impostors: 1,
    });

    service.updateImpostors();
    expect(service.updateRoomData).toHaveBeenCalledWith({
      includeDefaultGameEnvs: true,
      includeUserGameEnvs: false,
      impostors: 2,
    });

    (service as any).roomDataSub.next(makeRoom({ impostors: 2 }));
    service.updateImpostors();
    expect(service.updateRoomData).toHaveBeenCalledWith({
      includeDefaultGameEnvs: true,
      includeUserGameEnvs: true,
      impostors: 3,
    });

    (service as any).roomDataSub.next(makeRoom({ impostors: 3 }));
    service.updateImpostors();
    expect(service.updateRoomData).toHaveBeenCalledWith({
      includeDefaultGameEnvs: true,
      includeUserGameEnvs: true,
      impostors: 1,
    });
  });
});
