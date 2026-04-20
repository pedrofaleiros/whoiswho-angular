import { appConfig } from './app.config';
import { routes } from './app.routes';
import { AuthGuardService } from './services/auth-guard.service';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { LoginGuestComponent } from './pages/login-guest/login-guest.component';
import { PlayComponent } from './pages/play/play.component';
import { MainComponent } from './pages/main/main.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { GameEnvsComponent } from './pages/game-envs/game-envs.component';
import { environment } from '../environment/environment';
import { environment as environmentProd } from '../environment/environment.prod';

describe('app setup', () => {
  it('exposes the expected application providers', () => {
    expect(Array.isArray(appConfig.providers)).toBeTrue();
    expect(appConfig.providers?.length).toBe(5);
  });

  it('defines the expected routes', () => {
    expect(routes[0]).toEqual({ path: '', redirectTo: 'home', pathMatch: 'full' });
    expect(routes[1].component).toBe(LoginComponent);
    expect(routes[2].component).toBe(SignupComponent);
    expect(routes[3].component).toBe(LoginGuestComponent);
    expect(routes[4].component).toBe(PlayComponent);
    expect(routes[4].canActivate).toEqual([AuthGuardService]);
    expect(routes[5].component).toBe(MainComponent);
    expect(routes[5].children?.map((route) => route.component)).toEqual([
      HomeComponent,
      ProfileComponent,
      GameEnvsComponent,
    ]);
    expect(routes[6]).toEqual({ path: '**', redirectTo: 'home' });
  });

  it('exports the expected environment settings', () => {
    expect(environment.production).toBeFalse();
    expect(environment.API_URL).toContain('whoiswho-api');
    expect(environment.SOCKET_URL).toContain('whoiswho-ws');

    expect(environmentProd.production).toBeTrue();
    expect(environmentProd.API_URL).toBe(environment.API_URL);
    expect(environmentProd.SOCKET_URL).toBe(environment.SOCKET_URL);
  });

  it('instantiates the main shell component', () => {
    expect(new MainComponent()).toBeTruthy();
  });
});
