import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GameEnv } from '../../models/game-env';
import { GameEnvService } from '../../services/game-env.service';

@Component({
  selector: 'app-game-envs',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './game-envs.component.html',
})
export class GameEnvsComponent {

  location = inject(Location)
  gameEnvService = inject(GameEnvService)

  userGameEnvs: GameEnv[] = []
  defaultGameEnvs: GameEnv[] = []

  items = [
    { label: 'Meus Ambientes' },
    { label: 'Padrão' },
  ];

  activeIndex = 0;

  constructor() {
    this.findGameEnvs()
  }

  findGameEnvs() {
    this.findUserGameEnvs()
    this.findDefaultGameEnvs()
  }

  findUserGameEnvs() {
    this.gameEnvService.findAll().subscribe({
      next: (data) => {
        this.userGameEnvs = data
      },
      error: (err) => {

      }
    })
  }

  findDefaultGameEnvs() {
    this.gameEnvService.findAllDefault().subscribe({
      next: (data) => {
        this.defaultGameEnvs = data
      },
      error: (err) => {

      }
    })
  }

  setActive(index: number) {
    this.activeIndex = index
  }

  navigateBack() {
    this.location.back()
  }
}
