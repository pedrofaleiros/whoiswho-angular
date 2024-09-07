import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GameEnv } from '../../models/game-env';
import { PlayerRole } from '../../models/player-role';
import { PlayerRoleService } from '../../services/player-role.service';
import { PlayerRoleListComponent } from "../player-role-list/player-role-list.component";
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-game-env',
  standalone: true,
  imports: [MatIconModule, CommonModule, PlayerRoleListComponent, FormsModule],
  templateUrl: './user-game-env.component.html',
})
export class UserGameEnvComponent {

  toast = inject(ToastrService)
  playerRoleService = inject(PlayerRoleService)
  @Input() gameEnv!: GameEnv
  @Output() deleteGameEnv = new EventEmitter<void>();

  newPlayerRole = new PlayerRole('', '')
  expand = false;
  loading = true

  playerRoles: PlayerRole[] = []

  setExpand() {
    this.expand = !this.expand

    if (this.expand && this.playerRoles.length === 0) {
      this.findPlayerRoles()
    }
  }

  createPlayerRole() {
    this.toast.clear()
    if (this.newPlayerRole.name === "") return
    this.playerRoleService.create(this.newPlayerRole.name, this.gameEnv.id).subscribe({
      next: (data) => {
        this.newPlayerRole = new PlayerRole('', '')
        this.playerRoles.push(data)
        this.playerRoles.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(err.error.message)
      }
    })
  }

  deletePlayerRole(id: string) {
    if (confirm('Deletar papel?')) {
      this.playerRoleService.delete(id).subscribe({
        next: (data) => {
          this.playerRoles = this.playerRoles.filter(el => el.id !== id);
        },
        error: (err) => {

        }
      })
    }
  }

  findPlayerRoles() {
    this.playerRoleService.findAll(this.gameEnv.id).subscribe({
      next: (data) => {
        this.playerRoles = data
        this.loading = false
      },
      error: (err) => {
        this.loading = false
      }
    })
  }

  delete() {
    this.deleteGameEnv.emit()
  }
}
