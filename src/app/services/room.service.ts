import { inject, Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { Router } from '@angular/router';
import { Room, User } from '../models/room';
import { UpdateRoomDTO } from '../models/update-room-dto';
import { HttpClient } from '@angular/common/http';
import { Game } from '../models/game';
import { environment } from '../../environment/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  API_URL = environment.API_URL
  httpClient = inject(HttpClient)
  router = inject(Router)
  toast = inject(ToastrService)
  private stompClient: Client | null = null

  private isLoadingSub: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
  private roomDataSub: BehaviorSubject<Room | null> = new BehaviorSubject<Room | null>(null)
  private usersSub: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([])
  private gameSub: BehaviorSubject<Game | null> = new BehaviorSubject<Game | null>(null)
  private gamesListSub: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([])
  private countDownSub: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null)

  public isLoading$ = this.isLoadingSub.asObservable()
  public roomData$ = this.roomDataSub.asObservable()
  public users$ = this.usersSub.asObservable()
  public game$ = this.gameSub.asObservable()
  public gamesList$ = this.gamesListSub.asObservable()
  public countDown$ = this.countDownSub.asObservable()

  connect(room: string) {
    let username = localStorage.getItem('auth-username') ?? "";
    let token = localStorage.getItem('auth-token') ?? "";

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${this.API_URL}/ws`),
      reconnectDelay: 0,
      connectHeaders: {
        'Authorization': `Bearer ${token}`
      },
      onConnect: () => this.onConnect(room, username),
      // debug: (str) => console.log(str)
    })

    this.stompClient.activate()
  }

  private onConnect(room: string, username: string) {

    this.stompClient?.subscribe(`/topic/${room}.roomData`, (message: IMessage) => {
      const data: Room = JSON.parse(message.body)
      this.roomDataSub.next(data)
      this.isLoadingSub.next(false)
      sessionStorage.setItem("last-room", data.id)
    });

    this.stompClient?.subscribe(`/user/queue/roomData`, (message: IMessage) => {
      const data: Room = JSON.parse(message.body)
      this.roomDataSub.next(data)
      this.isLoadingSub.next(false)
      sessionStorage.setItem("last-room", data.id)
    });

    this.stompClient?.subscribe(`/topic/${room}.users`, (message: IMessage) => {
      const data: User[] = JSON.parse(message.body);
      this.usersSub.next(data);
    });

    this.stompClient?.subscribe(`/topic/${room}.gameData`, (message: IMessage) => {
      const data: Game = JSON.parse(message.body);
      this.gameSub.next(data)
    });

    this.stompClient?.subscribe(`/user/queue/gameData`, (message: IMessage) => {
      const data: Game = JSON.parse(message.body);
      this.gameSub.next(data)
    });

    this.stompClient?.subscribe(`/topic/${room}.gamesList`, (message: IMessage) => {
      const data: Game[] = JSON.parse(message.body);
      this.gamesListSub.next(data)
    });

    this.stompClient?.subscribe(`/topic/${room}.countdown`, (message: IMessage) => {
      let data: number | null;

      if (message.body === 'null') {
        data = null;
      } else {
        data = parseInt(message.body, 10);
      }

      this.countDownSub.next(data === 0 ? null : data)
    });

    this.stompClient?.subscribe(`/user/queue/gamesList`, (message: IMessage) => {
      const data: Game[] = JSON.parse(message.body);
      this.gamesListSub.next(data)
    });

    this.stompClient?.subscribe("/user/queue/errors", (message: IMessage) => {
      let data: string = message.body;
      this.stompClient?.deactivate();

      if (data) {
        this.router.navigate(["home"], {
          state: { errorMessage: data }
        })
      }

    });

    this.stompClient?.subscribe("/user/queue/warnings", (message: IMessage) => {
      this.isLoadingSub.next(false)
      let data: string = message.body;
      if (data) {
        this.toast.clear()
        this.toast.warning(data, '', {
          positionClass: 'toast-bottom-right'
        })
      }
    });

    this.stompClient?.publish({
      destination: `/app/join/${room}`,
    });
  }

  updateIncludeDefault() {
    let roomData = this.roomDataSub.value
    if (roomData) {
      let data = {
        includeDefaultGameEnvs: !roomData.includeDefaultGameEnvs,
        impostors: roomData.impostors,
        includeUserGameEnvs: roomData.includeUserGameEnvs,
      }
      this.updateRoomData(data)
    }
  }

  updateIncludeUser() {
    let roomData = this.roomDataSub.value
    if (roomData) {
      let data = {
        includeUserGameEnvs: !roomData.includeUserGameEnvs,
        impostors: roomData.impostors,
        includeDefaultGameEnvs: roomData.includeDefaultGameEnvs,
      }
      this.updateRoomData(data)
    }
  }

  updateImpostors() {
    let roomData = this.roomDataSub.value
    if (roomData) {
      let impostors: number = roomData.impostors
      let data = {
        impostors: impostors === 1 ? 2 : impostors === 2 ? 3 : 1,
        includeUserGameEnvs: roomData.includeUserGameEnvs,
        includeDefaultGameEnvs: roomData.includeDefaultGameEnvs,
      }
      this.updateRoomData(data)
    }
  }

  updateRoomData(data: UpdateRoomDTO) {
    let room = this.roomDataSub.value?.id
    if (this.stompClient && room) {
      this.stompClient.publish({
        destination: `/app/update/${room}`,
        body: JSON.stringify(data)
      })
    }
  }

  startGame() {
    this.isLoadingSub.next(true)
    this.toast.clear()
    let room = this.roomDataSub.value?.id
    if (this.stompClient && room) {
      this.stompClient.publish({
        destination: `/app/startGame/${room}`,
      })
    }
  }

  finishGame() {
    this.isLoadingSub.next(true)
    this.toast.clear()
    let room = this.roomDataSub.value?.id
    if (this.stompClient && room) {
      this.stompClient.publish({
        destination: `/app/finishGame/${room}`,
      })
    }
  }

  leaveRoom() {
    this.toast.clear()

    this.roomDataSub.next(null)
    this.usersSub.next([])
    this.gameSub.next(null)
    this.gamesListSub.next([])
    this.countDownSub.next(null)
    this.isLoadingSub.next(true)

    this.stompClient?.deactivate()
  }

  disconnect() {
    this.leaveRoom()
  }

  createRoom() {
    return this.httpClient.post<string>(`${this.API_URL}/room`, {})
  }
}
