import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Room, User } from '../models/room';
import { ToastrService } from 'ngx-toastr';
import { Game } from '../models/game';
import { SocketConst } from '../utils/SocketConst';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  router = inject(Router);
  toast = inject(ToastrService);
  private socket: Socket;

  private roomDataSub: BehaviorSubject<Room | null> = new BehaviorSubject<Room | null>(null);
  public roomData$ = this.roomDataSub.asObservable();

  private usersSub: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSub.asObservable();;

  private gamesSub: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([]);
  public games$ = this.gamesSub.asObservable();

  private countDownSub: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public countDown$ = this.countDownSub.asObservable();

  private isLoadingSub: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public isLoading$ = this.isLoadingSub.asObservable();

  constructor() {
    this.socket = io(environment.SOCKET_URL, { autoConnect: false });
  }

  joinRoom(roomId: string) {
    var token = localStorage.getItem("auth-token");

    this.socket.connect();

    this.socket.on(SocketConst.CONNECT, () => {
      this.socket.emit(SocketConst.JOIN_ROOM, {
        token: token,
        roomId: roomId
      });
    });

    this.socket.on(SocketConst.ERROR, (data) => {
      this.toast.error(data);
    });

    this.socket.on(SocketConst.WARNING, (data) => {
      this.toast.warning(data);
      this.isLoadingSub.next(false);
    });

    this.socket.on(SocketConst.USERS, (data: User[]) => {
      this.usersSub.next(data);
    });

    this.socket.on(SocketConst.ROOM_DATA, (data: Room) => {
      this.roomDataSub.next(data);
      this.isLoadingSub.next(false);

      sessionStorage.setItem("last-room", data.id)
    });

    this.socket.on(SocketConst.GAMES, (data: Game[]) => {
      this.gamesSub.next(data);
    });

    this.socket.on(SocketConst.COUNT_DOWN, (data: string) => {
      this.countDownSub.next(data);
    });

    this.socket.on(SocketConst.NEW_GAME, (data: Game) => {
      const currentGames = this.gamesSub.getValue();
      this.gamesSub.next([...currentGames, data]);
    });

    this.socket.on(SocketConst.DISCONNECT, () => {
      this.disconnect();
      this.router.navigate(["home"])
    });
  }

  disconnect() {
    this.isLoadingSub.next(true);
    this.roomDataSub.next(null);
    this.usersSub.next([]);
    this.gamesSub.next([]);
    this.countDownSub.next(null);
  }

  leaveRoom() {
    this.toast.clear();

    this.disconnect();

    this.socket.removeAllListeners();
    this.socket.disconnect();
  }

  startGame() {
    var roomData = this.roomDataSub.value;
    if(roomData){
      var usersSize = this.usersSub.value.length;
      var impostors = roomData.impostors;
      if (usersSize < 3 || impostors >= Math.ceil(usersSize / 2)) {
        this.toast.warning("Impostores devem ser minoria.");
        return;
      }
      
      if(!roomData.includeDefaultGameEnvs && ! roomData.includeUserGameEnvs){
        this.toast.warning("Selecione pelo menos um tipo de ambiente.");
        return;
      }
    }
    this.isLoadingSub.next(true);
    this.socket.emit(SocketConst.START_GAME, {});
  }

  finishGame() {
    this.isLoadingSub.next(true);
    this.socket.emit(SocketConst.FINISH_GAME, {});
  }

  updateRoomData(data: UpdateRoomData) {
    this.socket.emit(SocketConst.SET_ROOM_DATA, {
      includeDefaultGameEnvs: data.includeDefaultGameEnvs,
      includeUserGameEnvs: data.includeUserGameEnvs,
      impostors: data.impostors,
    })
  }

  updateIncludeDefault() {
    let roomData = this.roomDataSub.value
    if (roomData) {
      this.updateRoomData({
        includeDefaultGameEnvs: !roomData.includeDefaultGameEnvs,
        impostors: roomData.impostors,
        includeUserGameEnvs: roomData.includeUserGameEnvs,
      })
    }
  }

  updateIncludeUser() {
    let roomData = this.roomDataSub.value
    if (roomData) {
      this.updateRoomData({
        includeUserGameEnvs: !roomData.includeUserGameEnvs,
        impostors: roomData.impostors,
        includeDefaultGameEnvs: roomData.includeDefaultGameEnvs,
      })
    }
  }

  updateImpostors() {
    let roomData = this.roomDataSub.value
    if (roomData) {
      let impostors: number = roomData.impostors
      this.updateRoomData({
        impostors: impostors === 1 ? 2 : impostors === 2 ? 3 : 1,
        includeUserGameEnvs: roomData.includeUserGameEnvs,
        includeDefaultGameEnvs: roomData.includeDefaultGameEnvs,
      })
    }
  }
}

interface UpdateRoomData {
  includeDefaultGameEnvs: boolean
  includeUserGameEnvs: boolean
  impostors: number
}
