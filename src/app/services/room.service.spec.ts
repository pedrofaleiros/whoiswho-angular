import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ToastrService } from 'ngx-toastr';
import * as roomServiceModule from './room.service';
import { environment } from '../../environment/environment';
import {
  MockStompClient,
  createRouterSpy,
  createToastrSpy,
  makeGame,
  makeRoom,
  makeUser,
  resetStorage,
} from '../../../testing/test-helpers';

describe('RoomService', () => {
  let service: roomServiceModule.RoomService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let toast: jasmine.SpyObj<ToastrService>;
  let mockClient: MockStompClient;

  beforeEach(() => {
    resetStorage();
    router = createRouterSpy();
    toast = createToastrSpy();
    mockClient = new MockStompClient();

    spyOn(roomServiceModule.roomServiceFactory, 'createSockJsClient').and.returnValue({} as any);
    spyOn(roomServiceModule.roomServiceFactory, 'createStompClient').and.callFake((config: any) => {
      mockClient.config = config;
      return mockClient as any;
    });

    TestBed.configureTestingModule({
      providers: [
        roomServiceModule.RoomService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: toast },
      ],
    });

    service = TestBed.inject(roomServiceModule.RoomService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    resetStorage();
  });

  it('connects using stored auth data and activates the stomp client', () => {
    localStorage.setItem('auth-token', 'token-1');
    localStorage.setItem('auth-username', 'alice');
    spyOn<any>(service as any, 'onConnect');

    service.connect('room-1');

    expect(roomServiceModule.roomServiceFactory.createStompClient).toHaveBeenCalled();
    expect(mockClient.config.connectHeaders.Authorization).toBe('Bearer token-1');
    mockClient.config.webSocketFactory();
    expect(roomServiceModule.roomServiceFactory.createSockJsClient).toHaveBeenCalledWith(`${environment.API_URL}/ws`);
    expect(mockClient.activate).toHaveBeenCalled();
    mockClient.config.onConnect();
    expect((service as any).onConnect).toHaveBeenCalledWith('room-1', 'alice');
  });

  it('connects with empty auth fallbacks when storage is empty', () => {
    spyOn<any>(service as any, 'onConnect');

    service.connect('room-2');

    expect(mockClient.config.connectHeaders.Authorization).toBe('Bearer ');
    mockClient.config.onConnect();
    expect((service as any).onConnect).toHaveBeenCalledWith('room-2', '');
  });

  it('creates concrete SockJS and STOMP clients through the exported helpers', () => {
    (roomServiceModule.roomServiceFactory.createSockJsClient as jasmine.Spy).and.callThrough();
    (roomServiceModule.roomServiceFactory.createStompClient as jasmine.Spy).and.callThrough();

    const sockJs = roomServiceModule.roomServiceFactory.createSockJsClient('http://example.com/ws');
    const stompClient = roomServiceModule.roomServiceFactory.createStompClient({
      webSocketFactory: () => ({}) as any,
    });

    expect(sockJs).toBeTruthy();
    expect(stompClient).toBeTruthy();
  });

  it('subscribes to room channels and updates state on messages', () => {
    const firstRoom = makeRoom({ id: 'room-1' });
    const secondRoom = makeRoom({ id: 'room-2' });
    const users = [makeUser(), makeUser({ id: 'user-2', username: 'Bob' })];
    const game = makeGame();
    const gameList = [makeGame({ id: 'game-1' }), makeGame({ id: 'game-2' })];

    service.stompClient = mockClient as any;

    (service as any).onConnect('room-1', 'alice');

    expect(mockClient.publish).toHaveBeenCalledWith({
      destination: '/app/join/room-1',
    });

    mockClient.trigger('/topic/room-1.roomData', JSON.stringify(firstRoom));
    expect((service as any).roomDataSub.value).toEqual(firstRoom);
    expect((service as any).isLoadingSub.value).toBeFalse();
    expect(sessionStorage.getItem('last-room')).toBe('room-1');

    mockClient.trigger('/user/queue/roomData', JSON.stringify(secondRoom));
    expect((service as any).roomDataSub.value).toEqual(secondRoom);
    expect(sessionStorage.getItem('last-room')).toBe('room-2');

    mockClient.trigger('/topic/room-1.users', JSON.stringify(users));
    expect((service as any).usersSub.value).toEqual(users);

    mockClient.trigger('/topic/room-1.gameData', JSON.stringify(game));
    expect((service as any).gameSub.value).toEqual(jasmine.objectContaining({
      id: game.id,
      gameEnvironment: jasmine.objectContaining({
        id: game.gameEnvironment.id,
        name: game.gameEnvironment.name,
      }),
      gamePlayers: jasmine.arrayContaining([
        jasmine.objectContaining({
          id: game.gamePlayers[0].id,
          impostor: game.gamePlayers[0].impostor,
          user: jasmine.objectContaining({
            id: game.gamePlayers[0].user.id,
            username: game.gamePlayers[0].user.username,
          }),
          playerRole: jasmine.objectContaining({
            id: game.gamePlayers[0].playerRole?.id,
            name: game.gamePlayers[0].playerRole?.name,
          }),
        }),
      ]),
    }));

    const userGame = makeGame({ id: 'game-3' });
    mockClient.trigger('/user/queue/gameData', JSON.stringify(userGame));
    expect((service as any).gameSub.value).toEqual(jasmine.objectContaining({
      id: userGame.id,
      gameEnvironment: jasmine.objectContaining({
        id: userGame.gameEnvironment.id,
        name: userGame.gameEnvironment.name,
      }),
    }));

    mockClient.trigger('/topic/room-1.gamesList', JSON.stringify(gameList));
    expect((service as any).gamesListSub.value).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ id: gameList[0].id }),
      jasmine.objectContaining({ id: gameList[1].id }),
    ]));

    const userGames = [makeGame({ id: 'game-4' })];
    mockClient.trigger('/user/queue/gamesList', JSON.stringify(userGames));
    expect((service as any).gamesListSub.value).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ id: userGames[0].id }),
    ]));

    mockClient.trigger('/topic/room-1.countdown', 'null');
    expect((service as any).countDownSub.value).toBeNull();

    mockClient.trigger('/topic/room-1.countdown', '0');
    expect((service as any).countDownSub.value).toBeNull();

    mockClient.trigger('/topic/room-1.countdown', '5');
    expect((service as any).countDownSub.value).toBe(5);
  });

  it('handles error and warning channels', () => {
    service.stompClient = mockClient as any;

    (service as any).onConnect('room-1', 'alice');

    mockClient.trigger('/user/queue/errors', 'room unavailable');
    expect(mockClient.deactivate).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['home'], {
      state: { errorMessage: 'room unavailable' },
    });

    mockClient.trigger('/user/queue/errors', '');
    expect(router.navigate).toHaveBeenCalledTimes(1);

    mockClient.trigger('/user/queue/warnings', 'careful');
    expect((service as any).isLoadingSub.value).toBeFalse();
    expect(toast.clear).toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalledWith('careful', '', {
      positionClass: 'toast-bottom-right',
    });

    mockClient.trigger('/user/queue/warnings', '');
    expect(toast.warning).toHaveBeenCalledTimes(1);
  });

  it('updates room flags and impostor count only when room data exists', () => {
    spyOn(service, 'updateRoomData');

    service.updateIncludeDefault();
    service.updateIncludeUser();
    service.updateImpostors();
    expect(service.updateRoomData).not.toHaveBeenCalled();

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

  it('publishes room updates only when both room and client exist', () => {
    service.updateRoomData({
      includeDefaultGameEnvs: true,
      includeUserGameEnvs: true,
      impostors: 1,
    });
    expect(mockClient.publish).not.toHaveBeenCalled();

    service.stompClient = mockClient as any;
    service.updateRoomData({
      includeDefaultGameEnvs: true,
      includeUserGameEnvs: true,
      impostors: 1,
    });
    expect(mockClient.publish).not.toHaveBeenCalled();

    (service as any).roomDataSub.next(makeRoom({ id: 'room-9' }));
    service.updateRoomData({
      includeDefaultGameEnvs: false,
      includeUserGameEnvs: true,
      impostors: 2,
    });

    expect(mockClient.publish).toHaveBeenCalledWith({
      destination: '/app/update/room-9',
      body: JSON.stringify({
        includeDefaultGameEnvs: false,
        includeUserGameEnvs: true,
        impostors: 2,
      }),
    });
  });

  it('starts and finishes games while always clearing loading state and toast', () => {
    service.startGame();
    service.finishGame();
    expect((service as any).isLoadingSub.value).toBeTrue();
    expect(toast.clear).toHaveBeenCalledTimes(2);
    expect(mockClient.publish).not.toHaveBeenCalled();

    service.stompClient = mockClient as any;
    (service as any).roomDataSub.next(makeRoom({ id: 'room-10' }));

    service.startGame();
    service.finishGame();

    expect(mockClient.publish).toHaveBeenCalledWith({
      destination: '/app/startGame/room-10',
    });
    expect(mockClient.publish).toHaveBeenCalledWith({
      destination: '/app/finishGame/room-10',
    });
  });

  it('resets subjects and disconnects on leaveRoom and disconnect', () => {
    service.stompClient = mockClient as any;
    (service as any).roomDataSub.next(makeRoom());
    (service as any).usersSub.next([makeUser()]);
    (service as any).gameSub.next(makeGame());
    (service as any).gamesListSub.next([makeGame()]);
    (service as any).countDownSub.next(3);
    (service as any).isLoadingSub.next(false);

    service.leaveRoom();

    expect(toast.clear).toHaveBeenCalled();
    expect((service as any).roomDataSub.value).toBeNull();
    expect((service as any).usersSub.value).toEqual([]);
    expect((service as any).gameSub.value).toBeNull();
    expect((service as any).gamesListSub.value).toEqual([]);
    expect((service as any).countDownSub.value).toBeNull();
    expect((service as any).isLoadingSub.value).toBeTrue();
    expect(mockClient.deactivate).toHaveBeenCalled();

    spyOn(service, 'leaveRoom');
    service.disconnect();
    expect(service.leaveRoom).toHaveBeenCalled();
  });

  it('creates a room via http', () => {
    let result: string | undefined;

    service.createRoom().subscribe((value) => {
      result = value;
    });

    const request = httpMock.expectOne(`${environment.API_URL}/room`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush('12345');

    expect(result).toBe('12345');
  });
});
