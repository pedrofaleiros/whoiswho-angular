import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerRole } from '../../models/player-role';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-player-role-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './player-role-list.component.html',
})
export class PlayerRoleListComponent {

  @Input() playerRoles!: PlayerRole[]
  @Input() editable = false
  @Output() deletePlayerRole = new EventEmitter<string>();

  delete(id: string) {
    if (this.editable) {
      this.deletePlayerRole.emit(id)
    }
  }
}
