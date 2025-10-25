import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse } from '../types/auth-response.type';
import { tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  API_URL = `${environment.API_URL}/auth`

  constructor(private _httpClient: HttpClient) { }

  private saveAuth(value: AuthResponse) {
    localStorage.setItem("auth-token", value.token)
    localStorage.setItem("auth-username", value.username)
    localStorage.setItem("auth-id", value.id)
  }

  login(username: string, password: string) {
    return this._httpClient.post<AuthResponse>(
      `${this.API_URL}/login`,
      { username, password }
    ).pipe(
      tap((value) => this.saveAuth(value))
    )
  }

  signup(username: string, password: string) {
    return this._httpClient.post<AuthResponse>(
      `${this.API_URL}/signup`,
      { username, password }
    ).pipe(
      tap((value) => this.saveAuth(value))
    )
  }

  loginGuest(username: string) {
    return this._httpClient.post<AuthResponse>(
      `${this.API_URL}/guest`,
      { username }
    ).pipe(
      tap((value) => this.saveAuth(value))
    )
  }

  update(username: string) {
    return this._httpClient.put<AuthResponse>(
      `${this.API_URL}/update`,
      { username }
    ).pipe(
      tap((value) => this.saveAuth(value))
    )
  }

  logout(router: Router) {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-username')
    localStorage.removeItem('auth-id')
    sessionStorage.removeItem("last-room")
    router.navigate(['login'])
  }

  loginWithGithub(scopes: string = 'read:user user:email') {
    const clientId = environment.GITHUB_CLIENT_ID;
    if (!clientId) {
      console.error('GITHUB_CLIENT_ID não configurado no environment');
      return;
    }

    const state = this.createRandomState();
    sessionStorage.setItem('gh-oauth-state', state);

    const redirectUri = `http://192.168.0.130:4200/auth/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
      state,
    });
    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    window.location.assign(authUrl);
  }

  private createRandomState(): string {
    try {
      const cryptoObj: Crypto | undefined = (window as any).crypto || (window as any).msCrypto;
      if (cryptoObj && 'getRandomValues' in cryptoObj) {
        const bytes = new Uint8Array(16);
        (cryptoObj as Crypto).getRandomValues(bytes);
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch { }
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  exchangeGithubCode(code: string) {
    return this._httpClient.post<AuthResponse>(
      `${this.API_URL}/github`,
      { code }
    ).pipe(
      tap((value) => this.saveAuth(value))
    );
  }
}
