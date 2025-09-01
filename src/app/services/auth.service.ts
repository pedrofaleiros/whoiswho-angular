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

  login(username: string, password: string) {
    return this._httpClient.post<AuthResponse>(
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
    return this._httpClient.post<AuthResponse>(
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

  loginGuest(username: string) {
    return this._httpClient.post<AuthResponse>(
      `${this.API_URL}/guest`,
      { username }
    ).pipe(
      tap((value) => {
        localStorage.setItem("auth-token", value.token)
        localStorage.setItem("auth-username", value.username)
        localStorage.setItem("auth-id", value.id)
      })
    )
  }

  update(username: string) {
    return this._httpClient.put<AuthResponse>(
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
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-username')
    localStorage.removeItem('auth-id')
    sessionStorage.removeItem("last-room")
    router.navigate(['login'])
  }
}
