import { inject, Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { Router } from '@angular/router';
import { Room } from '../models/room';
import { UpdateRoomDTO } from '../models/update-room-dto';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  router = inject(Router)
  private stompClient: Client | null = null

  private roomDataSubject: BehaviorSubject<Room | null> = new BehaviorSubject<Room | null>(null)
  public roomData$ = this.roomDataSubject.asObservable()

  private room: string = ''

  connect(room: string) {
    this.room = room
    let username = localStorage.getItem('auth-username') ?? "";

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS("http://192.168.0.130:8080/ws"),
      // debug: (str) => console.log(str)
    })

    this.stompClient.onConnect = () => {

      this.stompClient?.subscribe(`/topic/${room}/roomData`, (message: IMessage) => {
        const data: Room = JSON.parse(message.body)
        this.roomDataSubject.next(data)
      })

      this.stompClient?.subscribe("/user/queue/errors", (message: IMessage) => {
        let data: string = message.body
        if (data) {
          this.stompClient?.deactivate()
          this.router.navigate(["home"])
          alert(data)
        }
      })

      this.stompClient?.subscribe("/user/queue/warnings", (message: IMessage) => {
        let data: string = message.body
        if (data) {
          alert(data)
        }
      })

      this.stompClient?.publish({
        destination: `/app/join/${room}`,
        body: username
      })
    }

    this.stompClient.activate()
  }

  updateIncludeDefault() {
    if (this.roomDataSubject.value != null) {
      let data = {
        includeDefaultGameEnvs: !this.roomDataSubject.value?.includeDefaultGameEnvs,
        impostors: this.roomDataSubject.value?.impostors,
        includeUserGameEnvs: this.roomDataSubject.value?.includeUserGameEnvs,
      }
      this.updateRoomData(data)
    }
  }

  updateIncludeUser() {
    if (this.roomDataSubject.value != null) {
      let data = {
        includeUserGameEnvs: !this.roomDataSubject.value?.includeUserGameEnvs,
        impostors: this.roomDataSubject.value?.impostors,
        includeDefaultGameEnvs: this.roomDataSubject.value?.includeDefaultGameEnvs,
      }
      this.updateRoomData(data)
    }
  }

  updateImpostors() {
    if (this.roomDataSubject.value != null) {
      let impostors: number = this.roomDataSubject.value?.impostors
      let data = {
        impostors: impostors === 1 ? 2 : impostors === 2 ? 3 : 1,
        includeUserGameEnvs: this.roomDataSubject.value?.includeUserGameEnvs,
        includeDefaultGameEnvs: this.roomDataSubject.value?.includeDefaultGameEnvs,
      }
      this.updateRoomData(data)
    }
  }

  updateRoomData(data: UpdateRoomDTO) {
    if (this.stompClient && this.room) {
      this.stompClient.publish({
        destination: `/app/update/${this.room}`,
        body: JSON.stringify(data)
      })
    }
  }

  leaveRoom() {
    if (this.stompClient && this.room) {
      this.stompClient.deactivate()
      console.log('disconnected')
      this.room = ""
    }
  }

  disconnect() {
    this.leaveRoom()
  }
}
