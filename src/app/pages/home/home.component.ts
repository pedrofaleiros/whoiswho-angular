import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBarComponent } from "../../components/app-bar/app-bar.component";
import { GameEnvListComponent } from "../../components/game-env-list/game-env-list.component";
import { LoginComponent } from "../login/login.component";
import { Router, RouterOutlet } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AppBarComponent, LoginComponent, RouterOutlet, GameEnvListComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {

  roomForm!: FormGroup

  roomService = inject(RoomService)
  router = inject(Router)

  constructor() {
    this.roomForm = new FormGroup({
      roomId: new FormControl("")
    })
  }

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
    let roomId = this.roomForm.value.roomId
    if (roomId) {
      this.router.navigate(['room', roomId])
    }
  }
}
