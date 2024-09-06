import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthResponse } from '../types/auth-response.type';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  API_URL = "http://192.168.0.129:8080/auth"
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
      })
    )
  }

  logout(router: Router) {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-username')
    router.navigate(['login'])
  }
}
