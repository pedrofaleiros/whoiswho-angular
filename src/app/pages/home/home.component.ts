import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBarComponent } from "../../components/app-bar/app-bar.component";
import { GameEnvListComponent } from "../../components/game-env-list/game-env-list.component";
import { LoginComponent } from "../login/login.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AppBarComponent, LoginComponent, RouterOutlet, GameEnvListComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent {

}
