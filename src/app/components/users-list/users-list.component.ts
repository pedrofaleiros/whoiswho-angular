import { Component, Input } from '@angular/core';
import { User } from '../../models/room';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-list.component.html',
})
export class UsersListComponent {

  @Input() users!: User[]
  @Input() ownerId!: string

  username: string = ""
  userId: string = ""

  constructor() {
    this.userId = localStorage.getItem('auth-id') || ""
    this.username = localStorage.getItem('auth-username') || ""
  }

  isMe(id: string) {
    return this.userId === id
  }

}
