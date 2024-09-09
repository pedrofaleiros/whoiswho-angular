import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocalGameService } from '../../services/local-game.service';

@Component({
  selector: 'app-local-game-switches',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './local-game-switches.component.html',
})
export class LocalGameSwitchesComponent {

  service = inject(LocalGameService)

  useDefaultGameEnvs: boolean = this.service.getUseDefault()
  useUserGameEnvs: boolean = this.service.getUseUser()

  onUseDefaultChange(value: boolean) {
    this.service.setUseDefault(value)
  }

  onUseUserChange(value: boolean) {
    this.service.setUseUser(value)
  }
}
