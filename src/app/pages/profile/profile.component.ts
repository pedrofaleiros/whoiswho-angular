import { Component, inject } from '@angular/core';
import { GameEnvListComponent } from "../../components/game-env-list/game-env-list.component";
import { AppBarComponent } from "../../components/app-bar/app-bar.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [GameEnvListComponent, AppBarComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {

  router = inject(Router)

  logout() {
    if (confirm("Deseja sair da conta?")) {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('auth-username')
      this.router.navigate(['login'])
    }
  }
}
