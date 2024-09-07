import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GameEnv } from '../../models/game-env';
import { PlayerRole } from '../../models/player-role';
import { PlayerRoleService } from '../../services/player-role.service';
import { PlayerRoleListComponent } from "../player-role-list/player-role-list.component";

@Component({
  selector: 'app-default-game-env',
  standalone: true,
  imports: [MatIconModule, CommonModule, PlayerRoleListComponent],
  templateUrl: './default-game-env.component.html',
})
export class DefaultGameEnvComponent {

  playerRoleService = inject(PlayerRoleService)
  @Input() gameEnv!: GameEnv
  expand = false;
  loading = true

  playerRoles: PlayerRole[] = []

  setExpand() {
    this.expand = !this.expand

    if (this.expand && this.playerRoles.length === 0) {
      this.findPlayerRoles()
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
}
