import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameEnv } from '../../models/game-env';
import { PlayerRole } from '../../models/player-role';
import { PlayerRoleService } from '../../services/player-role.service';
import { CommonModule } from '@angular/common';
import { GameEnvService } from '../../services/game-env.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-edit-game-env',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './edit-game-env.component.html',
})
export class EditGameEnvComponent {

  toast = inject(ToastrService)
  router = inject(Router)
  gameEnvService = inject(GameEnvService)
  playerRoleService = inject(PlayerRoleService)
  activateRouter = inject(ActivatedRoute)

  gameEnv = new GameEnv("", "")
  playerRolesList: PlayerRole[] = []
  newPlayerRole = new PlayerRole("", "")

  constructor() {
    let id = this.activateRouter.snapshot.params['id']

    if (id) {
      this.findById(id)
    }
  }

  findById(id: string) {
    this.gameEnvService.findById(id).subscribe({
      next: (data) => {
        this.gameEnv = data
        this.findPlayerRoles(this.gameEnv.id)
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(err.error.message)
        this.router.navigate(['home'])
      }
    })
  }

  findPlayerRoles(gameEnvId: string) {
    this.playerRoleService.findAll(gameEnvId).subscribe({
      next: (data) => {
        this.playerRolesList = data
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(err.error.message)
      }
    })
  }

  save() {
    if (this.gameEnv.name === '') return

    this.gameEnvService.update(this.gameEnv).subscribe({
      next: (_) => {
        this.toast.clear()
        this.toast.success("Salvo com sucesso!")
        // this.router.navigate(['home'])
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(err.error.message)
      }
    })
  }

  create() {

    if (this.newPlayerRole.name === "") {
      return
    }

    this.playerRoleService.create(this.newPlayerRole.name, this.gameEnv.id).subscribe({
      next: (data) => {
        this.newPlayerRole.name = ""
        this.playerRolesList.push(data)
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(err.error.message)
      }
    })
  }

  deleteGameEnv() {
    if (this.gameEnv.id === '') return

    if (confirm("Deletar ambiente")) {
      this.gameEnvService.delete(this.gameEnv.id).subscribe({
        next: (_) => {
          this.router.navigate(['home'])
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(err.error.message)
        }
      })
    }
  }

  deletePlayerRole(id: string) {

    if (confirm("Deletar papel?")) {
      this.playerRoleService.delete(id).subscribe({
        next: (_) => {
          this.findPlayerRoles(this.gameEnv.id)
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(err.error.message)
        }
      })
    }
  }

  navBack() {
    this.router.navigate(['home'])
  }
}
