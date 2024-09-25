import { Component, inject } from '@angular/core';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { LocalGameService } from '../../services/local-game.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NavGameEnvButtonComponent } from "../../components/nav-game-env-button/nav-game-env-button.component";
import { LocalGameSwitchesComponent } from "../../components/local-game-switches/local-game-switches.component";
import { LocalGame } from '../../models/local-game';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-local-game',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, FormsModule, MatIconModule, NavGameEnvButtonComponent, LocalGameSwitchesComponent],
  templateUrl: './local-game.component.html',
})
export class LocalGameComponent {

  router = inject(Router)
  service = inject(LocalGameService)
  toast = inject(ToastrService)

  newPlayer = ""

  impostors: number = this.service.getImpostors()

  setImpostors() {
    this.service.setImpostors(this.impostors == 1 ? 2 : this.impostors == 2 ? 3 : 1)
    this.impostors = this.service.getImpostors()
  }

  getList(): string[] {
    return this.service.players
  }

  addPlayer() {
    if (this.newPlayer === "") return
    if (this.newPlayer.length > 32) {
      this.toast.error("Nome deve ter no máximo 32 caracteres")
      return
    }

    this.service.addPlayer(this.newPlayer)
    this.newPlayer = ""
  }

  removePlayer(index: number) {
    if (confirm("Remover jogador?")) {
      this.service.removePlayer(index)
    }
  }

  startGame() {
    let len = this.service.players.length
    if (len < 3) return

    if (this.impostors > len / 2) return

    if (!this.service.useUserGameEnvs && !this.service.useDefaultGameEnvs) return

    let data = this.service.getGameData()
    this.service.setGame(new LocalGame("", []))

    this.service.startGame(data).subscribe({
      next: (data: LocalGame) => {
        this.service.setGame(data)
        this.router.navigate(['play'])
      },
      error: (err: HttpErrorResponse) => {

      }
    })
  }
}
