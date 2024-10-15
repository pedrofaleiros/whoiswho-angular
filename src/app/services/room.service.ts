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

  private roomDataSubject: BehaviorSubject<Room | null> = new BehaviorSubject<Room | null>(null)
  private usersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([])
  private gameSubject: BehaviorSubject<Game | null> = new BehaviorSubject<Game | null>(null)
  private gamesListSubject: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([])
  private countDownSubject: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null)

  public roomData$ = this.roomDataSubject.asObservable()
  public users$ = this.usersSubject.asObservable()
  public game$ = this.gameSubject.asObservable()
  public gamesList$ = this.gamesListSubject.asObservable()
  public countDown$ = this.countDownSubject.asObservable()

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
      const data: Room = JSON.parse(message.body);
      this.roomDataSubject.next(data);
    });

    this.stompClient?.subscribe(`/user/queue/roomData`, (message: IMessage) => {
      const data: Room = JSON.parse(message.body);
      this.roomDataSubject.next(data);
    });

    this.stompClient?.subscribe(`/topic/${room}.users`, (message: IMessage) => {
      const data: User[] = JSON.parse(message.body);
      this.usersSubject.next(data);
    });

    this.stompClient?.subscribe(`/topic/${room}.gameData`, (message: IMessage) => {
      const data: Game = JSON.parse(message.body);
      this.gameSubject.next(data)
    });

    this.stompClient?.subscribe(`/user/queue/gameData`, (message: IMessage) => {
      const data: Game = JSON.parse(message.body);
      this.gameSubject.next(data)
    });

    this.stompClient?.subscribe(`/topic/${room}.gamesList`, (message: IMessage) => {
      const data: Game[] = JSON.parse(message.body);
      this.gamesListSubject.next(data)
    });

    this.stompClient?.subscribe(`/topic/${room}.countdown`, (message: IMessage) => {
      let data: number | null;

      if (message.body === 'null') {
        data = null;
      } else {
        data = parseInt(message.body, 10);
      }

      this.countDownSubject.next(data === 0 ? null : data)
    });

    this.stompClient?.subscribe(`/user/queue/gamesList`, (message: IMessage) => {
      const data: Game[] = JSON.parse(message.body);
      this.gamesListSubject.next(data)
    });

    this.stompClient?.subscribe("/user/queue/errors", (message: IMessage) => {
      let data: string = message.body;
      
      this.stompClient?.deactivate();
      // this.router.navigate(["home"]);
      
      if (data) {
        this.toast.clear()
        this.toast.error(data)
      }

    });

    this.stompClient?.subscribe("/user/queue/warnings", (message: IMessage) => {
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
    let roomData = this.roomDataSubject.value
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
    let roomData = this.roomDataSubject.value
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
    let roomData = this.roomDataSubject.value
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
    let room = this.roomDataSubject.value?.id
    if (this.stompClient && room) {
      this.stompClient.publish({
        destination: `/app/update/${room}`,
        body: JSON.stringify(data)
      })
    }
  }

  startGame() {
    this.toast.clear()
    let room = this.roomDataSubject.value?.id
    if (this.stompClient && room) {
      this.stompClient.publish({
        destination: `/app/startGame/${room}`,
      })
    }
  }

  finishGame() {
    this.toast.clear()
    let room = this.roomDataSubject.value?.id
    if (this.stompClient && room) {
      this.stompClient.publish({
        destination: `/app/finishGame/${room}`,
      })
    }
  }

  leaveRoom() {
    this.toast.clear()

    this.roomDataSubject.next(null)
    this.usersSubject.next([])
    this.gameSubject.next(null)
    this.gamesListSubject.next([])
    this.countDownSubject.next(null)

    this.stompClient?.deactivate()
  }

  disconnect() {
    this.leaveRoom()
  }

  createRoom() {
    return this.httpClient.post<string>(`${this.API_URL}/room`, {})
  }
}
