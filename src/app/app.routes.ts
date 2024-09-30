import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuardService } from './services/auth-guard.service';
import { SignupComponent } from './pages/signup/signup.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MainComponent } from './pages/main/main.component';
import { GameEnvsComponent } from './pages/game-envs/game-envs.component';
import { LocalGameComponent } from './pages/local-game/local-game.component';
import { PlayLocalGameComponent } from './pages/play-local-game/play-local-game.component';
import { RoomComponent } from './pages/room/room.component';

export const routes: Routes = [
    { path: "", redirectTo: "home", pathMatch: "full" },
    { path: "login", component: LoginComponent },
    { path: "signup", component: SignupComponent },
    {
        path: "room/:id",
        component: RoomComponent,
        canActivate: [AuthGuardService]
    },
    {
        path: "",
        component: MainComponent,
        canActivate: [AuthGuardService],
        children: [
            { path: "home", component: HomeComponent },
            { path: "profile", component: ProfileComponent },
            { path: "gameEnvs", component: GameEnvsComponent },
            { path: "game", component: LocalGameComponent },
            { path: "play", component: PlayLocalGameComponent },
        ]
    },
    { path: "**", redirectTo: "home" }
];
