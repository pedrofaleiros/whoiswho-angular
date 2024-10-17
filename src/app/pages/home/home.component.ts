import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBarComponent } from "../../components/app-bar/app-bar.component";
import { GameEnvListComponent } from "../../components/game-env-list/game-env-list.component";
import { LoginComponent } from "../login/login.component";
import { Router, RouterOutlet } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AppBarComponent, LoginComponent, RouterOutlet, GameEnvListComponent, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  roomForm!: FormGroup

  lastRoom: string | null = null

  roomService = inject(RoomService)
  router = inject(Router)

  constructor() {
    this.roomForm = new FormGroup({
      roomId: new FormControl("")
    })
  }

  ngOnInit(): void {
    let findLastRoom = sessionStorage.getItem('last-room')
    if (findLastRoom) {
      this.lastRoom = findLastRoom
    }
  }

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

  navigateLastRoom() {
    if (this.lastRoom) {
      this.router.navigate(['room', this.lastRoom])
    }
  }
}
