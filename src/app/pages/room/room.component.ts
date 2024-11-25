import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { FormsModule } from '@angular/forms';
import { Room, User } from '../../models/room';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { Game, GamePlayer } from '../../models/game';
import { Subscription, timeout } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { UsersListComponent } from "../../components/users-list/users-list.component";
import { ImpostorsButtonComponent } from "../../components/impostors-button/impostors-button.component";
import { RoomSwitchesComponent } from "../../components/room-switches/room-switches.component";

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [FormsModule, CommonModule, BackButtonComponent, MatIconModule, UsersListComponent, ImpostorsButtonComponent, RoomSwitchesComponent],
  templateUrl: './room.component.html',
})
export class RoomComponent implements OnInit, OnDestroy {
  router = inject(Router)
  activatedRoute = inject(ActivatedRoute)
  roomService = inject(RoomService)

  private subs: Subscription = new Subscription()

  isLoading = true
  roomData: Room | null = null
  users: User[] = []
  game: Game | null = null
  gamesList: Game[] = []
  userGamePlayer: GamePlayer | null = null
  countDown: number | null = null

  showGameIndex = 0;

  addShowGameIndex() {
    if (this.showGameIndex + 1 < this.gamesList.length) {
      this.showGameIndex++
    }
  }

  lessShowGameIndex() {
    if (this.showGameIndex - 1 >= 0) {
      this.showGameIndex--
    }
  }

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
          this.gamesList = data.reverse()
          this.showGameIndex = 0
        })
      )

      this.subs.add(
        this.roomService.isLoading$.subscribe(data => {
          this.isLoading = data
        })
      )
    } else {
      this.router.navigate(['home'])
    }

    window.addEventListener("beforeunload", this.beforeUnloadHandler.bind(this))

    if (this.roomService.stompClient == null) {
      setTimeout(() => {
        if (this.roomService.stompClient == null) {
          this.router.navigate(['home'])
        }
      }, 5000);
    }
  }

  isADM() {
    // return this.username === this.roomData?.owner.username
    return this.userId === this.roomData?.owner.id
  }

  getUserRole(): GamePlayer | null {
    if (this.game) {
      // let index = this.game.gamePlayers.findIndex(el => el.user.username == this.username)
      let index = this.game.gamePlayers.findIndex(el => el.user.id == this.userId)
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
