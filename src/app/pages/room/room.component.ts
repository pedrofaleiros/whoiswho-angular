import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { FormsModule } from '@angular/forms';
import { Room } from '../../models/room';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from "../../components/back-button/back-button.component";

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

  userId: string = ""
  username: string = ""

  ngOnInit(): void {
    let room = this.activatedRoute.snapshot.params["id"]
    this.userId = localStorage.getItem('auth-id') || ""
    this.username = localStorage.getItem('auth-username') || ""

    if (room) {
      this.roomService.connect(room)

      this.roomService.roomData$.subscribe(data => {
        this.roomData = data
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

  //TODO: comparar pelo ID
  isADM() {
    return this.username === this.roomData?.owner.username
  }
  isMe(username: string) {
    return this.username === username
  }

  private beforeUnloadHandler(event: any): void {
    this.roomService.disconnect();
  }
}
