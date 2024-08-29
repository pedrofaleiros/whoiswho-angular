import { Component } from '@angular/core';
import { GameEnvListComponent } from '../../components/game-env-list/game-env-list.component';

@Component({
  selector: 'app-game-env',
  standalone: true,
  imports: [GameEnvListComponent],
  templateUrl: './game-env.component.html',
})
export class GameEnvComponent {

}
