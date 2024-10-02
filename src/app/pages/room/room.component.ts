import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { FormsModule } from '@angular/forms';
import { Room, User } from '../../models/room';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { Game, GamePlayer } from '../../models/game';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [FormsModule, CommonModule, BackButtonComponent, MatIconModule],
  templateUrl: './room.component.html',
})
export class RoomComponent implements OnInit, OnDestroy {
  router = inject(Router)
  activatedRoute = inject(ActivatedRoute)
  roomService = inject(RoomService)

  private subs: Subscription = new Subscription()

  roomData: Room | null = null
  users: User[] = []
  game: Game | null = null
  gamesList: Game[] = []
  userGamePlayer: GamePlayer | null = null
  countDown: number | null = null

  userId: string = ""
  username: string = ""

  ngOnInit() {
    let room = this.activatedRoute.snapshot.params["id"]
    this.userId = localStorage.getItem('auth-id') || ""
    this.username = localStorage.getItem('auth-username') || ""

    if (room) {
      this.roomService.connect(room)

      this.subs.add(
        this.roomService.countDown$.subscribe(data => {
          this.countDown = data
        })
      )

      this.subs.add(
        this.roomService.roomData$.subscribe(data => {
          this.roomData = data
        })
      )

      this.subs.add(
        this.roomService.users$.subscribe(data => {
          this.users = data
        }))

      this.subs.add(
        this.roomService.game$.subscribe(data => {
          this.game = data
          this.userGamePlayer = this.getUserRole()
        })
      )

      this.subs.add(
        this.roomService.gamesList$.subscribe(data => {
          this.gamesList = data
        })
      )
    } else {
      this.router.navigate(['home'])
    }

    window.addEventListener("beforeunload", this.beforeUnloadHandler.bind(this))
  }

  //TODO: comparar pelo ID
  isADM() {
    return this.username === this.roomData?.owner.username
  }

  //TODO: comparar pelo ID
  isMe(username: string) {
    return this.username === username
  }

  //TODO: comparar pelo ID
  getUserRole(): GamePlayer | null {
    if (this.game) {
      let index = this.game.gamePlayers.findIndex(el => el.user.username == this.username)
      if (index == -1) {
        return null
      }
      return this.game.gamePlayers[index]
    }
    return null
  }

  ngOnDestroy() {
    this.roomService.disconnect();
    this.subs.unsubscribe()
    window.removeEventListener('beforeunload', this.beforeUnloadHandler.bind(this));
  }

  private beforeUnloadHandler(event: any): void {
    this.roomService.disconnect();
  }
}
