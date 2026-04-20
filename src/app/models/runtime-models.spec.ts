import '../../polyfills';
import { CreateLocalGame } from './create-local-game';
import { GameEnv } from './game-env';
import { LocalGame, GamePlayerRole } from './local-game';
import { PlayerRole } from './player-role';
import { RoomStatus } from './room';
import { SocketConst } from '../utils/SocketConst';

describe('runtime models', () => {
  it('sets the global window reference in polyfills', () => {
    expect((window as any).global).toBe(window);
  });

  it('creates model instances with the provided values', () => {
    const createLocalGame = new CreateLocalGame(['alice', 'bob'], 1, true, false);
    const gameEnv = new GameEnv('env-1', 'Beach');
    const playerRole = new PlayerRole('role-1', 'Doctor');
    const localGame = new LocalGame('Beach', [new GamePlayerRole('Alice', 'Doctor')]);

    expect(createLocalGame.players).toEqual(['alice', 'bob']);
    expect(createLocalGame.includeDefaultGameEnvs).toBeFalse();
    expect(gameEnv.id).toBe('env-1');
    expect(playerRole.name).toBe('Doctor');
    expect(localGame.gameEnv).toBe('Beach');
    expect(localGame.playerRoles[0].profession).toBe('Doctor');
  });

  it('exposes runtime enums and socket constants', () => {
    expect(RoomStatus.IDLE).toBe('IDLE');
    expect(RoomStatus.PLAYING).toBe('PLAYING');

    expect(SocketConst.CONNECT).toBe('connect');
    expect(SocketConst.DISCONNECT).toBe('disconnect');
    expect(SocketConst.JOIN_ROOM).toBe('joinRoom');
    expect(SocketConst.ERROR).toBe('error');
    expect(SocketConst.WARNING).toBe('warning');
    expect(SocketConst.USERS).toBe('users');
    expect(SocketConst.GAMES).toBe('games');
    expect(SocketConst.ROOM_DATA).toBe('roomData');
    expect(SocketConst.SET_ROOM_DATA).toBe('setRoomData');
    expect(SocketConst.START_GAME).toBe('startGame');
    expect(SocketConst.FINISH_GAME).toBe('finishGame');
    expect(SocketConst.NEW_GAME).toBe('newGame');
    expect(SocketConst.COUNT_DOWN).toBe('countDown');
  });
});
