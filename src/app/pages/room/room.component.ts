import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { FormsModule } from '@angular/forms';
import { Room, User } from '../../models/room';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { Game, GamePlayer } from '../../models/game';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [FormsModule, CommonModule, BackButtonComponent],
  templateUrl: './room.component.html',
})
export class RoomComponent implements OnInit, OnDestroy {
  activatedRoute = inject(ActivatedRoute)
  roomService = inject(RoomService)

  roomData: Room | null = null
  users: User[] = []
  game: Game | null = null

  userGamePlayer: GamePlayer | null = null

  userId: string = ""
  username: string = ""

  ngOnInit() {
    let room = this.activatedRoute.snapshot.params["id"]
    this.userId = localStorage.getItem('auth-id') || ""
    this.username = localStorage.getItem('auth-username') || ""

    if (room) {
      this.roomService.connect(room)

      this.roomService.roomData$.subscribe(data => {
        this.roomData = data
      })

      this.roomService.users$.subscribe(data => {
        this.users = data
      })

      this.roomService.game$.subscribe(data => {
        this.game = data
        this.userGamePlayer = this.getUserRole()
      })
    }

    window.addEventListener("beforeunload", this.beforeUnloadHandler.bind(this))
  }

  ngOnDestroy() {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler.bind(this));
    this.roomService.disconnect();
  }

  updateIncludeDefault() { if (this.isADM()) this.roomService.updateIncludeDefault() }
  updateIncludeUser() { if (this.isADM()) this.roomService.updateIncludeUser() }
  updateImpostors() { if (this.isADM()) this.roomService.updateImpostors() }

  startGame() { if (this.isADM()) this.roomService.startGame() }

  finishGame() { if (this.isADM()) this.roomService.finishGame() }

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

  private beforeUnloadHandler(event: any): void {
    this.roomService.disconnect();
  }
}
