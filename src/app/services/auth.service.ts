import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthResponse } from '../types/auth-response.type';
import { tap } from 'rxjs';
import { Router } from '@angular/router';
import { LocalGameService } from './local-game.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  localGameService = inject(LocalGameService)
  API_URL = "http://192.168.0.130:8080/auth"
  httpClient = inject(HttpClient)

  constructor() { }

  login(username: string, password: string) {
    return this.httpClient.post<AuthResponse>(
      `${this.API_URL}/login`,
      { username, password }
    ).pipe(
      tap((value) => {
        localStorage.setItem("auth-token", value.token)
        localStorage.setItem("auth-username", value.username)
        localStorage.setItem("auth-id", value.id)
      })
    )
  }

  signup(username: string, password: string) {
    return this.httpClient.post<AuthResponse>(
      `${this.API_URL}/signup`,
      { username, password }
    ).pipe(
      tap((value) => {
        localStorage.setItem("auth-token", value.token)
        localStorage.setItem("auth-username", value.username)
        localStorage.setItem("auth-id", value.id)
      })
    )
  }

  update(username: string) {
    return this.httpClient.put<AuthResponse>(
      `${this.API_URL}/update`,
      { username }
    ).pipe(
      tap((value) => {
        localStorage.setItem("auth-token", value.token)
        localStorage.setItem("auth-username", value.username)
        localStorage.setItem("auth-id", value.id)
      })
    )
  }

  logout(router: Router) {
    this.localGameService.clear()
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-username')
    localStorage.removeItem('auth-id')
    router.navigate(['login'])
  }
}
