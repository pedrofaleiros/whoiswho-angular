import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuardService } from './services/auth-guard.service';
import { SignupComponent } from './pages/signup/signup.component';
import { EditGameEnvComponent } from './pages/edit-game-env/edit-game-env.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
    { path: "", redirectTo: "home", pathMatch: 'full' },
    { path: "login", component: LoginComponent },
    { path: "signup", component: SignupComponent },
    {
        path: "",
        component: HomeComponent,
        canActivate: [AuthGuardService],
        children: [
            { path: "home", component: ProfileComponent },
            { path: "gameEnv/:id", component: EditGameEnvComponent },
            { path: "gameEnv", component: EditGameEnvComponent }
        ]
    },
    { path: "**", redirectTo: "login" },
];
