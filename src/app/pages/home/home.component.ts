import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBarComponent } from "../../components/app-bar/app-bar.component";
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AppBarComponent, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  roomForm!: FormGroup
  lastRoom: string | null = null

  roomService = inject(RoomService)
  router = inject(Router)
  toast = inject(ToastrService)

  loadingEnter = false
  loadingLast = false
  loadingNew = false

  constructor() {
    this.roomForm = new FormGroup({
      roomId: new FormControl("")
    })
  }

  ngOnInit(): void {

    const state = history.state
    history.replaceState({}, '', this.router.url)

    if (state.errorMessage) {
      this.toast.clear()
      this.toast.error(state.errorMessage)
    }

    let findLastRoom = sessionStorage.getItem('last-room')
    if (findLastRoom) {
      this.lastRoom = findLastRoom
    }
  }

  createRoom() {
    if (this.loadingEnter || this.loadingLast || this.loadingNew) return

    this.loadingNew = true
    this.roomService.createRoom().subscribe({
      next: (data) => {
        // this.router.navigate(['room', data])
        this.router.navigate(['play', data])
      },
      error: (err) => {
        this.loadingNew = false
      }
    })
  }

  navigateRoom() {
    if (this.loadingEnter || this.loadingLast || this.loadingNew) return

    let roomId = this.roomForm.value.roomId
    if (roomId) {
      this.loadingEnter = true
      // this.router.navigate(['room', roomId])
      this.router.navigate(['play', roomId])
    }
  }

  navigateLastRoom() {
    if (this.loadingEnter || this.loadingLast || this.loadingNew) return

    if (this.lastRoom) {
      this.loadingLast = true
      // this.router.navigate(['room', this.lastRoom])
      this.router.navigate(['play', this.lastRoom])
    }
  }
}
