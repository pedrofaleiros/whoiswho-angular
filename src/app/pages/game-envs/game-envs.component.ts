import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AppModule } from '../../app.module';
import { GameEnv } from '../../models/game-env';
import { GameEnvService } from '../../services/game-env.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-game-envs',
  standalone: true,
  imports: [AppModule],
  templateUrl: './game-envs.component.html',
})
export class GameEnvsComponent {

  toast = inject(ToastrService)
  gameEnvService = inject(GameEnvService)

  userGameEnvs: GameEnv[] = []
  defaultGameEnvs: GameEnv[] = []

  newGameEnv = new GameEnv("", "")
  errorMessage: string | null = null

  items = [
    { label: 'Meus Ambientes' },
    { label: 'Padrão' },
  ];

  activeIndex = 0;

  constructor() {
    this.findGameEnvs()
  }

  createGameEnv() {
    this.toast.clear()
    this.errorMessage = null
    if (this.newGameEnv.name === '') return

    this.gameEnvService.create(this.newGameEnv.name).subscribe({
      next: (data) => {
        this.toast.success("Adicionado com sucesso")
        this.newGameEnv = new GameEnv('', '')
        this.userGameEnvs.push(data)
        this.userGameEnvs.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error.message
      }
    })
  }

  deleteGameEnv(id: string) {
    this.toast.clear()
    if (confirm("Deletar ambiente?")) {
      this.gameEnvService.delete(id).subscribe({
        next: (data) => {
          this.toast.success("Deletado com sucesso")
          this.userGameEnvs = this.userGameEnvs.filter(env => env.id !== id);
        },
        error: (err) => {

        }
      })
    }
  }

  findGameEnvs() {
    this.findUserGameEnvs()
    this.findDefaultGameEnvs()
  }

  findUserGameEnvs() {
    this.gameEnvService.findAll().subscribe({
      next: (data) => {
        this.userGameEnvs = data
        this.userGameEnvs.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => {

      }
    })
  }

  findDefaultGameEnvs() {
    this.gameEnvService.findAllDefault().subscribe({
      next: (data) => {
        this.defaultGameEnvs = data
        this.defaultGameEnvs.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => {

      }
    })
  }

  setActive(index: number) {
    this.activeIndex = index
  }

}
