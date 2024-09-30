import { inject, Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { Router } from '@angular/router';
import { Room, RoomStatus, User } from '../models/room';
import { UpdateRoomDTO } from '../models/update-room-dto';
import { HttpClient } from '@angular/common/http';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  API_URL = "http://192.168.0.130:8080"
  httpClient = inject(HttpClient)
  router = inject(Router)
  private stompClient: Client | null = null

  private roomDataSubject: BehaviorSubject<Room | null> = new BehaviorSubject<Room | null>(null)
  private usersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([])
  private gameSubject: BehaviorSubject<Game | null> = new BehaviorSubject<Game | null>(null)
  
  public roomData$ = this.roomDataSubject.asObservable()
  public users$ = this.usersSubject.asObservable()
  public game$ = this.gameSubject.asObservable()

  connect(room: string) {
    let username = localStorage.getItem('auth-username') ?? "";

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${this.API_URL}/ws`),
      // debug: (str) => console.log(str)
    })

    this.stompClient.onConnect = () => this.onConnect(room, username);

    this.stompClient.activate()
  }

  private onConnect(room: string, username: string) {
    this.stompClient?.subscribe(`/topic/${room}/roomData`, (message: IMessage) => {
      const data: Room = JSON.parse(message.body);
      this.roomDataSubject.next(data);
    });

    this.stompClient?.subscribe(`/user/queue/roomData`, (message: IMessage) => {
      const data: Room = JSON.parse(message.body);
      this.roomDataSubject.next(data);
    });

    this.stompClient?.subscribe(`/topic/${room}/users`, (message: IMessage) => {
      const data: User[] = JSON.parse(message.body);
      this.usersSubject.next(data);
    });

    this.stompClient?.subscribe(`/topic/${room}/gameData`, (message: IMessage) => {
      const data: Game = JSON.parse(message.body);
      this.gameSubject.next(data)
    });
    
    this.stompClient?.subscribe(`/user/queue/gameData`, (message: IMessage) => {
      const data: Game = JSON.parse(message.body);
      this.gameSubject.next(data)
    });

    this.stompClient?.subscribe("/user/queue/errors", (message: IMessage) => {
      let data: string = message.body;
      if (data) {
        alert(data);
      }
      this.stompClient?.deactivate();
      this.router.navigate(["home"]);
    });

    this.stompClient?.subscribe("/user/queue/warnings", (message: IMessage) => {
      let data: string = message.body;
      if (data) {
        alert(data);
      }
    });

    this.stompClient?.publish({
      destination: `/app/join/${room}`,
      body: username
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
    let room = this.roomDataSubject.value?.id
    if (this.stompClient && room) {
      this.stompClient.publish({
        destination: `/app/startGame/${room}`,
      })
    }
  }
  
  finishGame() {
    let room = this.roomDataSubject.value?.id
    if (this.stompClient && room) {
      this.stompClient.publish({
        destination: `/app/finishGame/${room}`,
      })
    }
  }

  leaveRoom() {
    let room = this.roomDataSubject.value?.id
    if (this.stompClient && room) {
      this.stompClient.deactivate()
      this.roomDataSubject.next(null)
    }
  }

  disconnect() {
    this.leaveRoom()
  }

  createRoom() {
    return this.httpClient.post<string>(`${this.API_URL}/room`, {})
  }
}
