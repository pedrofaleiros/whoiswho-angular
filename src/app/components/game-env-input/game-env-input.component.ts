import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameEnv } from '../../models/game-env';

@Component({
  selector: 'app-game-env-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-env-input.component.html',
})
export class GameEnvInputComponent {

  @Input() newGameEnv!: GameEnv;
  @Input() errorMessage!: string | null;
  @Output() createGameEnv = new EventEmitter<void>();

  onClick() {
    this.createGameEnv.emit()
  }
}
