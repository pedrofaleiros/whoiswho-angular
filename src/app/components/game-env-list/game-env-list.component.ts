import { Component, inject } from '@angular/core';
import { GameEnvService } from '../../services/game-env.service';
import { GameEnv } from '../../models/game-env';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-game-env-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './game-env-list.component.html',
})
export class GameEnvListComponent {

  toast = inject(ToastrService)
  router = inject(Router)
  gameEnvService = inject(GameEnvService)
  gameEnvs: GameEnv[] = []
  newGameEnv = new GameEnv("", "")

  constructor() {
    this.findAll()
  }

  findAll() {
    this.gameEnvService.findAll().subscribe({
      next: (data) => {
        this.gameEnvs = data
      },
      error: (err: HttpErrorResponse) => {
        console.log(err)
      }
    })
  }

  edit(gameEnv: GameEnv) {
    this.router.navigate(['/gameEnv', gameEnv.id])
  }

  create() {
    if (this.newGameEnv.name === '') return

    this.gameEnvService.create(this.newGameEnv.name).subscribe({
      next: (data) => {
        this.gameEnvs.push(data)
        this.newGameEnv.name = ""
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(err.error.message)
      }
    })
  }
}
