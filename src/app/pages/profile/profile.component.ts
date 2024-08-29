import { Component } from '@angular/core';
import { GameEnvListComponent } from "../../components/game-env-list/game-env-list.component";
import { AppBarComponent } from "../../components/app-bar/app-bar.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [GameEnvListComponent, AppBarComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {

}
