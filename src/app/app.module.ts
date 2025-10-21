import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

// Reusable standalone components
import { AppBarComponent } from './components/app-bar/app-bar.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { DefaultGameEnvComponent } from './components/default-game-env/default-game-env.component';
import { GameEnvInputComponent } from './components/game-env-input/game-env-input.component';
import { GameEnvListComponent } from './components/game-env-list/game-env-list.component';
import { ImpostorsButtonComponent } from './components/impostors-button/impostors-button.component';
import { NavGameEnvButtonComponent } from './components/nav-game-env-button/nav-game-env-button.component';
import { PlayerRoleListComponent } from './components/player-role-list/player-role-list.component';
import { RoomSwitchesComponent } from './components/room-switches/room-switches.component';
import { UserGameEnvComponent } from './components/user-game-env/user-game-env.component';
import { UsersListComponent } from './components/users-list/users-list.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,

    // standalone components to re-export
    AppBarComponent,
    BackButtonComponent,
    DefaultGameEnvComponent,
    GameEnvInputComponent,
    GameEnvListComponent,
    ImpostorsButtonComponent,
    NavGameEnvButtonComponent,
    PlayerRoleListComponent,
    RoomSwitchesComponent,
    UserGameEnvComponent,
    UsersListComponent,
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,

    // re-export reusable components
    AppBarComponent,
    BackButtonComponent,
    DefaultGameEnvComponent,
    GameEnvInputComponent,
    GameEnvListComponent,
    ImpostorsButtonComponent,
    NavGameEnvButtonComponent,
    PlayerRoleListComponent,
    RoomSwitchesComponent,
    UserGameEnvComponent,
    UsersListComponent,
  ],
})
export class AppModule {}

