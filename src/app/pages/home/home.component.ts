import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBarComponent } from "../../components/app-bar/app-bar.component";
import { GameEnvListComponent } from "../../components/game-env-list/game-env-list.component";
import { LoginComponent } from "../login/login.component";
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AppBarComponent, LoginComponent, RouterOutlet, GameEnvListComponent, FormsModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {

  room: string = ''

  router = inject(Router)

  navigateLocalGame() {
    this.router.navigate(['game'])
  }

  navigateRoom() {
    this.router.navigate(['room', this.room])
  }
}
