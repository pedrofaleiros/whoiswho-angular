import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBarComponent } from "../../components/app-bar/app-bar.component";
import { GameEnvListComponent } from "../../components/game-env-list/game-env-list.component";
import { LoginComponent } from "../login/login.component";
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AppBarComponent, LoginComponent, RouterOutlet, GameEnvListComponent, FormsModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {

  room: string = ''

  roomService = inject(RoomService)
  router = inject(Router)

  // navigateLocalGame() {
  //   this.router.navigate(['game'])
  // }

  createRoom() {
    this.roomService.createRoom().subscribe({
      next: (data) => {
        this.router.navigate(['room', data])
      },
      error: (err) => {

      }
    })
  }

  navigateRoom() {
    this.router.navigate(['room', this.room])
  }
}
