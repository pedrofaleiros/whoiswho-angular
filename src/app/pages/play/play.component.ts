import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Room, User } from '../../models/room';
import { CommonModule } from '@angular/common';
import { UsersListComponent } from "../../components/users-list/users-list.component";
import { RoomSwitchesComponent } from "../../components/room-switches/room-switches.component";
import { ImpostorsButtonComponent } from "../../components/impostors-button/impostors-button.component";
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { Game, GamePlayer } from '../../models/game';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [CommonModule, UsersListComponent, RoomSwitchesComponent, ImpostorsButtonComponent, BackButtonComponent, MatIconModule],
  templateUrl: './play.component.html',
})
export class PlayComponent implements OnInit, OnDestroy {

  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  socketService = inject(SocketService);

  private subs: Subscription = new Subscription()

  userId: string = ""
  username: string = ""

  roomId: string | null = null;
  users: User[] = [];
  roomData: Room | null = null;
  games: Game[] = [];
  countDown: string | null = null;

  isLoading = true;

  ngOnInit() {
    this.roomId = this.activatedRoute.snapshot.params["id"];
    this.userId = localStorage.getItem('auth-id') || ""
    this.username = localStorage.getItem('auth-username') || ""
    if (this.roomId) {
      this.socketService.joinRoom(this.roomId);
    }

    this.subs.add(
      this.socketService.users$.subscribe(data => {
        this.users = data;
      })
    );

    this.subs.add(
      this.socketService.roomData$.subscribe(data => {
        this.roomData = data;
      })
    );

    this.subs.add(
      this.socketService.games$.subscribe(data => {
        this.games = data;

        let latest = this.getLatestGame();
        if (latest) {
          this.userGamePlayer = this.getUserRole(latest);
        }

        this.showGameIndex = data.length - 1;
      })
    );

    this.subs.add(
      this.socketService.countDown$.subscribe(data => {
        this.countDown = data;
      })
    );

    this.subs.add(
      this.socketService.isLoading$.subscribe(data => {
        this.isLoading = data;
      })
    )
  }

  ngOnDestroy() {
    this.socketService.leaveRoom();
    this.subs.unsubscribe();
  }

  leaveRoom() {
    this.socketService.leaveRoom();
    this.router.navigate(["home"]);
  }

  isADM() {
    // return this.userId === this.roomData?.owner.id
    return this.userId === this.roomData?.ownerId;
  }

  showGameIndex = 0;
  addShowGameIndex() {
    if (this.showGameIndex + 1 < this.games.length) this.showGameIndex++;
  }
  lessShowGameIndex() {
    if (this.showGameIndex - 1 >= 0) this.showGameIndex--;
  }

  userGamePlayer: GamePlayer | null = null;
  getUserRole(game: Game): GamePlayer | null {
    let index = game.gamePlayers.findIndex(el => el.user.id == this.userId);
    if (index == -1) {
      return null;
    }
    return game.gamePlayers[index];
  }

  getLatestGame(): Game | null {
    if (this.games.length > 0) return this.games[this.games.length - 1];
    return null;
  }
}
